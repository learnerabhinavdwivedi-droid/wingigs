export function getDayKey(date: Date = new Date(), timeZone?: string): string {
  // Offset the date by 4 hours to handle late-night workouts (e.g., 2 AM is counted as the previous day)
  const logicalDate = new Date(date.getTime() - 4 * 60 * 60 * 1000);

  if (timeZone) {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    // en-CA format is YYYY-MM-DD
    return formatter.format(logicalDate);
  }

  // Fallback to local time
  const year = logicalDate.getFullYear();
  const month = String(logicalDate.getMonth() + 1).padStart(2, '0');
  const day = String(logicalDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}
