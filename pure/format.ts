export const sig3 = new Intl.NumberFormat('en-US', { maximumSignificantDigits: 3 }).format.bind(this);

export function getDateFormatForRange(dateRange: number | null): string {
  if (dateRange === 1) return 'h:mm A'; // 6:00 AM
  if (dateRange === 7) return 'ddd'; // Mon
  if (dateRange === 30) return 'MMM D'; // Nov 1
  return 'MMM YYYY'; // Nov 2025
}