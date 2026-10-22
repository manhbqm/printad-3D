// @ts-nocheck
import { machines, papers, finishing, digitalPrices } from '../data';


import { resolvePaperCandidates, getDerivedPapers, calculateOptimalLayout, getPrintableArea } from '../utils';


const calculateBag = function (request) {
    const { quantity, productSize, paperId, finishingOptions, designFee, shippingFee, profitMargin } = request;
    const size = productSize; // Alias

    const bagW = size.w;
    const bagH = size.h;
    const bagD = size.d || 0;

    const flatW_full = (bagW * 2) + (bagD * 2) + 1.5;
    const flatH = bagH + 4;

    const maxMachineWidth = 60;
    const needsTwoPiece = flatW_full > maxMachineWidth;

    let productSizes = [];
    if (needsTwoPiece) {
        productSizes = [
            { w: bagW + bagD + 1.5, h: flatH },
            { w: bagW + bagD, h: flatH }
        ];
    } else {
        productSizes = [{ w: flatW_full, h: flatH }];
    }

    // Auto-defaults
    const opts = finishingOptions || {};
    if (opts.gluing && (!opts.gluingType || opts.gluingType === 'none')) {
        if (needsTwoPiece) opts.gluingType = 'bagTwoPiece';
        else opts.gluingType = (flatW_full * flatH > 2000) ? 'bagBig' : 'bagSmall';
    }

    let bestOption = null;
    let minTotalCost = Infinity;

    const candidatePapers = resolvePaperCandidates(paperId, papers);
    if (candidatePapers.length === 0) throw new Error('Không tìm thấy giấy!');

    for (const basePaperCandidate of candidatePapers) {
        const derivedPapers = getDerivedPapers(basePaperCandidate);

        let totalPaperCost = 0;
        let totalPrintCost = 0;
        let totalFinishCost = 0;
        let totalSheets = 0;
        let machineUsed = null;
        let paperUsed = null;
        let isCandidateValid = true;

        for (const pieceSize of productSizes) {
            let pieceBestCost = Infinity;
            let pieceBestDetails = null;

            for (const machine of machines) {
                const printableArea = getPrintableArea(machine.maxSize, machine.gripperMargin);
                
                for (const p of derivedPapers) {
                    if (p.size.w > printableArea.width || p.size.h > printableArea.height) {
                        if (!(p.size.h <= printableArea.width && p.size.w <= printableArea.height)) continue;
                    }

                    const layout = calculateOptimalLayout(p.size, pieceSize);
                    const productsPerSheet = layout.total;
                    if (productsPerSheet === 0) continue;

                    const sheetsNeeded = Math.ceil(quantity / productsPerSheet);
                    const waste = Math.ceil(sheetsNeeded * 0.05) + 20;
                    const sheetsTotal = sheetsNeeded + waste;

                    const baseToBuy = Math.ceil(sheetsTotal / p.cutsFromBase);
                    const paperCost = baseToBuy * basePaperCandidate.pricePerSheet;

                    const bagPrintSides = opts.bagPrintSides || '1';
                    let printSides = 1;
                    let plateSets = 1;
                    if (bagPrintSides === '2-same') { printSides = 2; plateSets = 1; }
                    else if (bagPrintSides === '2-diff') { printSides = 2; plateSets = 2; }

                    const colors = parseInt(opts.bagPrintColors) || 4;
                    const plates = colors * plateSets;
                    const plateCost = machine.plateCost || 150000;
                    const impressions = sheetsTotal * printSides;
                    const runRate = basePaperCandidate.gsm >= 300 ? 50 : 30;
                    const runCost = Math.max(0, impressions - 1000) * colors * runRate;
                    const printCost = (plates * plateCost) + runCost;

                    let finishCost = 0;
                    if (opts.laminationType && opts.laminationType !== 'none') {
                        const lamPrice = finishing.lamination[opts.laminationType];
                        const laminationSides = opts.laminationSides || 1;
                        const baseW = basePaperCandidate.baseSize ? basePaperCandidate.baseSize.w : basePaperCandidate.size.w;
                        const baseH = basePaperCandidate.baseSize ? basePaperCandidate.baseSize.h : basePaperCandidate.size.h;
                        const sheetAreaM2 = (baseW / 100) * (baseH / 100);
                        finishCost += sheetAreaM2 * sheetsTotal * laminationSides * lamPrice;
                    }

                    if (opts.dieCut) {
                        const moldCost = (pieceSize.w * pieceSize.h * 150) + 150000;
                        const dieRunCost = finishing.dieCutting.runPrice * sheetsTotal;
                        finishCost += moldCost + dieRunCost;
                    }

                    const total = paperCost + printCost + finishCost;
                    if (total < pieceBestCost) {
                        pieceBestCost = total;
                        pieceBestDetails = { paperCost, printCost, finishCost, sheets: sheetsTotal, machine, paper: p };
                    }
                }
            }

            if (!pieceBestDetails) {
                isCandidateValid = false;
                break;
            }

            totalPaperCost += pieceBestDetails.paperCost;
            totalPrintCost += pieceBestDetails.printCost;
            totalFinishCost += pieceBestDetails.finishCost;
            totalSheets += pieceBestDetails.sheets;
            machineUsed = pieceBestDetails.machine;
            paperUsed = pieceBestDetails.paper;
        }

        if (isCandidateValid) {
            if (opts.gluing) {
                let gluePrice = 0;
                if (opts.gluingType === 'custom') gluePrice = opts.gluingCustomPrice || 0;
                else gluePrice = finishing.gluing[opts.gluingType] || 1800;
                totalFinishCost += quantity * gluePrice;
            }

            const grandTotal = totalPaperCost + totalPrintCost + totalFinishCost;

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

            const profit = grandTotal * ((profitMargin || 0) / 100);
            const finalTotal = grandTotal + profit + designCost + shipCost;

            if (finalTotal < minTotalCost) {
                minTotalCost = finalTotal;
                bestOption = {
                    totalCost: finalTotal,
                    costPerUnit: finalTotal / quantity,
                    details: {
                        machine: machineUsed.name,
                        paper: paperUsed,
                        basePaper: basePaperCandidate,
                        grossSheets: totalSheets,
                        productsPerSheet: needsTwoPiece ? '2 mảnh' : 'Check Layout',
                        paperCost: totalPaperCost,
                        printingCost: totalPrintCost,
                        finishingCost: totalFinishCost,
                        wasteSheets: Math.ceil(totalSheets * 0.05),
                        profit: profit
                    }
                };
            }
        }
    }

    if (!bestOption) throw new Error("Không tìm thấy khổ giấy phù hợp (Bình file thất bại)!");
    return bestOption;
};

export default calculateBag;
export { calculateBag };
