import { Product } from '../types';

/**
 * Calculates the final price for a product based on quantity,
 * prioritizing tiered pricing over percentage discounts.
 * 
 * @param product The product object, which may contain price tiers and discount percentages.
 * @param quantity The number of items being purchased.
 * @returns The final price per item.
 */
export const getFinalPrice = (product: Product, quantity: number): number => {
    // 1. Check for applicable tiered price
    if (product.priceTiers && product.priceTiers.length > 0) {
        // Sort tiers by minQuantity descending to find the best applicable price
        const sortedTiers = [...product.priceTiers].sort((a, b) => b.minQuantity - a.minQuantity);
        
        for (const tier of sortedTiers) {
            // If the quantity is enough for this tier, return its price.
            // This is the wholesale price, which overrides other discounts.
            if (quantity >= tier.minQuantity) {
                return tier.price;
            }
        }
    }

    // 2. If no tier applies, check for a percentage discount
    if (product.discountPercent && product.discountPercent > 0) {
        return product.sellingPrice * (1 - product.discountPercent / 100);
    }

    // 3. If no discounts at all, return the base selling price
    return product.sellingPrice;
};
