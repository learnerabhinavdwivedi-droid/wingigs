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

export interface ResilientMomentumResult {
  streak: number;
  shieldCharged: boolean;
  shieldProtected: boolean;
  activeDaysLast7: number;
  weeklyTarget: number;
}

export function calculateResilientMomentum(
  checkins: Checkin[], 
  todayKey: string, 
  weeklyTarget = 3
): ResilientMomentumResult {
  const strictStreak = calculateMomentum(checkins, todayKey);
  const completedDays = new Set(checkins.filter(c => c.completed).map(c => c.dayKey));

  // Count active days in the last 7 calendar days
  let activeDaysLast7 = 0;
  const cursor = new Date(todayKey);
  for (let i = 0; i < 7; i++) {
    const k = cursor.toISOString().split('T')[0];
    if (completedDays.has(k)) {
      activeDaysLast7++;
    }
    cursor.setDate(cursor.getDate() - 1);
  }

  // If strict streak is 0, check if yesterday was an absorbed recovery day
  let shieldProtected = false;
  let effectiveStreak = strictStreak;

  if (strictStreak === 0 && checkins.length > 0) {
    const today = new Date(todayKey);
    const dayBeforeYesterday = new Date(today);
    dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);
    const dbyKey = dayBeforeYesterday.toISOString().split('T')[0];
    
    if (completedDays.has(dbyKey)) {
      shieldProtected = true;
      effectiveStreak = calculateMomentum(checkins, dbyKey);
    }
  }

  return {
    streak: Math.max(strictStreak, effectiveStreak),
    shieldCharged: !shieldProtected,
    shieldProtected,
    activeDaysLast7,
    weeklyTarget
  };
}
