// @ts-nocheck
import calculateFolder from './strategies/folder';
import calculateFlyer from './strategies/flyer';
import calculateCatalogue from './strategies/catalogue';
import calculateEnvelope from './strategies/envelope';
import calculateCalendar from './strategies/calendar';
import calculateBag from './strategies/bag';
import calculateDigital from './strategies/digital';

export class PricingEngine {
    strategies: Record<string, (req: any, ...args: any[]) => any>;

    constructor() {
        this.strategies = {
            'digital': calculateDigital,
            'catalogue': calculateCatalogue,
            'calendar': calculateCalendar,
            'bag': calculateBag,
            'envelope': (req: any) => calculateEnvelope(req, 'envelope'),
            'lixi': (req: any) => calculateEnvelope(req, 'lixi'),
            'folder': calculateFolder,
            'flyer': calculateFlyer,
            'carbonless': () => { throw new Error('Carbonless strategy not yet migrated to backend'); }
        };
    }

    calculate(request: any) {
        const { printTech, productType } = request;

        try {
            // 1. Digital Printing takes precedence
            if (printTech === 'digital') {
                return this.strategies['digital'](request);
            }

            // 2. Offset Products -> Lookup in strategy map
            const strategy = this.strategies[productType] || this.strategies['flyer'];
            return strategy(request);

        } catch (error) {
            console.error('Calculation Error:', error);
            throw error;
        }
    }

    getRecommendedProfit(productType: string, printTech: string, quantity: number): number {
        if (productType === 'lixi') {
            if (quantity < 200) return 10;
            if (quantity < 300) return 14;
            if (quantity < 500) return 46;
            if (quantity < 1000) return 45;
            if (quantity < 2000) return 34;
            if (quantity < 3000) return 29;
            if (quantity < 5000) return 14;
            if (quantity < 10000) return 10;
            return 10;
        }

        if (productType === 'envelope' || productType === 'bag') {
            if (quantity < 1000) return 50;
            if (quantity < 3000) return 45;
            if (quantity < 5000) return 40;
            return 35;
        }

        if (productType === 'flyer') {
            if (quantity < 1000) return 75;
            if (quantity < 3000) return 60;
            if (quantity < 5000) return 70;
            return 75;
        }

        if (productType === 'folder') {
            if (quantity < 1000) return 45;
            if (quantity < 2000) return 35;
            if (quantity < 5000) return 25;
            return 20;
        }

        if (printTech === 'offset') return 40;
        if (printTech === 'digital') return 80;
        return 30;
    }
}

export const pricingEngine = new PricingEngine();
export default pricingEngine;
