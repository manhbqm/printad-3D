// @ts-nocheck
import pricingEngine, { PricingEngine } from './printQuote/PricingEngine';
import { machines, papers, finishing, digitalPrices } from './printQuote/data';
import {
  calculateOptimalLayout,
  resolvePaperCandidates,
  getDerivedPapers,
  getPrintableArea,
  calculateWaste,
  generateRollWidths,
  getUniquePapers,
  getAllPaperSizes
} from './printQuote/utils';

export {
  pricingEngine,
  PricingEngine,
  machines,
  papers,
  finishing,
  digitalPrices,
  calculateOptimalLayout,
  resolvePaperCandidates,
  getDerivedPapers,
  getPrintableArea,
  calculateWaste,
  generateRollWidths,
  getUniquePapers,
  getAllPaperSizes
};

export const CLOUD_PRINT_QUOTE_URL = 'https://baogiainan.88qm.top/';
export const CLOUD_PRINT_QUOTE_GITHUB = 'https://github.com/manhbqm/print-quote';

export type SupportedPrintProduct =
  | 'flyer'
  | 'catalogue'
  | 'bag'
  | 'folder'
  | 'envelope'
  | 'lixi'
  | 'calendar'
  | 'uv_dtf'
  | 'hiflex'
  | 'decal_pp'
  | 'mica_led'
  | 'standee';

export interface RealPrintQuoteRequest {
  printTech: 'offset' | 'digital';
  productType: SupportedPrintProduct;
  productNameVi: string;
  quantity: number;
  productSize: { w: number; h: number; d?: number; flap?: number };
  paperId: string;
  paperName: string;
  printSides: 1 | 2;
  printColors: number;
  finishingOptions: {
    laminationType: 'none' | 'glossy' | 'matte' | 'tape';
    laminationSides?: number;
    cutting?: boolean;
    dieCut?: boolean;
    dieCutMold?: string;
    embossing?: boolean;
    gluing?: boolean;
    gluingType?: string;
    bindingType?: 'saddleStitch' | 'perfectBind' | 'hardCover';
    uv?: boolean;
  };
  catalogueData?: {
    totalPages: number;
    coverPaperId: string;
    contentPaperId: string;
    coverPrintColors: number;
    contentPrintColors: number;
    bindingType: 'saddleStitch' | 'perfectBind' | 'hardCover';
    catalogueSize: 'A4' | 'A5';
  };
  calendarData?: {
    innerPages: number;
    type: 'desk' | 'wall';
    sizePreset?: string;
    coverPaperId: string;
    contentPaperId: string;
    coverPrintColors: number;
    contentPrintColors: number;
  };
  designFee?: number;
  shippingFee?: number;
  profitMargin?: number;
}

export interface RealPrintQuoteResult {
  totalCost: number;
  costPerUnit: number;
  profitVnd: number;
  profitMarginPercent: number;
  details: {
    machine?: string;
    paperName?: string;
    grossSheets?: number;
    wasteSheets?: number;
    productsPerSheet?: number;
    paperCost?: number;
    printingCost?: number;
    finishingCost?: number;
    designFee?: number;
    shippingFee?: number;
    printStyle?: string;
    layoutSummary?: string;
  };
  calculationRows: Array<{
    item: string;
    spec: string;
    quantity: string;
    unitPrice: string;
    subtotal: string;
  }>;
  cloudAppUrl: string;
}

export function formatVnd(amount: number): string {
  return `${Math.round(amount).toLocaleString('vi-VN')}đ`;
}

/**
 * Intelligent prompt parser that extracts printing parameters from natural language prompts.
 */
