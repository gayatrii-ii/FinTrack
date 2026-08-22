export const formatCurrency = (
  amount: number,
  currencyCode = 'INR',
  options?: { showSign?: boolean; compact?: boolean }
): string => {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);

  let formatted = '';

  if (currencyCode === 'INR') {
    formatted = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: options?.compact ? 0 : 2,
      minimumFractionDigits: 0,
      notation: options?.compact ? 'compact' : 'standard',
    }).format(absAmount);
  } else {
    formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD',
      maximumFractionDigits: options?.compact ? 0 : 2,
      minimumFractionDigits: 0,
      notation: options?.compact ? 'compact' : 'standard',
    }).format(absAmount);
  }

  if (options?.showSign) {
    return isNegative ? `-${formatted}` : `+${formatted}`;
  }

  return isNegative ? `-${formatted}` : formatted;
};
