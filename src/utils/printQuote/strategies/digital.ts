// @ts-nocheck
import { digitalPrices } from '../data';
import calculateUVDTF from './uvDtf';

/**
 * Main Digital Calculation Strategy
 */
const calculateDigital = function (request) {
    const { quantity } = request;


    if (isNaN(quantity) || quantity <= 0) throw new Error('Số lượng không hợp lệ!');

    if (request.productType === 'catalogue' && request.catalogueData) {
        return calculateCatalogue(request);
    }

    if (request.productType === 'uv_dtf') {
        return calculateUVDTF(request);
    }

    return calculateFlyer(request);
};

// --- HELPER FUNCTIONS ---

function calculateCatalogue(request) {
    const { quantity, designFee, shippingFee, profitMargin, catalogueData, finishingOptions } = request;
    const { totalPages, coverPaperId, contentPaperId, coverPrintColors, contentPrintColors, bindingType, catalogueSize } = catalogueData;

    if (isNaN(totalPages) || totalPages < 8) throw new Error('Số trang tối thiểu là 8!');

    // 1. Papers
    const coverPaper = digitalPrices.materials.find(p => p.id === coverPaperId);
    const contentPaper = digitalPrices.materials.find(p => p.id === contentPaperId);
    if (!coverPaper) throw new Error('Vui lòng chọn giấy bìa!');
    if (!contentPaper) throw new Error('Vui lòng chọn giấy ruột!');

    // 2. Sheets Calculation
    // Determine layout based on size (Default A4)
    // A4: 1 sheet SRA3 = 1 Cover (4 pages) | Content: 4 pages/sheet
    // A5: 1 sheet SRA3 = 2 Covers (8 pages) | Content: 8 pages/sheet
    const isA5 = catalogueSize === 'A5';

    const coverSheetsPerBook = isA5 ? 0.5 : 1;
    // Note: totalCoverSheets might be fractional? No, priceA3 is per sheet.
    // We should ceil total sheets if outputting total job cost.
    // But cost per unit logic: quantity * 0.5 is fine for average.
    // However, in production you print ceil(Qty/2) sheets.
    const totalCoverSheets = Math.ceil(quantity * coverSheetsPerBook);

    const contentPages = totalPages - 4;
    const pagesPerSheet = isA5 ? 8 : 4;
    const contentSheetsPerBook = contentPages / pagesPerSheet; // Keep fractional here for unit cost?
    // Actually better to calculate total needed sheets for job then divide.
    // jobContentSheets = ceil(total_job_pages / pages_per_sheet_layout) ?
    // Or ceil(pages_per_book / pages_per_sheet_layout) * quantity?
    // Usually books are printed book-by-book or batch.
    // Let's stick to total sheets for the whole job to precise material usage.
    // Total content pages for JOB = contentPages * quantity.
    // Total sheets SRA3 = ceil(Total Pages JOB / pagesPerSheet).
    // Wait, duplex? 
    // pagesPerSheet already accounts for duplex (e.g. 4 for A4 means 2 front 2 back).
    const totalContentSheets = Math.ceil((contentPages * quantity) / pagesPerSheet);

    // 3. Paper Cost
    const coverPaperCost = (totalCoverSheets * coverPaper.priceA3) / 1.08;
    const contentPaperCost = (totalContentSheets * contentPaper.priceA3) / 1.08;
    const totalPaperCost = coverPaperCost + contentPaperCost;

    // 4. Print Cost (Click Charge)
    // 4. Print Cost (Click Charge)
    const coverPassesPerBook = (coverPrintColors > 0 ? 4 : 0) * coverSheetsPerBook;
    // Wait, click charge is per A4 side? Or per SRA3 side?
    // Pricing data 'price' is per "Pass". Usually digital click is per click (one side of paper).
    // SRA3 usually counts as 1 click (sometimes 2 depending on contract). 
    // Let's assume standard A3/SRA3 click = 2 x A4 clicks if based on 'totalA4Passes'?
    // Previous code: totalA4Passes = ...
    // And priceList looks like "A4 Price".
    // So we need to convert everything to "A4 equivalents".
    // 1 SRA3 sheet (2 sides) = 4 A4 clicks?
    // coverSheetsPerBook (SRA3)
    // coverPasses = totalCoverSheets * (coverPrintColors > 0 ? 2 : 0) (sides) * 2 (A4 equivalent)?
    // Previous logic: coverPassesPerBook = 4. 
    // Implies 1 Sheet (2 sides) x 2 (A4 factor) = 4. Correct.

    // So for A5:
    // 1 Book uses 0.5 Sheet SRA3.
    // Cost should be 0.5 * 4 = 2 Passes.

    // New Logic using totals:
    // Total Sheets SRA3 = totalCoverSheets + totalContentSheets.
    // Total Sides = Total Sheets * 2 (if duplex).
    // However, some might be simplex.
    // Let's assume duplex for now as cover/content colors check > 0.

    // Correct Formula:
    // totalCoverSheets (SRA3)
    // totalContentSheets (SRA3)

    // A4 Passes Calculation (Implicitly accounts for sides)
    // SRA3 Sheet = 2 x A4 equivalents.
    // If Duplex (Colors > 0 for both sides imply duplex, or at least 2 sides printed):
    // Standard Digital Pricing usually assumes 4/0 or 4/4.
    // Here we calculate total "A4 Sides" printed.

    // Factor: 2 (A4 per SRA3) * (isDuplex ? 2 : 1)
    const coverSides = coverPrintColors > 0 ? 2 : 0; // Assuming 4/4 if colors present. Warning: Imprecise if 4/0.
    // Ideally request should have coverPrintSides.
    // Checking catalogueData from Main.js: currently passes 'coverPrintColors', not sides.
    // We will stick to current logic but document it:
    // "Assumes Duplex (2 sides) if colors > 0"

    const totalA4PassesCover = totalCoverSheets * 2 * (coverSides > 0 ? 2 : 0);
    const totalA4PassesContent = totalContentSheets * 2 * (contentPrintColors > 0 ? 2 : 0);

    const totalA4Passes = totalA4PassesCover + totalA4PassesContent;

    // Default lowest tier price if not found
    let printPricePerPass = digitalPrices.config.defaultPrintPrice;
    const priceList = digitalPrices.printing.color;
    const tier = priceList.find(t => totalA4Passes <= t.max);
    if (tier) printPricePerPass = tier.price;

    const totalPrintCost = (totalA4Passes * printPricePerPass) / 1.08;

    // 5. Finishing Cost (Binding + Lamination)
    let bindingCost = 0;
    let laminationCost = 0;

    // 5a. Binding
    if (bindingType && bindingType !== 'none') {
        const bindingPrices = digitalPrices.finishing.binding[bindingType];
        if (bindingPrices) {
            let unitBinding = 0;
            if (quantity < 50) unitBinding = bindingPrices.small;
            else if (quantity <= 200) unitBinding = bindingPrices.medium;
            else unitBinding = bindingPrices.large;

            bindingCost = (quantity * unitBinding) / 1.08;
        }
    }

    // 5b. Lamination (Cover Only)
    if (finishingOptions && finishingOptions.laminationType && finishingOptions.laminationType !== 'none') {
        const range = digitalPrices.finishing.lamination[finishingOptions.laminationType];
        // Use max price (small run) or min price (large run)? 
        // Logic in calculateFinishingCost uses totalSheets < 100 ? max : min.
        // Here totalCoverSheets = quantity.
        const pricePerSide = totalCoverSheets < 100 ? range.max : range.min;
        const sides = finishingOptions.laminationSides || 1;

        // A3 sheet = 2 x A4. Price in config is "per A4 side".
        // coverPaper.priceA3 implies we print on SRA3/A3.
        // So factor = 2.
        const a4Equiv = 2;

        laminationCost = (totalCoverSheets * a4Equiv * sides * pricePerSide) / 1.08;
    }

    // 6. Other Costs
    const designCost = getDesignCost(designFee);
    const shippingCost = shippingFee || 0;
    const finishingTotal = bindingCost + laminationCost;

    // Final Calculation
    const productionCost = totalPaperCost + totalPrintCost + finishingTotal;
    const profit = productionCost * ((profitMargin || 0) / 100);
    const totalCost = productionCost + profit + designCost + shippingCost;

    return {
        totalCost: totalCost,
        costPerUnit: totalCost / quantity,
        details: {
            machine: 'In Nhanh KTS (SRA3)',
            paper: `${coverPaper.name} (Bìa) + ${contentPaper.name} (Ruột)`,
            grossSheets: totalCoverSheets + totalContentSheets,
            wasteSheets: 0,
            productsPerSheet: 1,
            paperCost: totalPaperCost,
            printingCost: totalPrintCost,
            finishingCost: finishingTotal,
            bindingCost: bindingCost,
            laminationCost: laminationCost,
            designFee: designCost,
            shippingFee: shippingCost,
            profit: profit,
            layout: {
                paperW: 32, paperH: 45,
                productW: 21, productH: 29.7,
                cols: 2, rows: 1
            }
        }
    };
}

