// @ts-nocheck


import { machines, papers, finishing, digitalPrices } from '../data';


import { resolvePaperCandidates, getDerivedPapers, calculateOptimalLayout, getPrintableArea, generateRollWidths, calculateWaste } from '../utils';



/**
 * Calculate decal roll options with roll splitting support
 * Extracted from main calculateFlyer function for better code organization
 * 
 * @param {Object} params - Calculation parameters
 * @param {Function} updateBest - Callback to update best option (newCost, newOption) => void
 */
function calculateDecalRollOptions(params, updateBest) {
    const {
        basePaper, machines, productSize, quantity,
        printSides, printColors, printColorType, forceAB,
        finishingOptions, designFee, shippingFee, profitMargin
    } = params;

    for (const machine of machines) {
        const printableArea = getPrintableArea(machine.maxSize, machine.gripperMargin);
        
        // Generate all possible roll widths including splits
        const rollWidths = generateRollWidths(basePaper.availableWidths);
        
        for (const rollConfig of rollWidths) {
            const rollWidth = rollConfig.width;
            
            // Generate virtual sheets from this roll width
            const virtualSheets = [];
            
            // Option 1: Roll width as sheet width
            if (rollWidth <= printableArea.width) {
                virtualSheets.push({
                    sheetW: rollWidth,
                    sheetH: printableArea.height,
                    printableW: rollWidth,
                    printableH: printableArea.height
                });
            }
            
            // Option 2: Roll width as sheet height (rotated)
            if (rollWidth <= printableArea.height) {
                virtualSheets.push({
                    sheetW: printableArea.width,
                    sheetH: rollWidth,
                    printableW: printableArea.width,
                    printableH: rollWidth
                });
            }
            
            for (const vSheet of virtualSheets) {
                // Calculate layout on PRINTABLE area
                const layout = calculateOptimalLayout(
                    { w: vSheet.printableW, h: vSheet.printableH },
                    productSize
                );
                
                const productsPerSheet = layout.total;
                if (productsPerSheet === 0) continue;
                
                const totalCutSheetsNeeded = Math.ceil(quantity / productsPerSheet);
                
                // Calculate waste
                const hasFinishing = finishingOptions.laminationType !== 'none' || finishingOptions.dieCut || finishingOptions.uv || finishingOptions.gluing;
                const wasteSheets = calculateWaste(totalCutSheetsNeeded, hasFinishing, false);
                const grossCutSheets = totalCutSheetsNeeded + wasteSheets;
                
                // Calculate ACTUAL sheet size (printable + gripper margin)
                const actualSheetW = vSheet.sheetW;
                const actualSheetH = vSheet.sheetH + (machine.gripperMargin || 1);
                
                // Calculate material cost based on actual sheet dimensions
                const sheetAreaM2 = (actualSheetW * actualSheetH) / 10000;
                const totalAreaM2 = sheetAreaM2 * grossCutSheets;
                let paperCost = totalAreaM2 * basePaper.pricePerM2;
                
                // Add waste factor for split rolls
                if (rollConfig.splits > 1) {
                    const wastePercent = (rollConfig.splits - 1) * 0.02;
                    paperCost *= (1 + wastePercent);
                }
                
                // Apply minimum charge
                if (paperCost < 1000000) {
                    paperCost *= 1.05;
                }
                
                // Calculate printing cost
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
                    
                    const passesPerSide = Math.ceil(printColors / machine.colors);
                    const totalImpressions = grossCutSheets * printSides * passesPerSide;
                    
                    const isSmallMisu1 = (machine.id === 'misu_diamond' && vSheet.sheetW <= 49 && vSheet.sheetH <= 65);
                    let actualPlateCost;
                    let runRate = 25;
                    if (basePaper.gsm >= 400) {
                        // Giay day >=400gsm / Decan PP: dung bang gia rieng neu co
                        if (isSmallMisu1 && machine.plateCostHeavySmall) actualPlateCost = machine.plateCostHeavySmall;
                        else if (machine.plateCostHeavy) actualPlateCost = machine.plateCostHeavy;
                        else actualPlateCost = (isSmallMisu1 ? (machine.plateCostSmall || machine.plateCost) : machine.plateCost) + 30000;
                        runRate = 35;
                    } else if (printColorType === 'spot') {
                        actualPlateCost = machine.spotColorCost || 165000;
                    } else if (printColorType === 'metallic') {
                        actualPlateCost = machine.spotColorCost ? machine.spotColorCost + 30000 : 230000;
                    } else {
                        actualPlateCost = isSmallMisu1 ? (machine.plateCostSmall || machine.plateCost) : machine.plateCost;
                    }
                    
                    let runCost = 0;
                    if (totalImpressions > 1000) {
                        runCost = (totalImpressions - 1000) * printColors * runRate;
                    }
                    
                    printingCost = (actualPlateCost * plates) + runCost;
                }
                
                // Calculate finishing costs
                let finishingCost = 0;
                
                if (finishingOptions.laminationType !== 'none') {
                    const lamSides = finishingOptions.laminationSides || 1;
                    const lamPrice = finishing.lamination[finishingOptions.laminationType];
                    finishingCost += (totalAreaM2 * lamSides) * lamPrice;
                }
                
                if (finishingOptions.cutting) {
                    const rams = Math.ceil(grossCutSheets / 500);
                    // A2=level1(<=2), A3=level2(3-4), A4=level3(5-10), A5=level4(11-20), A6=level5(>20)
                    let cutPrice = finishing.cutting.level1;
                    if (productsPerSheet > 20) cutPrice = finishing.cutting.level5;
                    else if (productsPerSheet > 10) cutPrice = finishing.cutting.level4;
                    else if (productsPerSheet > 4) cutPrice = finishing.cutting.level3;
                    else if (productsPerSheet > 2) cutPrice = finishing.cutting.level2;
                    // Minimum 30,000d/bai cho so luong it (<200 to)
                    finishingCost += Math.max(finishing.cutting.minCharge, rams * cutPrice);
                }
                
                if (finishingOptions.dieCut) {
                    let moldPrice = 0;
                    if (finishingOptions.dieCutMold === 'custom') moldPrice = finishingOptions.dieCutCustomPrice || 0;
                    else moldPrice = finishing.dieCutting.mold[finishingOptions.dieCutMold];
                    const runPrice = finishing.dieCutting.runPrice * grossCutSheets;
                    finishingCost += moldPrice + runPrice;
                }
                
                if (finishingOptions.uv) {
                    const uvPlate = finishing.uv.plate;
                    const totalAreaCm2 = totalAreaM2 * 10000;
                    const uvRun = totalAreaCm2 * finishing.uv.runPricePerCm2;
                    finishingCost += uvPlate + uvRun;
                }

                if (finishingOptions.embossing) {
                    const gsm = paper.gsm || basePaper.gsm || 0;
                    const embRate = gsm >= 230
                        ? finishing.embossing.heavy
                        : finishing.embossing.light;
                    const totalAreaCm2 = totalAreaM2 * 10000;
                    finishingCost += totalAreaCm2 * embRate;
                }
                
                if (finishingOptions.gluing) {
                    let gluePrice = 0;
                    if (finishingOptions.gluingType === 'custom') gluePrice = finishingOptions.gluingCustomPrice || 0;
                    else gluePrice = finishing.gluing[finishingOptions.gluingType] || 0;
                    finishingCost += quantity * gluePrice;
                }
                
                // Design and shipping
                let designCost = 0;
                if (designFee) {
                    if (designFee.type === 'custom') {
                        designCost = designFee.customPrice || 0;
                    } else {
                        const fees = digitalPrices.config.designFees;
                        if (fees && fees[designFee.type] !== undefined) {
                            designCost = fees[designFee.type];
                        }
                    }
                }
                const shipCost = shippingFee || 0;
                
                // Calculate total
                const productionCost = paperCost + printingCost + finishingCost;
                let profit = productionCost * ((profitMargin || 0) / 100);
                if (basePaper.id === 'decal_pp_amazon') profit *= 2;
                
                const currentTotalCost = productionCost + profit + designCost + shipCost;
                
                // Build descriptive name for roll configuration
                let rollDescription = `Cuộn ${rollConfig.source}cm`;
                if (rollConfig.splits > 1) {
                    rollDescription += ` (cắt ${rollConfig.splits})`;
                }
                
                const newOption = {
                    totalCost: currentTotalCost,
                    costPerUnit: currentTotalCost / quantity,
                    details: {
                        machine: `${machine.name} - ${rollDescription}`,
                        paper: {
                            ...basePaper,
                            name: `${basePaper.name} - ${rollDescription}`,
                            size: { w: actualSheetW, h: actualSheetH },
                            rollWidth: rollConfig.width,
                            sourceRoll: rollConfig.source,
                            splits: rollConfig.splits
                        },
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
                            ...layout,
                            paperW: vSheet.sheetW,
                            paperH: vSheet.sheetH,
                            printableW: vSheet.printableW,
                            printableH: vSheet.printableH,
                            actualSheetW,
                            actualSheetH,
                            rollWidth: rollConfig.width,
                            sourceRoll: rollConfig.source,
                            splits: rollConfig.splits
                        }
                    }
                };
                
                updateBest(currentTotalCost, newOption);
            }
        }
    }
}


