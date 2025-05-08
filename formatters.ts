/**
 * Format a number as currency
 */
export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  const currencyConfig = {
    USD: { locale: 'en-US', currency: 'USD' },
    ZAR: { locale: 'en-ZA', currency: 'ZAR' }
  };

  const config = currencyConfig[currency as keyof typeof currencyConfig] || currencyConfig.USD;

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: 2
  }).format(value);
};

/**
 * Format a date string
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

/**
 * Format a number with commas for thousands
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};