function calculateFlyer(request) {
    const { quantity, paperId, finishingOptions, printSides, printColors, designFee, shippingFee, profitMargin, productType } = request;

    // 1. Find Paper
    let paper = digitalPrices.materials.find(p => p.id === paperId);
    // Fallback: Find by name
    if (!paper && paperId) {
        paper = digitalPrices.materials.find(p => p.name === paperId || p.name.toLowerCase() === paperId.toLowerCase());
    }
    if (!paper) throw new Error(`Vui lòng chọn loại giấy! (Không tìm thấy: ${paperId})`);

    // 2. Auto-Nesting
    const productW = request.productSize.w;
    const productH = request.productSize.h;
    if (!productW || !productH) throw new Error('Kích thước sản phẩm không hợp lệ!');

    const bestLayout = findBestLayout(quantity, productW, productH, paper, printSides, printColors);

    // 3. Finishing Cost
    const finishingDetails = calculateFinishingCost(finishingOptions, bestLayout);
    const finishingCost = finishingDetails.total;

    // 4. Other Costs
    const designCost = getDesignCost(designFee);
    const shippingCost = shippingFee || 0;

    // Final Calculation
    const productionCost = bestLayout.paperCost + bestLayout.printCost + finishingCost;
    const profit = productionCost * ((profitMargin || 0) / 100);
    const totalCost = productionCost + profit + designCost + shippingCost;

    return {
        totalCost: totalCost,
        costPerUnit: totalCost / quantity,
        details: {
            machine: `In Nhanh KTS (${bestLayout.sheet.name}) - V1.8 FIXED`,
            paper: paper,
            grossSheets: bestLayout.totalSheets,
            wasteSheets: 0,
            productsPerSheet: bestLayout.pps,
            paperCost: bestLayout.paperCost,
            printingCost: bestLayout.printCost,
            finishingCost: finishingCost,
            laminationCost: finishingDetails.lamination || 0,
            dieCutCost: finishingDetails.dieCut || 0,
            plasticCost: finishingDetails.plastic || 0,
            designFee: designCost,
            shippingFee: shippingCost,
            profit: profit,
            layout: {
                paperW: bestLayout.sheet.w,
                paperH: bestLayout.sheet.h,
                productW: bestLayout.rotated ? productH : productW,
                productH: bestLayout.rotated ? productW : productH,
                cols: bestLayout.cols,
                rows: bestLayout.rows
            }
        }
    };
}

