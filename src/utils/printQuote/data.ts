// @ts-nocheck

// Auto-generated data module from print-quote


export const machines: any[] = [
    {
        id: 'listron4',
        name: 'Listron - Máy 4 (45.9x53)',
        maxSize: { width: 45.9, height: 53 },
        gripperMargin: 1,
        colors: 4,
        plateCost: 120000,       // Màu cơ bản
        spotColorCost: 180000,   // Màu lẻ/pha (base)
        plateCostHeavy: null,    // Không có bảng giá riêng → dùng plateCost + 30k
        runCost: 35,
        minRunCost: 150000,
    },
    {
        id: 'listron8_1color',
        name: 'Listron - Máy 8 (56x67) - 1 Màu',
        maxSize: { width: 56, height: 67 },
        gripperMargin: 1,
        colors: 1,
        plateCost: 135000,       // Màu cơ bản
        spotColorCost: 200000,   // Màu lẻ/pha (base)
        plateCostHeavy: 165000,  // Giấy ≥400gsm / Decan PP (135k + 30k)
    },
    {
        id: 'listron8_4color',
        name: 'Listron - Máy 8 (56x67) - 4 Màu',
        maxSize: { width: 56, height: 67 },
        gripperMargin: 1,
        colors: 4,
        plateCost: 135000,       // Màu cơ bản
        spotColorCost: 200000,   // Màu lẻ/pha (base)
        plateCostHeavy: 165000,  // Giấy ≥400gsm / Decan PP (135k + 30k)
    },
    {
        id: 'misu_diamond',
        name: 'Misu Diamond (60x73)',
        maxSize: { width: 60, height: 73 },
        gripperMargin: 1,
        colors: 4,
        plateCost: 165000,           // Màu cơ bản — khổ in ≥50x66
        plateCostSmall: 150000,      // Màu cơ bản — giấy ≤49x65
        plateCostHeavy: 200000,      // Giấy ≥400gsm / Decan PP — khổ ≥50x66
        plateCostHeavySmall: 175000, // Giấy ≥400gsm / Decan PP — giấy ≤49x65
        spotColorCost: 300000,       // Màu lẻ/pha (base)
        runCost: 35,
    },
    {
        id: 'komori_52x72',
        name: 'Komori Lithrone (52x72)',
        maxSize: { width: 52, height: 72 },
        gripperMargin: 1,
        colors: 4,
        plateCost: 200000,
        runCost: 30,
    },
    {
        id: 'heidelberg_72x102',
        name: 'Heidelberg (72x102)',
        maxSize: { width: 72, height: 102 },
        gripperMargin: 1,
        colors: 4,
        plateCost: 350000,
        runCost: 30,
    }
];



