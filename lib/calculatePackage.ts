export interface PackageResult {
  eligible: boolean;
  price: number;
  tierLabel: string;
  reasoning: string;
  coverage: string[];
}

/**
 * Extra Shield AI Warranty Advisor pricing logic.
 *
 * Rs.40,000 - Rs.70,000   -> Rs.6,990
 * Rs.70,001 - Rs.100,000  -> Rs.9,990
 * Above Rs.100,000        -> Rs.9,990 base + Rs.5,000 per additional
 *                            (or part of) Rs.50,000
 */
export function calculatePackage(deviceValue: number): PackageResult {
  if (!deviceValue || deviceValue < 40000) {
    return {
      eligible: false,
      price: 0,
      tierLabel: "Not eligible",
      reasoning:
        "Devices under Rs. 40,000 currently fall outside our standard protection tiers. Talk to an agent for a custom quote.",
      coverage: [],
    };
  }

  let price: number;
  let tierLabel: string;
  let reasoning: string;

  if (deviceValue <= 70000) {
    price = 6990;
    tierLabel = "Essential Shield";
    reasoning =
      "Your device value falls in the Rs. 40,000 – 70,000 bracket, which qualifies for our entry-level protection tier.";
  } else if (deviceValue <= 100000) {
    price = 9990;
    tierLabel = "Total Care";
    reasoning =
      "Your device value falls in the Rs. 70,001 – 100,000 bracket, which qualifies for full accidental + warranty coverage.";
  } else {
    const extra = deviceValue - 100000;
    const steps = Math.ceil(extra / 50000);
    price = 9990 + steps * 5000;
    tierLabel = "Elite Enterprise";
    reasoning = `Your device is valued above Rs. 100,000. We start from the Rs. 9,990 base and add Rs. 5,000 for every additional Rs. 50,000 (or part of it) — ${steps} step${
      steps > 1 ? "s" : ""
    } above the base threshold.`;
  }

  const coverage = [
    "Manufacturer warranty extension",
    "Screen crack protection",
    "Priority repair queue",
    "Free diagnostic checkups",
    "Accidental damage protection",
    "Liquid damage coverage",
    "One-time screen replacement",
    "24/7 AI claim assistant",
    "Theft & loss protection",
    "Unlimited claim submissions",
    "Same-day device replacement",
    "Dedicated account manager",
  ];

  return { eligible: true, price, tierLabel, reasoning, coverage };
}