function findBestLayout(quantity, productW, productH, paper, printSides, printColors) {
    let bestLayout = null;
    let minWaste = Infinity;

    for (const sheet of digitalPrices.paperSizes) {
        // Fits?
        if ((productW > sheet.w || productH > sheet.h) && (productW > sheet.h || productH > sheet.w)) continue;

        // Items per sheet
        const pps1 = Math.floor(sheet.w / productW) * Math.floor(sheet.h / productH);
        const pps2 = Math.floor(sheet.w / productH) * Math.floor(sheet.h / productW);

        // Determine best orientation for this sheet
        let pps = 0;
        let rotated = false;
        let cols = 0;
        let rows = 0;

        if (pps1 >= pps2) {
            pps = pps1;
            cols = Math.floor(sheet.w / productW);
            rows = Math.floor(sheet.h / productH);
        } else {
            pps = pps2;
            rotated = true;
            cols = Math.floor(sheet.w / productH);
            rows = Math.floor(sheet.h / productW);
        }


        if (pps > 0) {
            const totalSheetsNeeded = Math.ceil(quantity / pps);

            // Paper Cost
            let paperPricePerSheet = (sheet.name === 'A4') ? paper.priceA4 : paper.priceA3;
            if (!paperPricePerSheet) continue;
            const totalPaperCost = (totalSheetsNeeded * paperPricePerSheet) / 1.08;

            // Print Cost
            const a4PassesPerSheet = (sheet.name === 'A4') ? 1 : 2;
            const totalA4Passes = totalSheetsNeeded * a4PassesPerSheet * (printSides || 1);

            // Tiered Price
            let printPricePerPass = getPrintPricePerPass(totalA4Passes, printColors, paper);
            const totalPrintCost = (totalA4Passes * printPricePerPass) / 1.08;

            const currentCost = totalPaperCost + totalPrintCost;

            if (currentCost < minWaste) {
                minWaste = currentCost;
                bestLayout = {
                    sheet, pps, totalSheets: totalSheetsNeeded,
                    paperCost: totalPaperCost, printCost: totalPrintCost, a4Passes: totalA4Passes,
                    rotated, cols, rows
                };
            }
        }
    }

    if (!bestLayout) throw new Error('Không tìm được khổ giấy phù hợp (Sản phẩm quá lớn?)');
    return bestLayout;
}

