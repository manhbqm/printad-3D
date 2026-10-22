// @ts-nocheck

const Utils = {};

// Helper: Get unique paper types for dropdown
// For roll-based papers (decal), return each individual type
// For sheet-based papers, group by type + brand + gsm
Utils.getUniquePapers = function (papers) {
    const uniqueMap = new Map();

    for (const paper of papers) {
        // For roll-based papers (decal), use the paper ID as key to preserve all types
        if (paper.isRoll) {
            uniqueMap.set(paper.id, {
                id: paper.id,
                name: paper.name,
                type: paper.type,
                brand: paper.brand || 'standard',
                gsm: paper.gsm,
                isRoll: true
            });
        } else {
            // For sheet-based papers, group by type + brand + gsm
            const brand = paper.brand || 'standard';
            const key = `${paper.type}_${brand}_${paper.gsm}`;

            if (!uniqueMap.has(key)) {
                // Extract display name without size info
                let displayName = paper.name.replace(/\s*\([^)]*\)\s*$/, '').trim();

                uniqueMap.set(key, {
                    id: key,
                    name: displayName,
                    type: paper.type,
                    brand: brand,
                    gsm: paper.gsm
                });
            }
        }
    }

    return Array.from(uniqueMap.values());
};

// New Helper: Get all sizes for a paper type and gsm
Utils.getAllPaperSizes = function (papers, type, gsm, brand = 'standard') {
    return papers.filter(p =>
        p.type === type &&
        p.gsm === gsm &&
        (p.brand || 'standard') === brand
    );
};

// Helper: Resolve paper candidates from ID (Exact, Generic, or Legacy)
Utils.resolvePaperCandidates = function (paperId, papers) {
    if (!paperId) return [];

    // 1. Try exact match
    const exact = papers.find(p => p.id === paperId);
    if (exact) return [exact];

    // 2. Try generic type_brand_gsm or legacy codes
    let type = '';
    let brand = 'standard';
    let gsm = 0;

    if (paperId.includes('_')) {
        const parts = paperId.split('_');
        const gsmStr = parts.pop();
        gsm = parseInt(gsmStr);

        if (parts.length >= 1) {
            const potentialBrand = parts[parts.length - 1];
            const knownBrands = ['standard', 'pindo', 'hikote', 'pp', 'paper', 'ningbo', 'kraft', 'vo'];

            if (knownBrands.includes(potentialBrand)) {
                brand = parts.pop();
            } else {
                brand = 'standard';
            }
            type = parts.join('_');
        }
    } else {
        // 3. Try Legacy Codes (c80, off150, etc.)
        const match = paperId.match(/^([a-z]+)(\d+)$/);
        if (match) {
            const prefix = match[1];
            gsm = parseInt(match[2]);

            const typeMap = {
                'c': 'couche',
                'cp': 'couche',
                'chk': 'couche',
                'off': 'offset',
                'f': 'ford',
                'k': 'kraft',
                'iv': 'ivory',
                'b': 'bristol',
                'd': 'duplex'
            };

            // Refine brand from prefix
            if (prefix === 'cp') brand = 'pindo';
            else if (prefix === 'chk') brand = 'hikote';
            else if (prefix === 'iv' || prefix === 'ivory') brand = 'ningbo';

            type = typeMap[prefix] || prefix;
        }
    }

    if (type && gsm) {
        // Compatibility
        if (type === 'couche' && brand === 'standard') {
            brand = 'hikote';
        }
        return Utils.getAllPaperSizes(papers, type, gsm, brand);
    }

    return [];
};

// Helper to get derived paper sizes (cuts)
Utils.getDerivedPapers = function (basePaper) {
    const cuts = [];
    const baseSize = { w: basePaper.size.w, h: basePaper.size.h }; // Preserve original size

    // 1. Full Sheet
    cuts.push({ ...basePaper, cutName: 'Full', cutsFromBase: 1, baseSize });

    // 2. Half Sheet (Cut Width)
    cuts.push({ ...basePaper, size: { w: basePaper.size.w / 2, h: basePaper.size.h }, cutName: '1/2 (Dọc)', cutsFromBase: 2, baseSize });

    // 3. Half Sheet (Cut Height)
    cuts.push({ ...basePaper, size: { w: basePaper.size.w, h: basePaper.size.h / 2 }, cutName: '1/2 (Ngang)', cutsFromBase: 2, baseSize });

    // 4. Quarter Sheet
    cuts.push({ ...basePaper, size: { w: basePaper.size.w / 2, h: basePaper.size.h / 2 }, cutName: '1/4', cutsFromBase: 4, baseSize });

    return cuts;
};

