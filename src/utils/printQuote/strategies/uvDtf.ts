// @ts-nocheck
import { digitalPrices } from '../data';

function calculateUVDTF(request) {
    const quantity = Number(request.quantity) || 1;
    const width = Number(request.width || request.productSize?.w || 5);
    const height = Number(request.height || request.productSize?.h || 5);
    const profitMargin = Number(request.profitMargin || 20);

    // Helper to calc sheets needed
    const calcSheets = (sW, sH, pW, pH, qty) => {
        // Option 1: Normal
        const cols1 = Math.floor(sW / pW);
        const rows1 = Math.floor(sH / pH);
        const items1 = cols1 * rows1;
        // Option 2: Rotated
        const cols2 = Math.floor(sW / pH);
        const rows2 = Math.floor(sH / pW);
        const items2 = cols2 * rows2;
        const pps = Math.max(items1, items2, 1);
        return Math.ceil(qty / pps);
    };

    // 1. Calculate for Sheet Mode (Small orders)
    // Scenario A: 20x28cm (s20x28)
    const sheetsA = calcSheets(20, 28, width, height, quantity);

    // Scenario B: 58x20cm (s58x20)
    // Assuming 58 is Width and 20 is Height (Printable Area)
    const sheetsB = calcSheets(58, 20, width, height, quantity);

    // 2. Calculate for Meter Mode (Large orders > 100m)
    const calcMeters = (rollWidth, pW, pH, qty) => {
        // Opt 1: Item W fits in Roll W
        let fitsAcross1 = Math.floor(rollWidth / pW);
        let length1 = Infinity;
        if (fitsAcross1 > 0) {
            const rows1 = Math.ceil(qty / fitsAcross1);
            length1 = rows1 * pH;
        }

        // Opt 2: Item H fits in Roll W (Rotate product)
        let fitsAcross2 = Math.floor(rollWidth / pH);
        let length2 = Infinity;
        if (fitsAcross2 > 0) {
            const rows2 = Math.ceil(qty / fitsAcross2);
            length2 = rows2 * pW;
        }

        return Math.min(length1, length2) / 100; // Convert cm to meters
    };

    const meters28 = calcMeters(28, width, height, quantity);
    const meters58 = calcMeters(58, width, height, quantity);

    // 3. Pricing Strategy

    let selectedMethod = '';
    let totalCost = 0;

    // Check Meter Threshold (>100m)
    const isLargeOrder = (meters28 > 100 || meters58 > 100);

    if (isLargeOrder) {
        // Meter Pricing
        const price28 = digitalPrices.uvDtf.meter ? digitalPrices.uvDtf.meter.w28 : 100000;
        const price58 = digitalPrices.uvDtf.meter ? digitalPrices.uvDtf.meter.w58 : 190000;

        const cost28 = meters28 * price28;
        const cost58 = meters58 * price58;

        if (cost28 < cost58) {
            totalCost = cost28;
            selectedMethod = `Cuộn khổ 28cm (${meters28.toFixed(1)}m)`;
        } else {
            totalCost = cost58;
            selectedMethod = `Cuộn khổ 58cm (${meters58.toFixed(1)}m)`;
        }
    } else {
        // Sheet Pricing (Find cheapest between 20x28 and 58x20)
        // Get Unit Price for Side A
        const tableA = digitalPrices.uvDtf.s20x28;
        let priceA = tableA[tableA.length - 1].price;
        for (const t of tableA) { if (sheetsA <= t.max) { priceA = t.price; break; } }
        const costA = sheetsA * priceA;

        // Get Unit Price for Side B
        const tableB = digitalPrices.uvDtf.s58x20;
        let priceB = tableB[tableB.length - 1].price;
        for (const t of tableB) { if (sheetsB <= t.max) { priceB = t.price; break; } }
        const costB = sheetsB * priceB;

        if (costA < costB) {
            totalCost = costA;
            selectedMethod = `Khổ 20x28cm (${sheetsA} tờ, ${priceA.toLocaleString('vi-VN')}đ/tờ)`;
        } else {
            totalCost = costB;
            selectedMethod = `Khổ 58x20cm (${sheetsB} tờ, ${priceB.toLocaleString('vi-VN')}đ/tờ)`;
        }
    }

    // 4. Profit & Final
    const profit = totalCost * (profitMargin / 100);
    const finalPrice = totalCost + profit;
    const pricePerUnit = finalPrice / quantity;

    return {
        totalPrice: finalPrice,
        pricePerUnit: pricePerUnit,
        details: {
            paperCost: 0,
            printCost: totalCost,
            finishingCost: 0,
            profit: profit,
            layout: {
                name: selectedMethod,
                pps: 0,
                totalSheets: 0,
                sheet: { name: 'UV DTF', w: 0, h: 0 }
            }
        }
    };
}

export default calculateUVDTF;
export { calculateUVDTF };