const calculateFlyer = function (request) {
    const { productSize, quantity, paperId, finishingOptions, printSides, printColors, printColorType, forceAB, designFee, shippingFee, profitMargin } = request;

    if (isNaN(productSize.w) || isNaN(productSize.h) || productSize.w <= 0 || productSize.h <= 0) throw new Error('Kích thước sản phẩm không hợp lệ!');
    if (isNaN(quantity) || quantity <= 0) throw new Error('Số lượng không hợp lệ!');

    const candidatePapers = resolvePaperCandidates(paperId, papers);
    if (candidatePapers.length === 0) throw new Error('Vui lòng chọn loại giấy!');

    let bestOption = null;
    let minTotalCost = Infinity;


    for (const basePaper of candidatePapers) {
        // ===== ROLL-BASED DECAL CALCULATION =====
        if (basePaper.isRoll) {
            calculateDecalRollOptions({
                basePaper,
                machines,
                productSize,
                quantity,
                printSides,
                printColors,
                printColorType,
                forceAB,
                finishingOptions,
                designFee,
                shippingFee,
                profitMargin,
                minTotalCost,
                bestOption
            }, (newCost, newOption) => {
                if (newCost < minTotalCost) {
                    minTotalCost = newCost;
                    bestOption = newOption;
                }
            });
            
            // Skip standard sheet-based calculation for roll materials
            continue;
        }

        // ===== STANDARD SHEET-BASED CALCULATION =====
        for (const machine of machines) {
            const derivedPapers = getDerivedPapers(basePaper);
            
            // Calculate printable area (accounting for gripper margin)
            const printableArea = getPrintableArea(machine.maxSize, machine.gripperMargin);
            
            for (const paper of derivedPapers) {

                // Check if paper fits in printable area (with rotation if needed)
                if (paper.size.w > printableArea.width || paper.size.h > printableArea.height) {
                    if (paper.size.h <= printableArea.width && paper.size.w <= printableArea.height) {
                        const temp = paper.size.w;
                        paper.size.w = paper.size.h;
                        paper.size.h = temp;
                    } else {
                        continue;
                    }
                }

                const productsPerSheet = calculateOptimalLayout(paper.size, productSize).total;
                if (productsPerSheet === 0) continue;

                const totalCutSheetsNeeded = Math.ceil(quantity / productsPerSheet);

                const hasFinishing = finishingOptions.laminationType !== 'none' || finishingOptions.dieCut || finishingOptions.uv || finishingOptions.gluing;
                const wasteSheets = calculateWaste(totalCutSheetsNeeded, hasFinishing, false);
                const grossCutSheets = totalCutSheetsNeeded + wasteSheets;

                const baseSheetsToBuy = Math.ceil(grossCutSheets / paper.cutsFromBase);

                let paperCost = baseSheetsToBuy * basePaper.pricePerSheet;
                if ((basePaper.id === 'decal_pp' || basePaper.id === 'decal_paper') && paperCost < 1000000) {
                    paperCost *= 1.05;
                }

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

                    const passesPerSide = Math.ceil(printColors / machine.colors);
                    const totalImpressions = grossCutSheets * printSides * passesPerSide;

                    const isSmallMisu2 = (machine.id === 'misu_diamond' && paper.size.w <= 49 && paper.size.h <= 65);
                    let actualPlateCost;
                    let runRate = 25;
                    if (paper.gsm >= 400) {
                        // Giay day >=400gsm / Decan PP: dung bang gia rieng neu co
                        if (isSmallMisu2 && machine.plateCostHeavySmall) actualPlateCost = machine.plateCostHeavySmall;
                        else if (machine.plateCostHeavy) actualPlateCost = machine.plateCostHeavy;
                        else actualPlateCost = (isSmallMisu2 ? (machine.plateCostSmall || machine.plateCost) : machine.plateCost) + 30000;
                        runRate = 35;
                    } else if (printColorType === 'spot') {
                        actualPlateCost = machine.spotColorCost || 165000;
                    } else if (printColorType === 'metallic') {
                        actualPlateCost = machine.spotColorCost ? machine.spotColorCost + 30000 : 230000;
                    } else {
                        actualPlateCost = isSmallMisu2 ? (machine.plateCostSmall || machine.plateCost) : machine.plateCost;
                    }

                    let runCost = 0;
                    if (totalImpressions > 1000) {
                        runCost = (totalImpressions - 1000) * printColors * runRate;
                    }

                    printingCost = (actualPlateCost * plates) + runCost;
                }

                let finishingCost = 0;
                const totalAreaM2 = (grossCutSheets * paper.size.w * paper.size.h) / 10000;
                const totalAreaCm2 = grossCutSheets * paper.size.w * paper.size.h;

                if (finishingOptions.laminationType !== 'none') {
                    const lamSides = finishingOptions.laminationSides || 1;
                    const lamPrice = finishing.lamination[finishingOptions.laminationType];
                    finishingCost += (totalAreaM2 * lamSides) * lamPrice;
                }

                if (finishingOptions.cutting) {
                    const rams = Math.ceil(grossCutSheets / 500);
                    // A2=level1(<=2), A3=level2(3-4), A4=level3(5-10), A5=level4(11-20), A6=level5(>20)
                    let cutPrice = finishing.cutting.level1;
                    if (productsPerSheet > 20) cutPrice = finishing.cutting.level5;
                    else if (productsPerSheet > 10) cutPrice = finishing.cutting.level4;
                    else if (productsPerSheet > 4) cutPrice = finishing.cutting.level3;
                    else if (productsPerSheet > 2) cutPrice = finishing.cutting.level2;
                    // Minimum 30,000d/bai cho so luong it (<200 to)
                    finishingCost += Math.max(finishing.cutting.minCharge, rams * cutPrice);
                }

                if (finishingOptions.dieCut) {
                    let moldPrice = 0;
                    if (finishingOptions.dieCutMold === 'custom') moldPrice = finishingOptions.dieCutCustomPrice || 0;
                    else moldPrice = finishing.dieCutting.mold[finishingOptions.dieCutMold];
                    const runPrice = finishing.dieCutting.runPrice * grossCutSheets;
                    finishingCost += moldPrice + runPrice;
                }

                if (finishingOptions.uv) {
                    const uvPlate = finishing.uv.plate;
                    const uvRun = totalAreaCm2 * finishing.uv.runPricePerCm2;
                    finishingCost += uvPlate + uvRun;
                }

                if (finishingOptions.embossing) {
                    const gsm = paper.gsm || basePaper.gsm || 0;
                    const embRate = gsm >= 230
                        ? finishing.embossing.heavy
                        : finishing.embossing.light;
                    finishingCost += totalAreaCm2 * embRate;
                }

                if (finishingOptions.gluing) {
                    let gluePrice = 0;
                    if (finishingOptions.gluingType === 'custom') gluePrice = finishingOptions.gluingCustomPrice || 0;
                    else gluePrice = finishing.gluing[finishingOptions.gluingType] || 0;
                    finishingCost += quantity * gluePrice;
                }

                let designCost = 0;
                if (designFee) {
                    if (designFee.type === 'custom') {
                        designCost = designFee.customPrice || 0;
                    } else {
                        // Dynamic lookup from central config
                        const fees = digitalPrices.config.designFees;
                        if (fees && fees[designFee.type] !== undefined) {
                            designCost = fees[designFee.type];
                        }
                    }
                }
                const shipCost = shippingFee || 0;

                const productionCost = paperCost + printingCost + finishingCost;
                let profit = productionCost * ((profitMargin || 0) / 100);
                if (basePaper.id === 'decal_pp') profit *= 2;

                const currentTotalCost = productionCost + profit + designCost + shipCost;

                if (currentTotalCost < minTotalCost) {
                    minTotalCost = currentTotalCost;
                    const layout = calculateOptimalLayout(paper.size, productSize);
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
                                ...layout,
                                paperW: paper.size.w,
                                paperH: paper.size.h
                            }
                        }
                    };
                }
            }
        }
    }

    if (!bestOption) throw new Error('Không tìm thấy khổ in phù hợp!');
    return bestOption;
};

export default calculateFlyer;
export { calculateFlyer };