// Helper to calculate optimal layout
Utils.calculateOptimalLayout = function (paperSize, productSize) {
    let bestLayout = { cols: 0, rows: 0, total: 0, rotated: false, productW: productSize.w, productH: productSize.h };

    // Try normal orientation
    const cols1 = Math.floor(paperSize.w / productSize.w);
    const rows1 = Math.floor(paperSize.h / productSize.h);
    const total1 = cols1 * rows1;

    // Try rotated orientation
    const cols2 = Math.floor(paperSize.w / productSize.h);
    const rows2 = Math.floor(paperSize.h / productSize.w);
    const total2 = cols2 * rows2;

    if (total1 >= total2) {
        bestLayout = {
            cols: cols1,
            rows: rows1,
            total: total1,
            rotated: false,
            productW: productSize.w,
            productH: productSize.h
        };
    } else {
        bestLayout = {
            cols: cols2,
            rows: rows2,
            total: total2,
            rotated: true,
            productW: productSize.h, // Swapped for calculation/display relative to paper
            productH: productSize.w
        };
    }

    return bestLayout;
};

/**
 * Calculate printable area accounting for gripper margin
 * Gripper margin is always subtracted from the shorter dimension (height when width > height)
 * @param {Object} machineMaxSize - {width, height} in cm
 * @param {number} gripperMargin - Gripper margin in cm (default 1)
 * @returns {Object} {width, height} - Printable dimensions in cm
 */
Utils.getPrintableArea = function(machineMaxSize, gripperMargin = 1) {
    return {
        width: machineMaxSize.width,
        height: machineMaxSize.height - gripperMargin
    };
};

/**
 * Calculate waste sheets based on quantity and finishing requirements
 * 
 * @param {number} totalCutSheets - Total sheets needed for production
 * @param {boolean} hasFinishing - Whether finishing is required
 * @param {boolean} isCatalogue - Whether this is a catalogue product
 * @returns {number} Number of waste sheets to add
 */
Utils.calculateWaste = function(totalCutSheets, hasFinishing, isCatalogue) {
    if (isCatalogue) return Math.ceil(totalCutSheets * 0.20);
    if (totalCutSheets < 500) return Math.ceil(totalCutSheets * 0.20);
    return Math.ceil(totalCutSheets * (hasFinishing ? 0.10 : 0.05));
};

/**
 * Generate possible roll widths including splits for decal optimization
 * Allows cutting rolls into smaller widths to enable smaller machines and reduce costs
 * 
 * @param {Array<number>} availableWidths - Original roll widths in cm
 * @param {number} maxSplits - Maximum number of splits (default: 3, meaning up to 4 parts)
 * @returns {Array<{width: number, source: number, splits: number}>}
 * 
 * @example
 * generateRollWidths([53.5, 107])
 * // Returns:
 * // [
 * //   { width: 53.5, source: 53.5, splits: 1 },    // Original
 * //   { width: 26.75, source: 53.5, splits: 2 },   // Split in half (REJECTED - < 26cm)
 * //   { width: 107, source: 107, splits: 1 },      // Original
 * //   { width: 53.5, source: 107, splits: 2 },     // Split in half
 * //   { width: 35.67, source: 107, splits: 3 },    // Split in thirds
 * //   { width: 26.75, source: 107, splits: 4 }     // Split in quarters
 * // ]
 */
Utils.generateRollWidths = function(availableWidths, maxSplits = 3) {
    const widths = [];
    const minPracticalWidth = 26; // Minimum sheet width machines can handle (26cm constraint)
    
    for (const rollWidth of availableWidths) {
        // Always include original width
        widths.push({ 
            width: rollWidth, 
            source: rollWidth, 
            splits: 1 
        });
        
        // Generate split widths (2, 3, 4, ... splits)
        for (let splits = 2; splits <= maxSplits + 1; splits++) {
            const splitWidth = rollWidth / splits;
            
            // Only include if width meets minimum machine constraint
            if (splitWidth >= minPracticalWidth) {
                widths.push({ 
                    width: Math.round(splitWidth * 100) / 100, // Round to 2 decimals
                    source: rollWidth, 
                    splits 
                });
            }
        }
    }
    
    return widths;
};




export const getUniquePapers = (Utils as any).getUniquePapers;
export const getAllPaperSizes = (Utils as any).getAllPaperSizes;
export const resolvePaperCandidates = (Utils as any).resolvePaperCandidates;
export const getDerivedPapers = (Utils as any).getDerivedPapers;
export const calculateOptimalLayout = (Utils as any).calculateOptimalLayout;
export const getPrintableArea = (Utils as any).getPrintableArea;
export const calculateWaste = (Utils as any).calculateWaste;
export const generateRollWidths = (Utils as any).generateRollWidths;

export default Utils;
