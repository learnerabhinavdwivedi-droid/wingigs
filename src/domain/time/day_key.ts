export function getDayKey(date: Date = new Date(), timeZone?: string): string {
  // If timeZone is provided, we format the date in that time zone
  // Otherwise we use local time (which might be the server's time zone or browser's).
  
  if (timeZone) {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    // en-CA format is YYYY-MM-DD
    return formatter.format(date);
  }

  // Fallback to local time
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}
