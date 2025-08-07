import type { PackagePricing } from '../types/drug.types';

/**
 * Calculate package pricing for a drug
 * @param individualPrice Price per individual unit
 * @param packageInfo Package information
 * @returns Package pricing with savings calculations
 */
export const calculatePackagePricing = (
    individualPrice: number,
    packageInfo?: {
        isPackaged: boolean;
        unitsPerPack?: number;
        packsPerCarton?: number;
        packPrice?: number;
        cartonPrice?: number;
    }
): PackagePricing => {
    const result: PackagePricing = {
        individualPrice,
    };

    if (packageInfo?.isPackaged) {
        if (packageInfo.packPrice && packageInfo.unitsPerPack) {
            result.packPrice = packageInfo.packPrice;
            const individualTotal = individualPrice * packageInfo.unitsPerPack;
            result.packSavings = individualTotal - packageInfo.packPrice;
        }

        if (packageInfo.cartonPrice && packageInfo.packsPerCarton && packageInfo.packPrice) {
            result.cartonPrice = packageInfo.cartonPrice;
            const packTotal = packageInfo.packPrice * packageInfo.packsPerCarton;
            result.cartonSavings = packTotal - packageInfo.cartonPrice;
        }
    }

    return result;
};

/**
 * Format currency for display
 * @param amount Amount to format
 * @param currency Currency code (default: GHC)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'GHC'): string => {
    return new Intl.NumberFormat('en-GH', {
        style: 'currency',
        currency: currency === 'GHC' ? 'GHS' : currency,
    }).format(amount);
};

/**
 * Calculate savings percentage
 * @param originalPrice Original price
 * @param discountedPrice Discounted price
 * @returns Savings percentage
 */
export const calculateSavingsPercentage = (originalPrice: number, discountedPrice: number): number => {
    if (originalPrice <= 0) return 0;
    return ((originalPrice - discountedPrice) / originalPrice) * 100;
};

/**
 * Get the best pricing option for a given quantity
 * @param quantity Quantity needed
 * @param individualPrice Price per individual unit
 * @param packageInfo Package information
 * @returns Best pricing option with total cost and savings
 */
export const getBestPricingOption = (
    quantity: number,
    individualPrice: number,
    packageInfo?: {
        isPackaged: boolean;
        unitsPerPack?: number;
        packsPerCarton?: number;
        packPrice?: number;
        cartonPrice?: number;
    }
) => {
    const individualTotal = quantity * individualPrice;
    let bestOption = {
        type: 'individual' as const,
        totalCost: individualTotal,
        savings: 0,
        units: quantity,
        packs: 0,
        cartons: 0,
    };

    if (!packageInfo?.isPackaged) {
        return bestOption;
    }

    const { unitsPerPack, packsPerCarton, packPrice, cartonPrice } = packageInfo;

    // Calculate pack option
    if (unitsPerPack && packPrice) {
        const packsNeeded = Math.ceil(quantity / unitsPerPack);
        const packTotal = packsNeeded * packPrice;
        const packSavings = (packsNeeded * unitsPerPack * individualPrice) - packTotal;

        if (packTotal < bestOption.totalCost) {
            bestOption = {
                type: 'pack',
                totalCost: packTotal,
                savings: packSavings,
                units: packsNeeded * unitsPerPack,
                packs: packsNeeded,
                cartons: 0,
            };
        }
    }

    // Calculate carton option
    if (packsPerCarton && cartonPrice && unitsPerPack && packPrice) {
        const totalUnitsNeeded = Math.ceil(quantity / unitsPerPack) * unitsPerPack;
        const cartonsNeeded = Math.ceil(totalUnitsNeeded / (unitsPerPack * packsPerCarton));
        const cartonTotal = cartonsNeeded * cartonPrice;
        const cartonSavings = (cartonsNeeded * packsPerCarton * unitsPerPack * individualPrice) - cartonTotal;

        if (cartonTotal < bestOption.totalCost) {
            bestOption = {
                type: 'carton',
                totalCost: cartonTotal,
                savings: cartonSavings,
                units: cartonsNeeded * packsPerCarton * unitsPerPack,
                packs: cartonsNeeded * packsPerCarton,
                cartons: cartonsNeeded,
            };
        }
    }

    return bestOption;
};
