export function formatAdPrice(ad?: {
  price?: number;
  minInvestment?: number;
  maxInvestment?: number;
}): string {
  if (!ad) return "";
  
  const min = ad.minInvestment;
  const max = ad.maxInvestment;
  const price = ad.price;

  const hasMin = min !== undefined && min !== null;
  const hasMax = max !== undefined && max !== null;
  const hasPrice = price !== undefined && price !== null;

  if (hasMin && hasMax) {
    if (min === max) {
      return `৳ ${min.toLocaleString()}`;
    }
    return `৳ ${min.toLocaleString()} - ৳ ${max.toLocaleString()}`;
  }
  
  if (hasMin) {
    return `Min: ৳ ${min.toLocaleString()}`;
  }
  
  if (hasMax) {
    return `Max: ৳ ${max.toLocaleString()}`;
  }

  if (hasPrice) {
    return `৳ ${price.toLocaleString()}`;
  }

  return "";
}