function getPrintPricePerPass(totalA4Passes, printColors, paper) {
    if (printColors > 0) { // Color
        let type = 'standard';
        if (paper.isVo) type = 'vo';
        else if (paper.isSpecial) type = 'special';

        const tier = digitalPrices.printing.color.find(t => totalA4Passes <= t.max);
        if (tier) {
            if (type === 'vo') return tier.priceVo;
            if (type === 'special') return tier.priceSpecial;
            return tier.price;
        }
        return digitalPrices.config.defaultPrintPrice;
    } else { // BW
        if (paper.type === 'decal') return digitalPrices.printing.bw.decal;
        const tier = digitalPrices.printing.bw.standard.find(t => totalA4Passes <= t.max);
        return tier ? tier.price : 216;
    }
}

function calculateFinishingCost(finishingOptions, bestLayout) {
    let total = 0;
    let lamination = 0;
    let dieCut = 0;
    let plastic = 0;

    if (!finishingOptions) return { total: 0 };

    // Lamination
    if (finishingOptions.laminationType && finishingOptions.laminationType !== 'none') {
        const range = digitalPrices.finishing.lamination[finishingOptions.laminationType];
        if (range) {
            const pricePerSide = bestLayout.totalSheets < 100 ? range.max : range.min;
            const sides = finishingOptions.laminationSides || 1;
            const a4Equiv = bestLayout.sheet.name === 'A4' ? 1 : 2;
            lamination = bestLayout.totalSheets * a4Equiv * sides * pricePerSide / 1.08;
            total += lamination;
        }
    }

    // Die Cut
    if (finishingOptions.dieCut) {
        const sizeKey = bestLayout.sheet.name === 'A4' ? 'a4' : 'a3';
        const diePrice = digitalPrices.finishing.dieCut[sizeKey].oneMold;
        dieCut = bestLayout.totalSheets * diePrice / 1.08;
        total += dieCut;
    }

    // Plastic Lamination
    if (finishingOptions.plasticLamination) {
        // Determine A4 or A5 pricing based on product size
        // Simplified Logic: If fits in A5 (14.8x21), use A5 price. Else use A4 price.
        const productArea = (bestLayout.layout && bestLayout.layout.productW * bestLayout.layout.productH) || 350;

        let range;
        if (productArea <= 320) {
            range = digitalPrices.finishing.plastic.a5;
        } else {
            range = digitalPrices.finishing.plastic.a4;
        }

        // Price per piece (product)
        const pricePerPiece = bestLayout.totalSheets < 50 ? range.max : range.min;

        const totalPieces = bestLayout.totalSheets * bestLayout.pps;
        plastic = totalPieces * pricePerPiece / 1.08;
        total += plastic;
    }

    return { total, lamination, dieCut, plastic };
}

function getDesignCost(designFee) {
    if (!designFee) return 0;

    // 1. Custom Price
    if (designFee.type === 'custom') {
        return designFee.customPrice || 0;
    }

    // 2. Lookup in config
    const fees = digitalPrices.config.designFees;
    if (fees && fees[designFee.type] !== undefined) {
        return fees[designFee.type];
    }

    return 0;
}



export default calculateDigital;
export { calculateDigital };
