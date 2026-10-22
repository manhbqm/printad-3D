// @ts-nocheck

import { machines, papers, finishing, digitalPrices } from '../data';


import { resolvePaperCandidates, getDerivedPapers, calculateOptimalLayout, getPrintableArea } from '../utils';


const calculateFolder = function (request) {
    const { productSize, quantity, paperId, finishingOptions, printSides, printColors, printColorType, forceAB, designFee, shippingFee, profitMargin } = request;

    // Folder logic:
    // Product Size input is "Closed Size" (e.g., 22x31)
    // Actual Open Size for printing = (Width x 2) + Spines? + Flap logic.
    const flatW = productSize.w * 2;
    const flatH = productSize.h + productSize.flap; // 31 + 7 = 38

    const flatSize = { w: flatW, h: flatH }; // 45 x 38

    if (isNaN(quantity) || quantity <= 0) throw new Error('Số lượng không hợp lệ!');

    const candidatePapers = resolvePaperCandidates(paperId, papers);
    if (candidatePapers.length === 0) throw new Error('Vui lòng chọn loại giấy!');

    let bestOption = null;
    let minTotalCost = Infinity;

    for (const basePaper of candidatePapers) {
        for (const machine of machines) {
            const derivedPapers = getDerivedPapers(basePaper);
            const printableArea = getPrintableArea(machine.maxSize, machine.gripperMargin);
            
            for (const paper of derivedPapers) {

                if (paper.size.w > printableArea.width || paper.size.h > printableArea.height) {
                    if (paper.size.h <= printableArea.width && paper.size.w <= printableArea.height) {
                        const temp = paper.size.w;
                        paper.size.w = paper.size.h;
                        paper.size.h = temp;
                    } else {
                        continue;
                    }
                }

                // Use Flat Size for Layout Calculation
                const layoutResult = calculateOptimalLayout(paper.size, flatSize);
                const productsPerSheet = layoutResult.total;

                if (productsPerSheet === 0) continue;

                const totalCutSheetsNeeded = Math.ceil(quantity / productsPerSheet);

                // Folder usually has Lamination, Die Cut (Bế)
                const hasFinishing = true; // Folders almost always need die-cutting
                const wasteSheets = Math.ceil(totalCutSheetsNeeded * 0.10); // Standard waste for complex die cut
                const grossCutSheets = totalCutSheetsNeeded + wasteSheets;

                const baseSheetsToBuy = Math.ceil(grossCutSheets / paper.cutsFromBase);

                let paperCost = baseSheetsToBuy * basePaper.pricePerSheet;

                let printingCost = 0;
                let printStyle = '';

                if (printColors > 0) {
                    let plates = 0;
                    if (printSides === 2) {
                        if (!forceAB && productsPerSheet >= 2 && productsPerSheet % 2 === 0) {
                            plates = printColors;
                            printStyle = 'In tự trở (1 bộ kẽm)';
                        } else {
                            plates = printColors * 2;
                            printStyle = 'In AB (2 bộ kẽm)';
                        }
                    } else {
                        plates = printColors;
                        printStyle = 'In 1 mặt';
                    }

                    const isSmallMisu = (machine.id === 'misu_diamond' && paper.size.w <= 49 && paper.size.h <= 65);
                    let actualPlateCost;
                    if (basePaper.gsm >= 400) {
                        if (isSmallMisu && machine.plateCostHeavySmall) actualPlateCost = machine.plateCostHeavySmall;
                        else if (machine.plateCostHeavy) actualPlateCost = machine.plateCostHeavy;
                        else actualPlateCost = (isSmallMisu ? (machine.plateCostSmall || machine.plateCost) : machine.plateCost) + 30000;
                    } else {
                        actualPlateCost = isSmallMisu ? (machine.plateCostSmall || machine.plateCost) : machine.plateCost;
                    }

                    let runCost = (grossCutSheets * printSides * Math.ceil(printColors / machine.colors)) * 35; // Run Rate
                    if (grossCutSheets * printSides * Math.ceil(printColors / machine.colors) < 1000) runCost = 0;
                    const totalImpressions = grossCutSheets * printSides * Math.ceil(printColors / machine.colors);
                    if (totalImpressions > 1000) {
                        runCost = (totalImpressions - 1000) * printColors * 25;
                    }

                    printingCost = (actualPlateCost * plates) + runCost;
                }

                let finishingCost = 0;
                const totalAreaM2 = (grossCutSheets * paper.size.w * paper.size.h) / 10000;

                if (finishingOptions.laminationType !== 'none') {
                    const lamSides = finishingOptions.laminationSides || 1;
                    const lamPrice = finishing.lamination[finishingOptions.laminationType];
                    finishingCost += (totalAreaM2 * lamSides) * lamPrice;
                }

                let moldPrice = 300000;
                const runPriceDieCut = finishing.dieCutting.runPrice * grossCutSheets;
                finishingCost += moldPrice + runPriceDieCut;

                if (finishingOptions.gluing) {
                    const gluePrice = finishing.gluing[finishingOptions.gluingType] || 200;
                    finishingCost += quantity * gluePrice;
                }

                let designCost = 0;
                if (designFee) {
                    if (designFee.type === 'custom') {
                        designCost = designFee.customPrice || 0;
                    } else {
                        // Dynamic lookup
                        const fees = digitalPrices.config.designFees;
                        if (fees && fees[designFee.type] !== undefined) {
                            designCost = fees[designFee.type];
                        }
                    }
                }
                const shipCost = shippingFee || 0;

                const productionCost = paperCost + printingCost + finishingCost;

                // Profit Margins (User Defined)
                let defaultMargin = 45;
                if (quantity >= 5000) defaultMargin = 20;
                else if (quantity >= 2000) defaultMargin = 25;
                else if (quantity >= 1000) defaultMargin = 35;

                const profitPercent = (profitMargin !== undefined && profitMargin !== null) ? profitMargin : defaultMargin;
                const profit = productionCost * (profitPercent / 100);

                const currentTotalCost = productionCost + profit + designCost + shipCost;

                if (currentTotalCost < minTotalCost) {
                    minTotalCost = currentTotalCost;
                    bestOption = {
                        totalCost: currentTotalCost,
                        costPerUnit: currentTotalCost / quantity,
                        details: {
                            machine: machine.name,
                            paper: paper,
                            grossSheets: grossCutSheets,
                            wasteSheets,
                            productsPerSheet,
                            paperCost,
                            printingCost,
                            printStyle,
                            finishingCost,
                            designFee: designCost,
                            shippingFee: shipCost,
                            profit,
                            layout: {
                                ...layoutResult,
                                paperW: paper.size.w,
                                paperH: paper.size.h,
                                productW: flatSize.w,
                                productH: flatSize.h
                            }
                        }
                    };
                }
            }
        }
    }

    if (!bestOption) throw new Error('Không tìm thấy khổ in phù hợp cho Kẹp file!');
    return bestOption;
};

export default calculateFolder;
export { calculateFolder };
