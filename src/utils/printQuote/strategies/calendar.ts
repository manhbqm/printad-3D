// @ts-nocheck
import { machines, papers, finishing, digitalPrices } from '../data';


import { resolvePaperCandidates, getDerivedPapers, getPrintableArea } from '../utils';


const calculateCalendar = function (request) {
    const { quantity, calendarData, finishingOptions, designFee, shippingFee, profitMargin } = request;
    const { innerPages, type, sizePreset, coverPaperId, contentPaperId, coverPrintColors, contentPrintColors } = calendarData;

    if (isNaN(quantity) || quantity <= 0) throw new Error('Số lượng không hợp lệ!');

    const coverCandidates = resolvePaperCandidates(coverPaperId, papers);
    const contentCandidates = resolvePaperCandidates(contentPaperId, papers);

    if (coverCandidates.length === 0) throw new Error('Vui lòng chọn giấy bìa!');
    if (contentCandidates.length === 0 && innerPages > 0) throw new Error('Vui lòng chọn giấy ruột!');

    let calendarW = 40;
    let calendarH = 60;
    if (sizePreset) {
        const parts = sizePreset.split('x');
        if (parts.length === 2) {
            calendarW = parseFloat(parts[0]);
            calendarH = parseFloat(parts[1]);
        }
    }

    const isDesk = type === 'desk';
    const sides = isDesk ? 2 : 1;

    // Cover
    let bestCoverOption = null;
    let minCoverCost = Infinity;

    for (const coverPaper of coverCandidates) {
        for (const machine of machines) {
            const derivedPapers = getDerivedPapers(coverPaper);
            const printableArea = getPrintableArea(machine.maxSize, machine.gripperMargin);
            
            for (const paper of derivedPapers) {
                let calendarsPerSheet = 0;
                if (calendarW <= paper.size.w && calendarH <= paper.size.h) {
                    calendarsPerSheet = Math.floor(paper.size.w / calendarW) * Math.floor(paper.size.h / calendarH);
                } else if (calendarH <= paper.size.w && calendarW <= paper.size.h) {
                    calendarsPerSheet = Math.floor(paper.size.w / calendarH) * Math.floor(paper.size.h / calendarW);
                }

                if (calendarsPerSheet === 0) continue;
                if (paper.size.w > printableArea.width || paper.size.h > printableArea.height) {
                    if (!(paper.size.h <= printableArea.width && paper.size.w <= printableArea.height)) continue;
                }

                const sheetsNeeded = Math.ceil(quantity / calendarsPerSheet);
                const wasteSheets = Math.ceil(sheetsNeeded * 0.2);
                const totalSheets = sheetsNeeded + wasteSheets;

                const basePaper = papers.find(p => p.id === coverPaper.id);
                const baseSheetsToBuy = Math.ceil(totalSheets / paper.cutsFromBase);
                const paperCost = baseSheetsToBuy * basePaper.pricePerSheet;

                let printCost = 0;
                if (coverPrintColors > 0) {
                    const plates = coverPrintColors * sides;
                    const plateCost = machine.plateCost || 120000;
                    const totalImpressions = totalSheets * sides;
                    let runRate = coverPaper.gsm >= 400 ? 35 : 25;
                    const runCost = Math.max(0, totalImpressions - 1000) * coverPrintColors * runRate;
                    printCost = (plates * plateCost) + runCost;
                }

                const totalCost = paperCost + printCost;
                if (totalCost < minCoverCost) {
                    minCoverCost = totalCost;
                    bestCoverOption = { machine: machine.name, paper, basePaper, totalSheets, paperCost, printCost, calendarsPerSheet };
                }
            }
        }
    }
    if (!bestCoverOption) throw new Error('Không tìm được khổ giấy phù hợp cho bìa!');

    // Content
    let totalContentPaperCost = 0;
    let totalContentPrintCost = 0;
    let bestContentOption = {};

    if (innerPages > 0) {
        let minTotalContentCost = Infinity;
        for (const contentPaper of contentCandidates) {
            for (const machine of machines) {
                const derivedPapers = getDerivedPapers(contentPaper);
                const printableArea = getPrintableArea(machine.maxSize, machine.gripperMargin);
                
                for (const paper of derivedPapers) {
                    let slotsPerSheet = 0;
                    if (calendarW <= paper.size.w && calendarH <= paper.size.h) {
                        slotsPerSheet = Math.floor(paper.size.w / calendarW) * Math.floor(paper.size.h / calendarH);
                    } else if (calendarH <= paper.size.w && calendarW <= paper.size.h) {
                        slotsPerSheet = Math.floor(paper.size.w / calendarH) * Math.floor(paper.size.h / calendarW);
                    }
                    if (slotsPerSheet === 0) continue;
                    if (paper.size.w > printableArea.width || paper.size.h > printableArea.height) {
                        if (!(paper.size.h <= printableArea.width && paper.size.w <= printableArea.height)) continue;
                    }

                    const numSignatures = Math.ceil(innerPages / slotsPerSheet);
                    const sheetsNeeded = Math.ceil(quantity * numSignatures);
                    const wasteSheets = Math.ceil(sheetsNeeded * 0.2);
                    const totalSheets = sheetsNeeded + wasteSheets;

                    const basePaper = papers.find(p => p.id === contentPaper.id);
                    const baseSheetsToBuy = Math.ceil(totalSheets / paper.cutsFromBase);
                    const currentPaperCost = baseSheetsToBuy * basePaper.pricePerSheet;

                    let currentPrintCost = 0;
                    if (contentPrintColors > 0) {
                        const platesPerSig = contentPrintColors * sides;
                        const totalPlates = numSignatures * platesPerSig;
                        const plateCost = machine.plateCost || 120000;
                        const totalImpressions = totalSheets * sides;
                        let runRate = contentPaper.gsm >= 400 ? 35 : 25;
                        const runCost = Math.max(0, totalImpressions - 1000) * contentPrintColors * runRate;
                        currentPrintCost = (totalPlates * plateCost) + runCost;
                    }

                    const totalOptionCost = currentPaperCost + currentPrintCost;
                    if (totalOptionCost < minTotalContentCost) {
                        minTotalContentCost = totalOptionCost;
                        bestContentOption = { machine: machine.name, paper, totalSheets, totalPaperCost: currentPaperCost, totalPrintCost: currentPrintCost };
                    }
                }
            }
        }
        totalContentPaperCost = bestContentOption.totalPaperCost;
        totalContentPrintCost = bestContentOption.totalPrintCost;
    }

    let bindingCost = 3000 * quantity; // Spiral
    if (isDesk) bindingCost += 15000 * quantity; // Desk base

    let finishingCost = 0;
    if (finishingOptions.laminationType && finishingOptions.laminationType !== 'none') {
        const lamPrice = finishing.lamination[finishingOptions.laminationType];
        const lamSides = finishingOptions.laminationSides || 1;
        const area = (calendarW / 100) * (calendarH / 100);
        finishingCost += lamPrice * area * lamSides * quantity;
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

    const finalPaper = bestCoverOption.paperCost + totalContentPaperCost;
    const finalPrint = bestCoverOption.printCost + totalContentPrintCost;
    const production = finalPaper + finalPrint + finishingCost + bindingCost;
    const profit = production * ((profitMargin || 0) / 100);
    const total = production + profit + designCost + shipCost;

    return {
        totalCost: total,
        costPerUnit: total / quantity,
        details: {
            machine: bestCoverOption.machine,
            paper: bestCoverOption.basePaper,
            grossSheets: bestCoverOption.totalSheets,
            finishingCost,
            profit
        }
    };
};

export default calculateCalendar;
export { calculateCalendar };
