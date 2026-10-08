export interface Checkin {
  dayKey: string;
  completed: boolean;
}

export function calculateMomentum(checkins: Checkin[], todayKey: string): number {
  // Sort checkins by dayKey ascending
  const sorted = [...checkins].sort((a, b) => a.dayKey.localeCompare(b.dayKey));
  
  let streak = 0;
  // A simple implementation: walk backwards from today or yesterday
  // In a real implementation, we'd use day distance helpers from time/
  
  const todayDate = new Date(todayKey); // assuming YYYY-MM-DD
  
  // Create a set of completed day keys for O(1) lookup
  const completedDays = new Set(sorted.filter(c => c.completed).map(c => c.dayKey));
  
  let currentKey = todayKey;
  
  // If today is not completed, start checking from yesterday
  if (!completedDays.has(todayKey)) {
    const yesterday = new Date(todayDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = yesterday.toISOString().split('T')[0];
    currentKey = yKey;
  }
  
  const current = new Date(currentKey);
  
  while (true) {
    const keyToCheck = current.toISOString().split('T')[0];
    if (completedDays.has(keyToCheck)) {
      streak++;
      current.setDate(current.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}
