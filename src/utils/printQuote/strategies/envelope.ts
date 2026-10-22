// @ts-nocheck
import { machines, papers, finishing, digitalPrices } from '../data';


import { resolvePaperCandidates, getDerivedPapers, calculateOptimalLayout, getPrintableArea } from '../utils';


const calculateEnvelope = function (request, productType = 'envelope') {
    const { quantity, productSize, paperId, finishingOptions, designFee, shippingFee, profitMargin } = request;
    const size = productSize;

    const envelopeW = size.w;
    const envelopeH = size.h;
    const envelopeFlap = size.flap || 0;

    let flatW, flatH;
    if (productType === 'lixi') {
        flatW = (envelopeW * 2) + 1.5;
        flatH = envelopeH + 4.5;
    } else {
        if (envelopeH > 30 || envelopeW > 20) {
            const sideWidth = envelopeH / 2.43;
            flatW = (sideWidth * 2) + envelopeW - 0.1;
            flatH = envelopeH + 1.5 + envelopeFlap;
        } else {
            flatW = envelopeW + 3;
            flatH = (envelopeH * 2) + envelopeFlap;
        }
    }

    const opts = finishingOptions || {};
    let bestOption = null;
    let minTotalCost = Infinity;

    const candidatePapers = resolvePaperCandidates(paperId, papers);
    if (candidatePapers.length === 0) throw new Error('Không tìm thấy giấy!');

    for (const basePaperCandidate of candidatePapers) {
        const derivedPapers = getDerivedPapers(basePaperCandidate);
        const pSize = { w: flatW, h: flatH };

        for (const machine of machines) {
            const printableArea = getPrintableArea(machine.maxSize, machine.gripperMargin);
            
            for (const p of derivedPapers) {
                if (p.size.w > printableArea.width || p.size.h > printableArea.height) {
                    if (!(p.size.h <= printableArea.width && p.size.w <= printableArea.height)) continue;
                }

                const layout = calculateOptimalLayout(p.size, pSize);
                if (layout.total === 0) continue;

                const sheetsNeeded = Math.ceil(quantity / layout.total);
                const waste = Math.ceil(sheetsNeeded * 0.05) + 20;
                const totalSheets = sheetsNeeded + waste;

                const baseToBuy = Math.ceil(totalSheets / p.cutsFromBase);
                const paperCost = baseToBuy * basePaperCandidate.pricePerSheet;

                let printSides = 1;
                let plateSets = 1;
                const envSides = opts.envelopePrintSides || '1';
                if (envSides === '2-same') { printSides = 2; plateSets = 1; }
                else if (envSides === '2-diff') { printSides = 2; plateSets = 2; }

                const colors = parseInt(opts.envelopePrintColors) || 4;
                const plates = colors * plateSets;
                const plateCost = machine.plateCost || 150000;
                const impressions = totalSheets * printSides;
                const runRate = basePaperCandidate.gsm >= 300 ? 50 : 30;
                const runCost = Math.max(0, impressions - 1000) * colors * runRate;
                const printCost = (plates * plateCost) + runCost;

                let finishCost = 0;

                // Determine if small or large envelope
                const isLargeEnvelope = envelopeH > 30 || envelopeW > 20;

                // 1. Bế khuôn (mold cost - one-time, from finishing.js fixed prices)
                if (opts.dieCut) {
                    const moldKey = isLargeEnvelope ? 'envelopeBig' : 'envelopeSmall';
                    const moldCost = finishing.dieCutting.mold[moldKey]; // 200k hoặc 300k
                    const dieRunCost = finishing.dieCutting.runPrice * totalSheets; // 100đ/tờ
                    finishCost += moldCost + dieRunCost;
                }

                // 2. Gia công bế + dán thành phẩm (đ/cái)
                if (opts.gluing || opts.dieCut) {
                    let finishingPricePerUnit = 0;
                    if (isLargeEnvelope) {
                        // Tìm mức giá theo số lượng
                        const scale = finishing.envelopeFinishing.large;
                        const tier = scale.find(t => quantity >= t.minQty && quantity <= t.maxQty);
                        finishingPricePerUnit = tier ? tier.price : scale[scale.length - 1].price;
                    } else {
                        finishingPricePerUnit = finishing.envelopeFinishing.small; // 250đ/cái
                    }
                    finishCost += quantity * finishingPricePerUnit;
                }

                // 3. Cán màng (tính theo diện tích tờ in × giá/m²)
                if (opts.laminationType && opts.laminationType !== 'none') {
                    const lamPrice = finishing.lamination[opts.laminationType];
                    const laminationSides = opts.laminationSides || 1;
                    const baseW = basePaperCandidate.baseSize ? basePaperCandidate.baseSize.w : basePaperCandidate.size.w;
                    const baseH = basePaperCandidate.baseSize ? basePaperCandidate.baseSize.h : basePaperCandidate.size.h;
                    finishCost += (baseW * baseH / 10000) * totalSheets * laminationSides * lamPrice;
                }

                // 4. Lìxi packaging (nếu có)
                if (productType === 'lixi' && opts.lixiPackaging) {
                    finishCost += quantity * 100;
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

                const total = paperCost + printCost + finishCost;
                if (total < minTotalCost) {
                    minTotalCost = total;
                    const profit = total * ((profitMargin || 0) / 100);
                    const finalTotal = total + profit + designCost + (shippingFee || 0);

                    bestOption = {
                        totalCost: finalTotal,
                        costPerUnit: finalTotal / quantity,
                        details: {
                            machine: machine.name,
                            paper: p,
                            basePaper: basePaperCandidate,
                            grossSheets: totalSheets,
                            productsPerSheet: layout.total,
                            paperCost,
                            printingCost: printCost,
                            finishingCost: finishCost,
                            profit: profit
                        }
                    };
                }
            }
        }
    }

    if (!bestOption) throw new Error("Không tìm thấy khổ giấy phù hợp!");
    return bestOption;
};

export default calculateEnvelope;
export { calculateEnvelope };
