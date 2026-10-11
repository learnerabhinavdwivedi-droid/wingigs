export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progressText?: string;
}

export function computeAchievements(checkins: { completed: boolean; minutes?: number }[], streak: number): Achievement[] {
  const completedCount = checkins.filter(c => c.completed).length;
  const totalMinutes = checkins.reduce((acc, c) => acc + (c.minutes || 0), 0);

  return [
    {
      id: 'first_sweat',
      title: 'First Sweat',
      description: 'Completed your inaugural court training session.',
      icon: '🌱',
      unlocked: completedCount >= 1,
      progressText: completedCount >= 1 ? 'Unlocked' : `${completedCount}/1 session`
    },
    {
      id: 'three_day_dynamo',
      title: '3-Day Dynamo',
      description: 'Built a 3-day streak of disciplined training.',
      icon: '🔥',
      unlocked: streak >= 3,
      progressText: streak >= 3 ? 'Unlocked' : `${streak}/3 days`
    },
    {
      id: 'century_club',
      title: 'Century Club',
      description: 'Accumulated over 100 active minutes on court.',
      icon: '⚡',
      unlocked: totalMinutes >= 100,
      progressText: totalMinutes >= 100 ? 'Unlocked' : `${totalMinutes}/100 mins`
    },
    {
      id: 'endurance_warrior',
      title: 'Endurance Warrior',
      description: 'Completed 5 total court training sessions.',
      icon: '🛡️',
      unlocked: completedCount >= 5,
      progressText: completedCount >= 5 ? 'Unlocked' : `${completedCount}/5 sessions`
    },
    {
      id: 'mastery_streak',
      title: 'Unstoppable Momentum',
      description: 'Reached a 7-day failure-tolerant training streak.',
      icon: '👑',
      unlocked: streak >= 7,
      progressText: streak >= 7 ? 'Unlocked' : `${streak}/7 days`
    }
  ];
}