export const papers: any[] = [
    // --- COUCHE HI-KOTE (Brand: hikote) ---
    // VAT 8% included. pricePerTon in VND (e.g. 24500000 = 24.5 triệu/tấn)
    // 80gsm — ĐG/TẤN: 24.5 triệu
    { id: 'chk80_62x86',   name: 'Couche Hi-kote 80gsm (62x86)',   type: 'couche', brand: 'hikote', gsm: 80,  pricePerSheet: 1045, pricePerTon: 24500000, size: { w: 62, h: 86 } },
    { id: 'chk80_65x86',   name: 'Couche Hi-kote 80gsm (65x86)',   type: 'couche', brand: 'hikote', gsm: 80,  pricePerSheet: 1096, pricePerTon: 24500000, size: { w: 65, h: 86 } },
    { id: 'chk80_79x109',  name: 'Couche Hi-kote 80gsm (79x109)',  type: 'couche', brand: 'hikote', gsm: 80,  pricePerSheet: 1688, pricePerTon: 24500000, size: { w: 79, h: 109 } },
    // 100gsm — ĐG/TẤN: 22.5 triệu
    { id: 'chk100_62x86',  name: 'Couche Hi-kote 100gsm (62x86)',  type: 'couche', brand: 'hikote', gsm: 100, pricePerSheet: 1200, pricePerTon: 22500000, size: { w: 62, h: 86 } },
    { id: 'chk100_65x86',  name: 'Couche Hi-kote 100gsm (65x86)',  type: 'couche', brand: 'hikote', gsm: 100, pricePerSheet: 1258, pricePerTon: 22500000, size: { w: 65, h: 86 } },
    { id: 'chk100_72x102', name: 'Couche Hi-kote 100gsm (72x102)', type: 'couche', brand: 'hikote', gsm: 100, pricePerSheet: 1652, pricePerTon: 22500000, size: { w: 72, h: 102 } },
    { id: 'chk100_79x109', name: 'Couche Hi-kote 100gsm (79x109)', type: 'couche', brand: 'hikote', gsm: 100, pricePerSheet: 1937, pricePerTon: 22500000, size: { w: 79, h: 109 } },
    // 120gsm — ĐG/TẤN: 22.5 triệu
    { id: 'chk120_62x86',  name: 'Couche Hi-kote 120gsm (62x86)',  type: 'couche', brand: 'hikote', gsm: 120, pricePerSheet: 1440, pricePerTon: 22500000, size: { w: 62, h: 86 } },
    { id: 'chk120_65x86',  name: 'Couche Hi-kote 120gsm (65x86)',  type: 'couche', brand: 'hikote', gsm: 120, pricePerSheet: 1509, pricePerTon: 22500000, size: { w: 65, h: 86 } },
    { id: 'chk120_72x102', name: 'Couche Hi-kote 120gsm (72x102)', type: 'couche', brand: 'hikote', gsm: 120, pricePerSheet: 1983, pricePerTon: 22500000, size: { w: 72, h: 102 } },
    { id: 'chk120_79x109', name: 'Couche Hi-kote 120gsm (79x109)', type: 'couche', brand: 'hikote', gsm: 120, pricePerSheet: 2325, pricePerTon: 22500000, size: { w: 79, h: 109 } },
    // 140gsm — ĐG/TẤN: 22.5 triệu
    { id: 'chk140_62x86',  name: 'Couche Hi-kote 140gsm (62x86)',  type: 'couche', brand: 'hikote', gsm: 140, pricePerSheet: 1680, pricePerTon: 22500000, size: { w: 62, h: 86 } },
    { id: 'chk140_79x109', name: 'Couche Hi-kote 140gsm (79x109)', type: 'couche', brand: 'hikote', gsm: 140, pricePerSheet: 2712, pricePerTon: 22500000, size: { w: 79, h: 109 } },
    // 150gsm — ĐG/TẤN: 22.5 triệu
    { id: 'chk150_62x86',  name: 'Couche Hi-kote 150gsm (62x86)',  type: 'couche', brand: 'hikote', gsm: 150, pricePerSheet: 1800, pricePerTon: 22500000, size: { w: 62, h: 86 } },
    { id: 'chk150_65x86',  name: 'Couche Hi-kote 150gsm (65x86)',  type: 'couche', brand: 'hikote', gsm: 150, pricePerSheet: 1887, pricePerTon: 22500000, size: { w: 65, h: 86 } },
    { id: 'chk150_72x102', name: 'Couche Hi-kote 150gsm (72x102)', type: 'couche', brand: 'hikote', gsm: 150, pricePerSheet: 2479, pricePerTon: 22500000, size: { w: 72, h: 102 } },
    { id: 'chk150_79x109', name: 'Couche Hi-kote 150gsm (79x109)', type: 'couche', brand: 'hikote', gsm: 150, pricePerSheet: 2906, pricePerTon: 22500000, size: { w: 79, h: 109 } },
    // 180gsm — ĐG/TẤN: 22.5 triệu
    { id: 'chk180_62x86',  name: 'Couche Hi-kote 180gsm (62x86)',  type: 'couche', brand: 'hikote', gsm: 180, pricePerSheet: 2159, pricePerTon: 22500000, size: { w: 62, h: 86 } },
    // 200gsm — ĐG/TẤN: 22.5 triệu
    { id: 'chk200_62x86',  name: 'Couche Hi-kote 200gsm (62x86)',  type: 'couche', brand: 'hikote', gsm: 200, pricePerSheet: 2399, pricePerTon: 22500000, size: { w: 62, h: 86 } },
    { id: 'chk200_65x86',  name: 'Couche Hi-kote 200gsm (65x86)',  type: 'couche', brand: 'hikote', gsm: 200, pricePerSheet: 2516, pricePerTon: 22500000, size: { w: 65, h: 86 } },
    { id: 'chk200_72x102', name: 'Couche Hi-kote 200gsm (72x102)', type: 'couche', brand: 'hikote', gsm: 200, pricePerSheet: 3305, pricePerTon: 22500000, size: { w: 72, h: 102 } },
    { id: 'chk200_79x109', name: 'Couche Hi-kote 200gsm (79x109)', type: 'couche', brand: 'hikote', gsm: 200, pricePerSheet: 3875, pricePerTon: 22500000, size: { w: 79, h: 109 } },
    // 230gsm — ĐG/TẤN: 22.5 triệu
    { id: 'chk230_62x86',  name: 'Couche Hi-kote 230gsm (62x86)',  type: 'couche', brand: 'hikote', gsm: 230, pricePerSheet: 2759, pricePerTon: 22500000, size: { w: 62, h: 86 } },
    { id: 'chk230_65x86',  name: 'Couche Hi-kote 230gsm (65x86)',  type: 'couche', brand: 'hikote', gsm: 230, pricePerSheet: 2893, pricePerTon: 22500000, size: { w: 65, h: 86 } },
    { id: 'chk230_72x102', name: 'Couche Hi-kote 230gsm (72x102)', type: 'couche', brand: 'hikote', gsm: 230, pricePerSheet: 3801, pricePerTon: 22500000, size: { w: 72, h: 102 } },
    { id: 'chk230_79x109', name: 'Couche Hi-kote 230gsm (79x109)', type: 'couche', brand: 'hikote', gsm: 230, pricePerSheet: 4456, pricePerTon: 22500000, size: { w: 79, h: 109 } },
    // 250gsm — ĐG/TẤN: 22.5 triệu
    { id: 'chk250_62x86',  name: 'Couche Hi-kote 250gsm (62x86)',  type: 'couche', brand: 'hikote', gsm: 250, pricePerSheet: 2999, pricePerTon: 22500000, size: { w: 62, h: 86 } },
    { id: 'chk250_65x86',  name: 'Couche Hi-kote 250gsm (65x86)',  type: 'couche', brand: 'hikote', gsm: 250, pricePerSheet: 3144, pricePerTon: 22500000, size: { w: 65, h: 86 } },
    { id: 'chk250_72x102', name: 'Couche Hi-kote 250gsm (72x102)', type: 'couche', brand: 'hikote', gsm: 250, pricePerSheet: 4131, pricePerTon: 22500000, size: { w: 72, h: 102 } },
    { id: 'chk250_79x109', name: 'Couche Hi-kote 250gsm (79x109)', type: 'couche', brand: 'hikote', gsm: 250, pricePerSheet: 4844, pricePerTon: 22500000, size: { w: 79, h: 109 } },
    // 300gsm
    { id: 'chk300_39x47',  name: 'Couche Hi-kote 300gsm (39.5x47)', type: 'couche', brand: 'hikote', gsm: 300, pricePerSheet: 1253, pricePerTon: 22500000, size: { w: 39.5, h: 47 } },
    { id: 'chk300_62x86',  name: 'Couche Hi-kote 300gsm (62x86)',  type: 'couche', brand: 'hikote', gsm: 300, pricePerSheet: 3599, pricePerTon: 22500000, size: { w: 62, h: 86 } },
    { id: 'chk300_65x86',  name: 'Couche Hi-kote 300gsm (65x86)',  type: 'couche', brand: 'hikote', gsm: 300, pricePerSheet: 3773, pricePerTon: 22500000, size: { w: 65, h: 86 } },
    { id: 'chk300_79x109', name: 'Couche Hi-kote 300gsm (79x109)', type: 'couche', brand: 'hikote', gsm: 300, pricePerSheet: 5812, pricePerTon: 22500000, size: { w: 79, h: 109 } },

    // --- COUCHE PINDO (Brand: pindo) — ĐG/TẤN: 26.0 triệu ---
    { id: 'cp300_65x86',   name: 'Couche Pindo 300gsm (65x86)',    type: 'couche', brand: 'pindo',  gsm: 300, pricePerSheet: 4360, pricePerTon: 26000000, size: { w: 65, h: 86 } },
    { id: 'cp300_79x109',  name: 'Couche Pindo 300gsm (79x109)',   type: 'couche', brand: 'pindo',  gsm: 300, pricePerSheet: 6717, pricePerTon: 26000000, size: { w: 79, h: 109 } },

    // --- OFFSET (Brand: standard) ---
    // 70gsm — ĐG/TẤN: 24.5 triệu
    { id: 'off70_60x84',   name: 'Offset 70gsm (60x84)',   type: 'offset', brand: 'standard', gsm: 70,  pricePerSheet: 864,  pricePerTon: 24500000, size: { w: 60, h: 84 } },
    { id: 'off70_62x86',   name: 'Offset 70gsm (62x86)',   type: 'offset', brand: 'standard', gsm: 70,  pricePerSheet: 914,  pricePerTon: 24500000, size: { w: 62, h: 86 } },
    { id: 'off70_65x86',   name: 'Offset 70gsm (65x86)',   type: 'offset', brand: 'standard', gsm: 70,  pricePerSheet: 959,  pricePerTon: 24500000, size: { w: 65, h: 86 } },
    { id: 'off70_79x109',  name: 'Offset 70gsm (79x109)',  type: 'offset', brand: 'standard', gsm: 70,  pricePerSheet: 1477, pricePerTon: 24500000, size: { w: 79, h: 109 } },
    // 80gsm — ĐG/TẤN: 24.5 triệu
    { id: 'off80_60x84',   name: 'Offset 80gsm (60x84)',   type: 'offset', brand: 'standard', gsm: 80,  pricePerSheet: 988,  pricePerTon: 24500000, size: { w: 60, h: 84 } },
    { id: 'off80_62x86',   name: 'Offset 80gsm (62x86)',   type: 'offset', brand: 'standard', gsm: 80,  pricePerSheet: 1045, pricePerTon: 24500000, size: { w: 62, h: 86 } },
    { id: 'off80_65x86',   name: 'Offset 80gsm (65x86)',   type: 'offset', brand: 'standard', gsm: 80,  pricePerSheet: 1096, pricePerTon: 24500000, size: { w: 65, h: 86 } },
    { id: 'off80_79x109',  name: 'Offset 80gsm (79x109)',  type: 'offset', brand: 'standard', gsm: 80,  pricePerSheet: 1688, pricePerTon: 24500000, size: { w: 79, h: 109 } },
    // 100gsm — ĐG/TẤN: 24.5 triệu
    { id: 'off100_62x86',  name: 'Offset 100gsm (62x86)',  type: 'offset', brand: 'standard', gsm: 100, pricePerSheet: 1306, pricePerTon: 24500000, size: { w: 62, h: 86 } },
    { id: 'off100_65x86',  name: 'Offset 100gsm (65x86)',  type: 'offset', brand: 'standard', gsm: 100, pricePerSheet: 1370, pricePerTon: 24500000, size: { w: 65, h: 86 } },
    { id: 'off100_79x109', name: 'Offset 100gsm (79x109)', type: 'offset', brand: 'standard', gsm: 100, pricePerSheet: 2110, pricePerTon: 24500000, size: { w: 79, h: 109 } },
    // 120gsm — ĐG/TẤN: 24.5 triệu
    { id: 'off120_62x86',  name: 'Offset 120gsm (62x86)',  type: 'offset', brand: 'standard', gsm: 120, pricePerSheet: 1568, pricePerTon: 24500000, size: { w: 62, h: 86 } },
    { id: 'off120_65x86',  name: 'Offset 120gsm (65x86)',  type: 'offset', brand: 'standard', gsm: 120, pricePerSheet: 1643, pricePerTon: 24500000, size: { w: 65, h: 86 } },
    { id: 'off120_79x109', name: 'Offset 120gsm (79x109)', type: 'offset', brand: 'standard', gsm: 120, pricePerSheet: 2532, pricePerTon: 24500000, size: { w: 79, h: 109 } },
    // 140gsm — ĐG/TẤN: 24.5 triệu
    { id: 'off140_62x86',  name: 'Offset 140gsm (62x86)',  type: 'offset', brand: 'standard', gsm: 140, pricePerSheet: 1829, pricePerTon: 24500000, size: { w: 62, h: 86 } },
    { id: 'off140_65x86',  name: 'Offset 140gsm (65x86)',  type: 'offset', brand: 'standard', gsm: 140, pricePerSheet: 1917, pricePerTon: 24500000, size: { w: 65, h: 86 } },
    { id: 'off140_79x109', name: 'Offset 140gsm (79x109)', type: 'offset', brand: 'standard', gsm: 140, pricePerSheet: 2954, pricePerTon: 24500000, size: { w: 79, h: 109 } },
    // 200gsm — ĐG/TẤN: 29.5 triệu
    { id: 'off200_62x86',  name: 'Offset 200gsm (62x86)',  type: 'offset', brand: 'standard', gsm: 200, pricePerSheet: 3146, pricePerTon: 29500000, size: { w: 62, h: 86 } },
    { id: 'off200_65x86',  name: 'Offset 200gsm (65x86)',  type: 'offset', brand: 'standard', gsm: 200, pricePerSheet: 3298, pricePerTon: 29500000, size: { w: 65, h: 86 } },
    { id: 'off200_79x109', name: 'Offset 200gsm (79x109)', type: 'offset', brand: 'standard', gsm: 200, pricePerSheet: 5080, pricePerTon: 29500000, size: { w: 79, h: 109 } },
    // 250gsm — ĐG/TẤN: 29.5 triệu
    { id: 'off250_62x86',  name: 'Offset 250gsm (62x86)',  type: 'offset', brand: 'standard', gsm: 250, pricePerSheet: 3932, pricePerTon: 29500000, size: { w: 62, h: 86 } },
    { id: 'off250_65x86',  name: 'Offset 250gsm (65x86)',  type: 'offset', brand: 'standard', gsm: 250, pricePerSheet: 4123, pricePerTon: 29500000, size: { w: 65, h: 86 } },
    { id: 'off250_79x109', name: 'Offset 250gsm (79x109)', type: 'offset', brand: 'standard', gsm: 250, pricePerSheet: 6351, pricePerTon: 29500000, size: { w: 79, h: 109 } },

    // --- BÃI BẰNG ---
    { id: 'bb60_60x84', name: 'Bãi Bằng 60gsm (60x84)', type: 'bia_bang', brand: 'standard', gsm: 60, pricePerSheet: 786, pricePerTon: 26000000, size: { w: 60, h: 84 } },
    { id: 'bb70_60x84', name: 'Bãi Bằng 70gsm (60x84)', type: 'bia_bang', brand: 'standard', gsm: 70, pricePerSheet: 882, pricePerTon: 25000000, size: { w: 60, h: 84 } },

    // --- IVORY NINGBO — ĐG/TẤN: 19.0 triệu (updated prices) ---
    { id: 'ivory250_65x86',  name: 'Ivory Ningbo 250gsm (65x86)',  type: 'ivory', brand: 'ningbo', gsm: 250, pricePerSheet: 2655, pricePerTon: 19000000, size: { w: 65, h: 86 } },
    { id: 'ivory250_79x109', name: 'Ivory Ningbo 250gsm (79x109)', type: 'ivory', brand: 'ningbo', gsm: 250, pricePerSheet: 4090, pricePerTon: 19000000, size: { w: 79, h: 109 } },
    { id: 'ivory300_65x86',  name: 'Ivory Ningbo 300gsm (65x86)',  type: 'ivory', brand: 'ningbo', gsm: 300, pricePerSheet: 3186, pricePerTon: 19000000, size: { w: 65, h: 86 } },
    { id: 'ivory300_79x109', name: 'Ivory Ningbo 300gsm (79x109)', type: 'ivory', brand: 'ningbo', gsm: 300, pricePerSheet: 4908, pricePerTon: 19000000, size: { w: 79, h: 109 } },
    { id: 'ivory350_65x86',  name: 'Ivory Ningbo 350gsm (65x86)',  type: 'ivory', brand: 'ningbo', gsm: 350, pricePerSheet: 3717, pricePerTon: 19000000, size: { w: 65, h: 86 } },
    { id: 'ivory350_79x109', name: 'Ivory Ningbo 350gsm (79x109)', type: 'ivory', brand: 'ningbo', gsm: 350, pricePerSheet: 5726, pricePerTon: 19000000, size: { w: 79, h: 109 } },
    { id: 'ivory400_65x86',  name: 'Ivory Ningbo 400gsm (65x86)',  type: 'ivory', brand: 'ningbo', gsm: 400, pricePerSheet: 4248, pricePerTon: 19000000, size: { w: 65, h: 86 } },
    { id: 'ivory400_79x109', name: 'Ivory Ningbo 400gsm (79x109)', type: 'ivory', brand: 'ningbo', gsm: 400, pricePerSheet: 6544, pricePerTon: 19000000, size: { w: 79, h: 109 } },

    // --- KRAFT NHẬT ---
    { id: 'kraft80_79x109',  name: 'Kraft Nhật 80gsm (79x109)',  type: 'kraft', brand: 'nhat', gsm: 80,  pricePerSheet: 1102, pricePerTon: null, size: { w: 79, h: 109 } },
    { id: 'kraft100_79x109', name: 'Kraft Nhật 100gsm (79x109)', type: 'kraft', brand: 'nhat', gsm: 100, pricePerSheet: 1378, pricePerTon: null, size: { w: 79, h: 109 } },
    { id: 'kraft120_79x109', name: 'Kraft Nhật 120gsm (79x109)', type: 'kraft', brand: 'nhat', gsm: 120, pricePerSheet: 1653, pricePerTon: null, size: { w: 79, h: 109 } },

    // --- KRAFT VIỆT TRÌ (ĐG/TẤN: 16.5 triệu + VAT 8% = 17.82 triệu) ---
    { id: 'kvt170_79x109', name: 'Kraft Việt Trì 170gsm (79x109)', type: 'kraft', brand: 'viet_tri', gsm: 170, pricePerSheet: 2609, pricePerTon: 17820000, size: { w: 79, h: 109 } },
    { id: 'kvt200_79x109', name: 'Kraft Việt Trì 200gsm (79x109)', type: 'kraft', brand: 'viet_tri', gsm: 200, pricePerSheet: 3069, pricePerTon: 17820000, size: { w: 79, h: 109 } },
    { id: 'kvt230_79x109', name: 'Kraft Việt Trì 230gsm (79x109)', type: 'kraft', brand: 'viet_tri', gsm: 230, pricePerSheet: 3530, pricePerTon: 17820000, size: { w: 79, h: 109 } },
    { id: 'kvt250_79x109', name: 'Kraft Việt Trì 250gsm (79x109)', type: 'kraft', brand: 'viet_tri', gsm: 250, pricePerSheet: 3836, pricePerTon: 17820000, size: { w: 79, h: 109 } },
    { id: 'kvt300_79x109', name: 'Kraft Việt Trì 300gsm (79x109)', type: 'kraft', brand: 'viet_tri', gsm: 300, pricePerSheet: 4603, pricePerTon: 17820000, size: { w: 79, h: 109 } },
    { id: 'kvt350_79x109', name: 'Kraft Việt Trì 350gsm (79x109)', type: 'kraft', brand: 'viet_tri', gsm: 350, pricePerSheet: 5371, pricePerTon: 17820000, size: { w: 79, h: 109 } },

    // --- BRISTOL ---
    { id: 'bristol250_79x109', name: 'Bristol 250gsm (79x109)', type: 'bristol', brand: 'standard', gsm: 250, pricePerSheet: 3200, pricePerTon: null, size: { w: 79, h: 109 } },
    { id: 'bristol300_79x109', name: 'Bristol 300gsm (79x109)', type: 'bristol', brand: 'standard', gsm: 300, pricePerSheet: 3800, pricePerTon: null, size: { w: 79, h: 109 } },

    // --- DUPLEX ---
    { id: 'duplex250_79x109', name: 'Duplex 250gsm (79x109)', type: 'duplex', brand: 'standard', gsm: 250, pricePerSheet: 2500, pricePerTon: null, size: { w: 79, h: 109 } },
    { id: 'duplex300_79x109', name: 'Duplex 300gsm (79x109)', type: 'duplex', brand: 'standard', gsm: 300, pricePerSheet: 3000, pricePerTon: null, size: { w: 79, h: 109 } },
    { id: 'duplex350_79x109', name: 'Duplex 350gsm (79x109)', type: 'duplex', brand: 'standard', gsm: 350, pricePerSheet: 3500, pricePerTon: null, size: { w: 79, h: 109 } },

    // =====================================================
    // DECAL - Dạng cuộn (Roll-based)
    // =====================================================
    { id: 'decal_giay_amazon',  name: 'Decal Giấy Amazon Ghi',      type: 'decal', brand: 'amazon_ghi', isRoll: true, availableWidths: [53.5, 107], rollLength: 500, pricePerM2: 8500,  pricePerTon: null, gsm: 150 },
    { id: 'decal_pp_amazon',    name: 'Decal Nhựa PP Amazon Ghi',   type: 'decal', brand: 'amazon_ghi', isRoll: true, availableWidths: [107, 120],  rollLength: 500, pricePerM2: 13550, pricePerTon: null, gsm: 150 },
    { id: 'decal_da_bo',        name: 'Decal Da Bò (Kraft)',         type: 'decal', brand: 'kraft',      isRoll: true, availableWidths: [107],        rollLength: 500, pricePerM2: 11000, pricePerTon: null, gsm: 70 },
    { id: 'decal_vo_gion',      name: 'Decal Vỡ Giòn (NH-VG001)',   type: 'decal', brand: 'vo',         isRoll: true, availableWidths: [106],        rollLength: 500, pricePerM2: 48000, pricePerTon: null, gsm: 170 },
    { id: 'decal_vo_dai',       name: 'Decal Vỡ Dai (NH-VD002)',    type: 'decal', brand: 'vo',         isRoll: true, availableWidths: [107],        rollLength: 500, pricePerM2: 63000, pricePerTon: null, gsm: 170 },
    { id: 'decal_7mau_do',      name: 'Decal 7 Màu Amazon Đỏ',      type: 'decal', brand: 'amazon_do',  isRoll: true, availableWidths: [107],        rollLength: 500, pricePerM2: 24500, pricePerTon: null, gsm: 150 },
    { id: 'decal_7mau_ghi',     name: 'Decal 7 Màu Amazon Ghi',     type: 'decal', brand: 'amazon_ghi', isRoll: true, availableWidths: [120, 128, 153], rollLength: 500, pricePerM2: 21800, pricePerTon: null, gsm: 150 },

    // =====================================================
    // CARTON LẠNH - hidden
    // =====================================================
    { id: 'carton_lanh_2mm',   name: 'Carton Lạnh 2mm',   type: 'carton', brand: 'lanh', thickness: 2,   pricePerSheet: 12500, pricePerTon: null, size: { w: 65, h: 105 }, hidden: true },
    { id: 'carton_lanh_2.5mm', name: 'Carton Lạnh 2.5mm', type: 'carton', brand: 'lanh', thickness: 2.5, pricePerSheet: 13500, pricePerTon: null, size: { w: 65, h: 105 }, hidden: true },
    { id: 'carton_lanh_3mm',   name: 'Carton Lạnh 3mm',   type: 'carton', brand: 'lanh', thickness: 3,   pricePerSheet: 15000, pricePerTon: null, size: { w: 65, h: 105 }, hidden: true },
];