export function parsePrintingPrompt(prompt: string): RealPrintQuoteRequest | null {
  const lower = prompt.toLowerCase();

  // Detect product type
  let productType: SupportedPrintProduct = 'flyer';
  let isCatalogue = false;
  let isBag = false;
  let isFolder = false;
  let isEnvelope = false;
  let isLixi = false;
  let isUvDtf = false;

  if (lower.includes('catalogue') || lower.includes('catalog') || lower.includes('kỷ yếu') || lower.includes('cuốn')) {
    productType = 'catalogue';
    isCatalogue = true;
  } else if (lower.includes('túi giấy') || lower.includes('túi quà') || lower.includes('túi xách') || lower.includes('túi shop')) {
    productType = 'bag';
    isBag = true;
  } else if (lower.includes('kẹp file') || lower.includes('folder') || lower.includes('bìa hồ sơ') || lower.includes('bìa kẹp')) {
    productType = 'folder';
    isFolder = true;
  } else if (lower.includes('lì xì') || lower.includes('bao lì xì')) {
    productType = 'lixi';
    isLixi = true;
  } else if (lower.includes('phong bì') || lower.includes('bao thư') || lower.includes('phong bì thư')) {
    productType = 'envelope';
    isEnvelope = true;
  } else if (lower.includes('uv dtf') || lower.includes('dtf') || lower.includes('tem uv')) {
    productType = 'uv_dtf';
    isUvDtf = true;
  } else if (lower.includes('tờ rơi') || lower.includes('flyer') || lower.includes('leaflet') || lower.includes('poster')) {
    productType = 'flyer';
  } else {
    // If none matched, check if it explicitly mentions offset or paper
    if (lower.includes('couche') || lower.includes('ivory') || lower.includes('in offset')) {
      productType = 'flyer';
    } else {
      return null;
    }
  }

  // Parse quantity
  const qtyMatch = prompt.match(/(\d+(?:[.,]\d+)?)\s*(?:tờ|cuốn|cái|chiếc|bộ|bìa|bao|tem|quyển|sp|bài)/i) ||
    prompt.match(/(?:số\s*lượng|sl|qty|sl:)\s*(\d+(?:[.,]\d+)?)/i) ||
    prompt.match(/\b(\d{2,6})\b/);

  let quantity = 1000;
  if (qtyMatch) {
    const rawVal = qtyMatch[1] || qtyMatch[0];
    quantity = Math.max(1, parseInt(rawVal.replace(/[.,]/g, ''), 10));
  }

  // Parse size
  let productSize = { w: 21, h: 29.7, d: 0, flap: 0 };
  if (isCatalogue) {
    if (lower.includes('a5')) {
      productSize = { w: 14.8, h: 21, d: 0, flap: 0 };
    } else {
      productSize = { w: 21, h: 29.7, d: 0, flap: 0 };
    }
  } else if (isFolder) {
    productSize = { w: 22, h: 31, d: 0, flap: 7 };
  } else if (isBag) {
    // Look for WxHxD, e.g., 25x35x10 or 25x30x10
    const bagDim = prompt.match(/(\d+)\s*[xX*×]\s*(\d+)\s*[xX*×]\s*(\d+)/);
    if (bagDim) {
      productSize = {
        w: parseFloat(bagDim[1]),
        h: parseFloat(bagDim[2]),
        d: parseFloat(bagDim[3]),
        flap: 4
      };
    } else {
      productSize = { w: 25, h: 35, d: 10, flap: 4 };
    }
  } else if (isEnvelope) {
    if (lower.includes('a4') || lower.includes('25x34')) {
      productSize = { w: 25, h: 34, d: 0, flap: 3.5 };
    } else if (lower.includes('a5') || lower.includes('16x23')) {
      productSize = { w: 16, h: 23, d: 0, flap: 3 };
    } else {
      // A6 default
      productSize = { w: 12, h: 22, d: 0, flap: 3 };
    }
  } else if (isLixi) {
    productSize = { w: 8, h: 16, d: 0, flap: 2.5 };
  } else if (isUvDtf) {
    const uvDim = prompt.match(/(\d+(?:[.,]\d+)?)\s*[xX*×]\s*(\d+(?:[.,]\d+)?)/);
    if (uvDim) {
      productSize = { w: parseFloat(uvDim[1]), h: parseFloat(uvDim[2]), d: 0, flap: 0 };
    } else {
      productSize = { w: 5, h: 5, d: 0, flap: 0 };
    }
  } else {
    // Flyer default size
    if (lower.includes('a3')) productSize = { w: 29.7, h: 42, d: 0, flap: 0 };
    else if (lower.includes('a5')) productSize = { w: 14.8, h: 21, d: 0, flap: 0 };
    else if (lower.includes('a6')) productSize = { w: 10.5, h: 14.8, d: 0, flap: 0 };
    else productSize = { w: 21, h: 29.7, d: 0, flap: 0 };
  }

  // Parse paper
  let paperId = 'chk150_65x86';
  let paperName = 'Couche Hi-kote 150gsm';

  if (isBag) {
    if (lower.includes('kraft')) {
      paperId = 'kvt250_79x109';
      paperName = 'Kraft Việt Trì 250gsm';
    } else if (lower.includes('duplex')) {
      paperId = 'duplex300_79x109';
      paperName = 'Duplex 300gsm';
    } else {
      paperId = 'ivory250_79x109';
      paperName = 'Ivory Ningbo 250gsm';
    }
  } else if (isFolder) {
    paperId = 'chk300_79x109';
    paperName = 'Couche Hi-kote 300gsm';
  } else if (isEnvelope) {
    if (lower.includes('140') || lower.includes('150')) {
      paperId = 'off140_79x109';
      paperName = 'Offset 140gsm';
    } else if (lower.includes('100')) {
      paperId = 'off100_79x109';
      paperName = 'Offset 100gsm';
    } else {
      paperId = 'off120_79x109';
      paperName = 'Offset 120gsm';
    }
  } else if (isCatalogue) {
    paperId = 'chk150_79x109';
    paperName = 'Ruột C150 / Bìa C250';
  } else {
    // Flyer
    if (lower.includes('c300') || lower.includes('300gsm')) {
      paperId = 'chk300_65x86';
      paperName = 'Couche Hi-kote 300gsm';
    } else if (lower.includes('c250') || lower.includes('250gsm')) {
      paperId = 'chk250_65x86';
      paperName = 'Couche Hi-kote 250gsm';
    } else if (lower.includes('c200') || lower.includes('200gsm')) {
      paperId = 'chk200_65x86';
      paperName = 'Couche Hi-kote 200gsm';
    } else if (lower.includes('c100') || lower.includes('100gsm')) {
      paperId = 'chk100_65x86';
      paperName = 'Couche Hi-kote 100gsm';
    } else if (lower.includes('c120') || lower.includes('120gsm')) {
      paperId = 'chk120_65x86';
      paperName = 'Couche Hi-kote 120gsm';
    } else if (lower.includes('decal')) {
      paperId = 'decal_giay_amazon';
      paperName = 'Decal Giấy Amazon Ghi';
    } else {
      paperId = 'chk150_65x86';
      paperName = 'Couche Hi-kote 150gsm';
    }
  }

  // Parse finishing
  const hasGlossy = lower.includes('cán bóng') || lower.includes('màng bóng');
  const hasMatte = lower.includes('cán mờ') || lower.includes('màng mờ');
  const laminationType: 'none' | 'glossy' | 'matte' = hasGlossy
    ? 'glossy'
    : hasMatte || isFolder || isBag
    ? 'matte'
    : lower.includes('cán')
    ? 'matte'
    : 'none';

  // Parse sides
  const printSides: 1 | 2 = lower.includes('1 mặt') || lower.includes('một mặt') || isFolder || isBag ? 1 : 2;

  // Parse catalogue total pages
  let totalPages = 16;
  if (isCatalogue) {
    const pageMatch = prompt.match(/(\d+)\s*(?:trang|tr\b)/i);
    if (pageMatch) totalPages = Math.max(8, parseInt(pageMatch[1], 10));
  }

  const printTech: 'offset' | 'digital' = isUvDtf ? 'digital' : (quantity < 200 && (isCatalogue || productType === 'flyer') ? 'digital' : 'offset');
  const profitMargin = pricingEngine.getRecommendedProfit(productType, printTech, quantity);

  return {
    printTech,
    productType,
    productNameVi: isCatalogue
      ? `Catalogue ${totalPages} trang`
      : isBag
      ? `Túi giấy ${productSize.w}x${productSize.h}x${productSize.d}cm`
      : isFolder
      ? 'Kẹp file Folder A4 tai gấp 7cm'
      : isEnvelope
      ? `Phong bì ${productSize.w}x${productSize.h}cm`
      : isLixi
      ? 'Bao lì xì Tết'
      : isUvDtf
      ? `Tem UV DTF ${productSize.w}x${productSize.h}cm`
      : `Tờ rơi ${productSize.w === 21 ? 'A4' : productSize.w === 14.8 ? 'A5' : 'A3'}`,
    quantity,
    productSize,
    paperId,
    paperName,
    printSides,
    printColors: 4,
    finishingOptions: {
      laminationType,
      cutting: true,
      gluing: isBag || isFolder || isEnvelope || isLixi,
      dieCut: isBag || isFolder || isEnvelope || isLixi,
      bindingType: totalPages > 32 ? 'perfectBind' : 'saddleStitch'
    },
    catalogueData: isCatalogue
      ? {
          totalPages,
          coverPaperId: 'chk250_79x109',
          contentPaperId: 'chk150_79x109',
          coverPrintColors: 4,
          contentPrintColors: 4,
          bindingType: totalPages > 32 ? 'perfectBind' : 'saddleStitch',
          catalogueSize: productSize.w === 14.8 ? 'A5' : 'A4'
        }
      : undefined,
    designFee: 0,
    shippingFee: 0,
    profitMargin
  };
}

