const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

/** Rupees with Indian digit grouping and no decimals, e.g. ₹1,25,000. */
export function formatINR(value: number): string {
  return inr.format(value);
}
