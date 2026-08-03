/**
 * Agent commission tiers, based on the package price.
 *
 * Rs. 6,990 package  -> Rs. 990 commission
 * Rs. 9,990 package  -> Rs. 1,490 commission
 * Above Rs. 9,990    -> Rs. 1,490 base + Rs. 500 per additional
 *                        (or part of) Rs. 5,000
 */
export function calculateCommission(packagePrice: number): number {
  if (!packagePrice || packagePrice <= 0) return 0;

  if (packagePrice <= 6990) {
    return 990;
  }

  if (packagePrice <= 9990) {
    return 1490;
  }

  const extra = packagePrice - 9990;
  const steps = Math.ceil(extra / 5000);
  return 1490 + steps * 500;
}