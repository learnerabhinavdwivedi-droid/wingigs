import Dexie, { Table } from 'dexie';

export interface UserProfile {
  sport: string;
  city: string;
  baselineResult?: string;
  id: number;
  displayName?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  maxMinutesPerSession: number;
  maxSessionsPerWeek: number;
}

export interface DayCheckin {
  dayKey: string;
  completed: boolean;
  mood?: string;
  eveningIfThen?: string;
  minutes: number;
  screenSeconds?: number;
}

export interface StoredPlan {
  dayKey: string;
  plan: any; // Stored JSON of ZodDailyPlan
}

export class BaharDB extends Dexie {
  profile!: Table<UserProfile, number>;
  checkins!: Table<DayCheckin, string>; // dayKey is primary key
  plans!: Table<StoredPlan, string>;

  constructor() {
    super('BaharDB');
    this.version(1).stores({
      profile: '++id', // Single row usually
      checkins: 'dayKey',
      plans: 'dayKey'
    });
  }
}

export const db = new BaharDB();