export const finishing: any = {
    lamination: { glossy: 2300, matte: 2600, tape: 3000 },
    cutting: { level1: 6000, level2: 8000, level3: 10000, level4: 12000, level5: 15000, minCharge: 30000 },
    dieCutting: { mold: { envelopeBig: 300000, envelopeSmall: 200000, folder: 150000, box: 400000 }, runPrice: 100 },
    // Lăn vân giấy (đ/cm²) - giống cách tính UV
    // 230-450gsm: 0.20đ/cm², 120-210gsm: 0.23đ/cm²
    embossing: {
        heavy: 0.20,  // 230-450gsm
        light: 0.23,  // 120-210gsm
    },
    // Gia công bế + dán thành phẩm (đ/cái) - áp dụng sau khi bế khuôn xong
    // Phong bì nhỏ (22x12, 23x16): giá cố định
    // Phong bì to (25x34+): giá theo số lượng
    envelopeFinishing: {
        small: 250,   // đ/cái - cho phong bì nhỏ (W<=20, H<=30)
        // Phong bì to: giảm dần theo số lượng, min 400đ
        large: [
            { minQty: 0,     maxQty: 999,   price: 650 },
            { minQty: 1000,  maxQty: 1999,  price: 580 },
            { minQty: 2000,  maxQty: 4999,  price: 500 },
            { minQty: 5000,  maxQty: 9999,  price: 450 },
            { minQty: 10000, maxQty: Infinity, price: 400 },
        ]
    },
    gluing: { envelopeSmall: 150, envelopeBig: 250, folder: 400, bagSmall: 1800, bagBig: 2500, bagTwoPiece: 3500 },
    binding: {
        saddleStitch: {
            large: 2000,      // qty > 1000
            medium: 3000,     // qty 50-1000
            small: 4500       // qty < 50
        },
        perfectBind: {
            large: 5000,      // qty > 1000
            medium: 12000,    // qty 50-1000
            small: 15000      // qty < 50
        },
        hardCover: {
            large: 30000,     // qty > 1000
            medium: 50000,    // qty 50-1000
            small: 65000      // qty < 50
        }
    },
    uv: { plate: 300000, runPricePerCm2: 0.07 }
};