/**
 * Executes calculation using the official print-quote PricingEngine.
 */
export function executePrintQuote(req: RealPrintQuoteRequest): RealPrintQuoteResult {
  const calcReq: any = {
    printTech: req.printTech,
    productType: req.productType,
    quantity: req.quantity,
    productSize: req.productSize,
    width: req.productSize?.w || 5,
    height: req.productSize?.h || 5,
    paperId: req.paperId,
    printSides: req.printSides,
    printColors: req.printColors,
    finishingOptions: req.finishingOptions,
    designFee: req.designFee || 0,
    shippingFee: req.shippingFee || 0,
    profitMargin: req.profitMargin || pricingEngine.getRecommendedProfit(req.productType, req.printTech, req.quantity)
  };

  if (req.catalogueData) {
    calcReq.catalogueData = req.catalogueData;
  }

  let rawResult: any;
  try {
    rawResult = pricingEngine.calculate(calcReq);
  } catch (err: any) {
    console.error('PricingEngine failed, applying fallback estimation:', err);
    // Fallback if paper ID or constraint failed
    const fallbackCost = req.quantity * (req.productType === 'catalogue' ? 22000 : req.productType === 'bag' ? 12000 : 1500);
    rawResult = {
      totalCost: fallbackCost,
      costPerUnit: fallbackCost / req.quantity,
      details: {
        machine: 'Máy Offset 4 màu tiêu chuẩn',
        paper: { name: req.paperName },
        grossSheets: req.quantity,
        wasteSheets: 50,
        productsPerSheet: 1,
        paperCost: fallbackCost * 0.45,
        printingCost: fallbackCost * 0.35,
        finishingCost: fallbackCost * 0.20,
        profit: fallbackCost * 0.25
      }
    };
  }

  const totalCost = Number(rawResult.totalCost || rawResult.totalPrice || 0);
  const costPerUnit = Number(rawResult.costPerUnit || rawResult.pricePerUnit || (totalCost / req.quantity));
  const details = rawResult.details || {};
  const paperCost = Number(details.paperCost || 0);
  const printingCost = Number(details.printingCost || details.printCost || 0);
  const finishingCost = Number(details.finishingCost || 0);
  const profitVnd = Number(details.profit || 0);
  const machine = (details.layout && details.layout.name)
    ? `In UV DTF: ${details.layout.name}`
    : (typeof details.machine === 'string' ? details.machine : 'Máy Offset 4 màu chuyên dụng');
  const paperObj = details.paper;
  const paperName = (paperObj && typeof paperObj === 'object' && paperObj.name) ? paperObj.name : req.paperName;
  const grossSheets = details.grossSheets || 0;
  const productsPerSheet = details.productsPerSheet || 1;
  const printStyle = details.printStyle || (req.printSides === 2 ? 'In 2 mặt 4 màu' : 'In 1 mặt 4 màu');

  const calculationRows: Array<{
    item: string;
    spec: string;
    quantity: string;
    unitPrice: string;
    subtotal: string;
  }> = [
    {
      item: '1. Tiền giấy in ấn',
      spec: `${paperName} (Khổ cắt tối ưu, ${grossSheets} tờ in)`,
      quantity: `${grossSheets} tờ`,
      unitPrice: formatVnd(paperCost / (grossSheets || 1)),
      subtotal: formatVnd(paperCost)
    },
    {
      item: '2. Công in ấn offset/KTS',
      spec: `${machine} (${printStyle})`,
      quantity: `${req.quantity} SP`,
      unitPrice: formatVnd(printingCost / req.quantity),
      subtotal: formatVnd(printingCost)
    },
    {
      item: '3. Gia công sau in & Hoàn thiện',
      spec: `${req.finishingOptions.laminationType !== 'none' ? `Cán màng ${req.finishingOptions.laminationType === 'matte' ? 'mờ' : 'bóng'}` : 'Không cán'} + Cắt/Bế/Dán định hình`,
      quantity: `${req.quantity} SP`,
      unitPrice: formatVnd(finishingCost / req.quantity),
      subtotal: formatVnd(finishingCost)
    },
    {
      item: '4. Lợi nhuận định mức & Rủi ro vật tư',
      spec: `Tỷ suất ${req.profitMargin || 30}% theo bậc sản lượng`,
      quantity: 'Tỷ lệ %',
      unitPrice: `${req.profitMargin || 30}%`,
      subtotal: formatVnd(profitVnd)
    },
    {
      item: 'TỔNG CỘNG ĐƠN HÀNG (Chưa VAT)',
      spec: `Đơn giá xuất xưởng: ${formatVnd(costPerUnit)}/SP`,
      quantity: `${req.quantity.toLocaleString('vi-VN')} SP`,
      unitPrice: `${formatVnd(costPerUnit)}/SP`,
      subtotal: formatVnd(totalCost)
    }
  ];

  return {
    totalCost,
    costPerUnit,
    profitVnd,
    profitMarginPercent: req.profitMargin || 30,
    details: {
      machine,
      paperName,
      grossSheets,
      wasteSheets: details.wasteSheets || 0,
      productsPerSheet,
      paperCost,
      printingCost,
      finishingCost,
      designFee: details.designFee || 0,
      shippingFee: details.shippingFee || 0,
      printStyle,
      layoutSummary: `${productsPerSheet} SP/tờ (${grossSheets} tờ in)`
    },
    calculationRows,
    cloudAppUrl: CLOUD_PRINT_QUOTE_URL
  };
}
