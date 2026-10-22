// @ts-nocheck


import { machines, papers, finishing, digitalPrices } from '../data';



import { resolvePaperCandidates, getDerivedPapers, getPrintableArea } from '../utils';

const calculateCatalogue = function (request) {
    const { quantity, catalogueData, finishingOptions, designFee, shippingFee, profitMargin } = request;
    const { totalPages, coverPaperId, contentPaperId, coverPrintColors, contentPrintColors, bindingType, catalogueSize } = catalogueData;

    if (isNaN(quantity) || quantity <= 0) throw new Error('Số lượng không hợp lệ!');
    if (isNaN(totalPages) || totalPages < 8) throw new Error('Số trang tối thiểu là 8!');

    const coverCandidates = resolvePaperCandidates(coverPaperId, papers);
    const contentCandidates = resolvePaperCandidates(contentPaperId, papers);

    if (coverCandidates.length === 0) throw new Error('Vui lòng chọn giấy bìa!');
    if (contentCandidates.length === 0 && totalPages > 4) throw new Error('Vui lòng chọn giấy ruột!');

    // Catalogue size - A4 or A5
    let catalogueW, catalogueH;
    if (catalogueSize === 'A5') {
        catalogueW = 14.8;
        catalogueH = 21;
    } else { // Default A4
        catalogueW = 21;
        catalogueH = 29.7;
    }

    // Flat size for printing (spread out)
    const flatW = catalogueW * 2;
    const flatH = catalogueH;

    const coverPages = 4;
    const contentPages = totalPages - coverPages;
    const numSignatures = Math.ceil(contentPages / 4);

    // ===== COVER CALCULATION =====
    let bestCoverOption = null;
    let minCoverCost = Infinity;

    for (const coverPaper of coverCandidates) {
        for (const machine of machines) {
            const derivedPapers = getDerivedPapers(coverPaper);
            const printableArea = getPrintableArea(machine.maxSize, machine.gripperMargin);
            
            for (const paper of derivedPapers) {
                let signaturesPerSheet = 0;
                if (flatW <= paper.size.w && flatH <= paper.size.h) {
                    signaturesPerSheet = Math.floor(paper.size.w / flatW) * Math.floor(paper.size.h / flatH);
                } else if (flatH <= paper.size.w && flatW <= paper.size.h) {
                    signaturesPerSheet = Math.floor(paper.size.w / flatH) * Math.floor(paper.size.h / flatW);
                }

                if (signaturesPerSheet === 0) continue;

                if (paper.size.w > printableArea.width || paper.size.h > printableArea.height) {
                    if (!(paper.size.h <= printableArea.width && paper.size.w <= printableArea.height)) {
                        continue;
                    }
                }

                const sheetsNeeded = Math.ceil(quantity / signaturesPerSheet);
                const wasteSheets = Math.ceil(sheetsNeeded * 0.2);
                const totalSheets = sheetsNeeded + wasteSheets;

                const basePaper = papers.find(p => p.id === coverPaper.id);
                const baseSheetsToBuy = Math.ceil(totalSheets / paper.cutsFromBase);
                const paperCost = baseSheetsToBuy * basePaper.pricePerSheet;

                let printCost = 0;
                if (coverPrintColors > 0) {
                    const plates = coverPrintColors * 2;
                    let plateCost = machine.plateCost || 120000;
                    const totalImpressions = totalSheets * 2;
                    let runRate = coverPaper.gsm >= 400 ? 35 : 25;
                    const runCost = Math.max(0, totalImpressions - 1000) * coverPrintColors * runRate;
                    printCost = (plates * plateCost) + runCost;
                }

                const totalCost = paperCost + printCost;
                if (totalCost < minCoverCost) {
                    minCoverCost = totalCost;
                    bestCoverOption = {
                        machine: machine.name,
                        paper: paper,
                        basePaper: basePaper,
                        sheetsNeeded,
                        wasteSheets,
                        totalSheets,
                        baseSheetsToBuy,
                        signaturesPerSheet,
                        paperCost,
                        printCost
                    };
                }
            }
        }
    }

    if (!bestCoverOption) throw new Error('Không tìm được khổ giấy phù hợp cho bìa!');

    // ===== CONTENT CALCULATION (Per Signature) =====
    let bestContentOption = null;
    let minContentCostPerSig = Infinity;

    for (const contentPaper of contentCandidates) {
        for (const machine of machines) {
            const derivedPapers = getDerivedPapers(contentPaper);
            const printableArea = getPrintableArea(machine.maxSize, machine.gripperMargin);
            
            for (const paper of derivedPapers) {
                let signaturesPerSheet = 0;
                if (flatW <= paper.size.w && flatH <= paper.size.h) {
                    signaturesPerSheet = Math.floor(paper.size.w / flatW) * Math.floor(paper.size.h / flatH);
                } else if (flatH <= paper.size.w && flatW <= paper.size.h) {
                    signaturesPerSheet = Math.floor(paper.size.w / flatH) * Math.floor(paper.size.h / flatW);
                }

                if (signaturesPerSheet === 0) continue;

                if (paper.size.w > printableArea.width || paper.size.h > printableArea.height) {
                    if (!(paper.size.h <= printableArea.width && paper.size.w <= printableArea.height)) {
                        continue;
                    }
                }

                const sheetsNeededPerSig = Math.ceil(quantity / signaturesPerSheet);
                const wasteSheetsPerSig = Math.ceil(sheetsNeededPerSig * 0.2);
                const totalSheetsPerSig = sheetsNeededPerSig + wasteSheetsPerSig;

                const basePaper = papers.find(p => p.id === contentPaper.id);
                const baseSheetsToBuyPerSig = Math.ceil(totalSheetsPerSig / paper.cutsFromBase);
                const paperCostPerSig = baseSheetsToBuyPerSig * basePaper.pricePerSheet;

                let printCostPerSig = 0;
                if (contentPrintColors > 0) {
                    const plates = contentPrintColors * 2;
                    let plateCost = machine.plateCost || 120000;
                    const totalImpressions = totalSheetsPerSig * 2;
                    let runRate = contentPaper.gsm >= 400 ? 35 : 25;
                    const runCost = Math.max(0, totalImpressions - 1000) * contentPrintColors * runRate;
                    printCostPerSig = (plates * plateCost) + runCost;
                }

                const totalCostPerSig = paperCostPerSig + printCostPerSig;
                if (totalCostPerSig < minContentCostPerSig) {
                    minContentCostPerSig = totalCostPerSig;
                    bestContentOption = {
                        machine: machine.name,
                        paper: paper,
                        basePaper: basePaper,
                        sheetsNeededPerSig,
                        wasteSheetsPerSig,
                        totalSheetsPerSig,
                        baseSheetsToBuyPerSig,
                        signaturesPerSheet,
                        paperCostPerSig,
                        printCostPerSig
                    };
                }
            }
        }
    }

    if (!bestContentOption) throw new Error('Không tìm được khổ giấy phù hợp cho ruột!');

    const totalContentPaperCost = bestContentOption.paperCostPerSig * numSignatures;
    const totalContentPrintCost = bestContentOption.printCostPerSig * numSignatures;

    // ===== BINDING COST =====
    let bindingCostPerUnit = 0;
    if (bindingType && bindingType !== 'none') {
        const bindingPrices = finishing.binding[bindingType];
        if (bindingPrices) {
            if (quantity > 1000) {
                bindingCostPerUnit = bindingPrices.large;
            } else if (quantity >= 50) {
                bindingCostPerUnit = bindingPrices.medium;
            } else {
                bindingCostPerUnit = bindingPrices.small;
            }
        }
    }
    const bindingCost = bindingCostPerUnit * quantity;

    // ===== FINISHING (Lamination) =====
    let laminationCostTotal = 0;
    if (finishingOptions && finishingOptions.laminationType && finishingOptions.laminationType !== 'none') {
        const lamPricePerM2 = finishing.lamination[finishingOptions.laminationType];
        const lamSides = finishingOptions.laminationSides || 1;
        const coverAreaM2 = (flatW / 100) * (flatH / 100);
        laminationCostTotal = lamPricePerM2 * coverAreaM2 * lamSides * quantity;
    }

    const finishingCostTotal = laminationCostTotal; // + other finishings if added later

    // ===== DESIGN FEE =====
    let designFeeCost = 0;
    if (designFee) {
        if (designFee.type === 'custom') {
            designFeeCost = designFee.customPrice || 0;
        } else if (designFee.type === 'special_book') {
            const pages = designFee.pages || 0;
            designFeeCost = pages * 50000;
        } else {
            // Dynamic lookup
            const fees = digitalPrices.config.designFees;
            if (fees && fees[designFee.type] !== undefined) {
                designFeeCost = fees[designFee.type];
            }
        }
    }

    const shippingCost = shippingFee || 0;

    const totalPaperCost = bestCoverOption.paperCost + totalContentPaperCost;
    const totalPrintCost = bestCoverOption.printCost + totalContentPrintCost;

    const productionCost = totalPaperCost + totalPrintCost + finishingCostTotal + bindingCost;
    const profitAmount = (profitMargin || 0) * productionCost / 100;
    const totalCost = productionCost + profitAmount + designFeeCost + shippingCost;
    const costPerUnit = totalCost / quantity;

    return {
        totalCost: totalCost,
        costPerUnit: costPerUnit,
        details: {
            machine: `${bestCoverOption.machine} / ${bestContentOption.machine}`,
            paper: coverCandidates.find(p => p.id === coverPaperId) || coverPaperId,
            grossSheets: bestCoverOption.totalSheets + (bestContentOption.totalSheetsPerSig * numSignatures),
            wasteSheets: bestCoverOption.wasteSheets + (bestContentOption.wasteSheetsPerSig * numSignatures),

            // Cost Breakdown for UI
            paperCost: totalPaperCost,
            printingCost: totalPrintCost,
            finishingCost: finishingCostTotal, // Main Gia Cong line
            laminationCost: laminationCostTotal, // Detailed Lamination line
            bindingCost: bindingCost,
            designFee: designFeeCost,
            shippingFee: shippingCost,
            profit: profitAmount,

            layout: {
                paperW: catalogueW,
                paperH: catalogueH,
                productW: catalogueW,
                productH: catalogueH,
                cols: 1,
                rows: 1
            }
        }
    };
};

export default calculateCatalogue;
export { calculateCatalogue };