export const digitalPrices: any = {
    // A. Giá Vật liệu (Giấy & Decal) - Giá theo tờ (Sheet) đã gồm VAT
    materials: [
        // Couche - Giá chính xác từ bảng giá In Nhanh KTS
        { id: 'c100', name: 'Couche 100gsm', type: 'couche', gsm: 100, priceA4: 270, priceA3: 540 },
        { id: 'c120', name: 'Couche 120gsm', type: 'couche', gsm: 120, priceA4: 324, priceA3: 648 },
        { id: 'c150', name: 'Couche 150gsm', type: 'couche', gsm: 150, priceA4: 378, priceA3: 756 },
        { id: 'c200', name: 'Couche 200gsm', type: 'couche', gsm: 200, priceA4: 486, priceA3: 972 },
        { id: 'c250', name: 'Couche 250gsm', type: 'couche', gsm: 250, priceA4: 648, priceA3: 1296 },
        { id: 'c300', name: 'Couche 300gsm', type: 'couche', gsm: 300, priceA4: 756, priceA3: 1512 },

        // Offset - Giá chính xác từ bảng giá In Nhanh KTS
        { id: 'off80', name: 'Offset 80gsm', type: 'offset', gsm: 80, priceA4: 216, priceA3: 432 },
        { id: 'off100', name: 'Offset 100gsm', type: 'offset', gsm: 100, priceA4: 270, priceA3: 540 },
        { id: 'off120', name: 'Offset 120gsm', type: 'offset', gsm: 120, priceA4: 324, priceA3: 648 },
        { id: 'off140', name: 'Offset 140gsm', type: 'offset', gsm: 140, priceA4: 378, priceA3: 756 },
        { id: 'off200', name: 'Offset 200gsm', type: 'offset', gsm: 200, priceA4: 594, priceA3: 1188 },
        { id: 'off250', name: 'Offset 250gsm', type: 'offset', gsm: 250, priceA4: 702, priceA3: 1404 },

        // Ivory - Giá chính xác từ bảng giá In Nhanh KTS
        { id: 'ivory250', name: 'Ivory 250gsm', type: 'ivory', gsm: 250, priceA4: 756, priceA3: 1512 },
        { id: 'ivory300', name: 'Ivory 300gsm', type: 'ivory', gsm: 300, priceA4: 918, priceA3: 1836 },

        // Decal - Giá theo bảng giá In Nhanh KTS
        // Note: Decal có kích thước cố định, giá đã quy đổi sang A4 equivalent
        { id: 'decal_giay_21x31', name: 'Decal Giấy 21x31cm', type: 'decal', gsm: 150, priceA4: 1100, priceA3: 2200 },
        { id: 'decal_vo_kt', name: 'Decal Vỡ KT 26.5x33cm', type: 'decal', gsm: 170, priceA4: 11000, priceA3: 22000, isVo: true },
        { id: 'decal_bac_thiec', name: 'Decal Bạc, Thiếc 31x43', type: 'decal', gsm: 150, priceA4: 4400, priceA3: 8800, isSpecial: true },
        { id: 'decal_thiec_7mau', name: 'Decal Thiếc 7 màu A4', type: 'decal', gsm: 150, priceA4: 3300, priceA3: 6600, isSpecial: true },
        { id: 'decal_nhua_trong', name: 'Decal Nhựa trong A4', type: 'decal', gsm: 150, priceA4: 2200, priceA3: 4400 },
        { id: 'decal_nhua_mo', name: 'Decal Nhựa mờ A4', type: 'decal', gsm: 150, priceA4: 2200, priceA3: 4400 },
    ],

    // UV DTF Pricing
    uvDtf: {
        s20x28: [ // 20 x 28 cm
            { max: 10, price: 25000 },
            { max: 50, price: 25000 },
            { max: 70, price: 23000 },
            { max: 100, price: 23000 },
            { max: Infinity, price: 23000 }
        ],
        s58x20: [ // 58 x 20 cm
            { max: 10, price: 100000 },
            { max: 50, price: 90000 },
            { max: 70, price: 70000 },
            { max: 100, price: 50000 },
            { max: Infinity, price: 48000 }
        ],
        meter: { // > 100m
            w28: 100000, // Khổ 28cm: 100k/m
            w58: 190000  // Khổ 58cm: 190k/m
        }
    },

    // B. Giá In màu (Click Charge) - Tính luỹ tiến theo lượt A4
    printing: {
        color: [
            { max: 100, price: 2160, priceSpecial: 3240, priceVo: 4320, priceEnvelope: 2160 },
            { max: 200, price: 1836, priceSpecial: 2700, priceVo: 2808, priceEnvelope: 1836 },
            { max: 300, price: 1404, priceSpecial: 2160, priceVo: 2592, priceEnvelope: 1728 },
            { max: 400, price: 1296, priceSpecial: 1944, priceVo: 2484, priceEnvelope: 1620 },
            { max: 500, price: 1188, priceSpecial: 1782, priceVo: 2484, priceEnvelope: 1512 },
            { max: 1000, price: 1080, priceSpecial: 1620, priceVo: 2268, priceEnvelope: 1404 },
            { max: Infinity, price: 789, priceSpecial: 1080, priceVo: 1404, priceEnvelope: 972 }
        ],
        bw: {
            standard: [
                { max: 500, price: 324 },
                { max: Infinity, price: 216 }
            ],
            decal: 540 // Mọi số lượng
        }
    },

    // D. Giá Gia công
    finishing: {
        lamination: {
            glossy: { min: 800, max: 1000 }, // 800-1000đ/mặt A4
            matte: { min: 1600, max: 2000 },  // 1600-2000đ/mặt A4
            tape: { min: 800, max: 1000 }    // Cán băng keo (tạm tính bằng cán bóng)
        },
        dieCut: { // Bế Decal
            a4: { oneMold: 1000, twoMolds: 2000 },
            a3: { oneMold: 2000, twoMolds: 4000 }
        },
        plastic: { // Ép Plastic
            a4: { min: 3000, max: 5000 },
            a5: { min: 2000, max: 2500 }
        },
        binding: { // Đóng cuốn
            saddleStitch: { // Ghim lồng
                small: 2000,   // < 50 cuốn
                medium: 1500,  // 50-200 cuốn
                large: 1000    // > 200 cuốn
            },
            perfectBind: { // Keo gáy
                small: 5000,   // < 50 cuốn
                medium: 4000,  // 50-200 cuốn
                large: 3000    // > 200 cuốn
            },
            hardCover: { // Bìa cứng
                small: 150000,
                medium: 120000,
                large: 100000
            }
        }
    },

    // Khổ giấy in Digital hỗ trợ
    paperSizes: [
        { name: 'A4', w: 21, h: 29.7, area: 623.7 },
        { name: 'A3', w: 29.7, h: 42, area: 1247.4 },
        { name: 'SRA3', w: 32, h: 45, area: 1440 },
        { name: 'Max', w: 33, h: 48.3, area: 1593.9 }
    ],

    // E. Cấu hình mặc định
    config: {
        defaultPrintPrice: 789, // Giá mặc định khi không tìm thấy tier (thường là tier cuối)
        designFees: {
            basic: 200000, // Legacy fallback
            advance: 500000, // Legacy fallback

            // Map from HTML values
            calendar_wall_7: 1500000,
            calendar_wall_5: 1200000,
            calendar_desk_13: 2000000,
            high_calendar: 1000000,
            high_bag: 300000,
            high_catalogue: 250000,
            high_letterhead: 200000,
            medium_standard: 150000,
            low_card: 100000,
            low_tag: 50000,
            special_book: 50000 // Per page logic handled separately or fixed for now
        }
    }
};


