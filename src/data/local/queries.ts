import { db, UserProfile, DayCheckin, StoredPlan } from './db';
import { DailyPlan } from '../../domain/validator/planValidator';

export async function getProfile(): Promise<UserProfile | undefined> {
  const profiles = await db.profile.toArray();
  return profiles[0];
}

export async function saveProfile(profile: Omit<UserProfile, 'id'>): Promise<void> {
  const existing = await getProfile();
  if (existing) {
    await db.profile.update(existing.id, profile);
  } else {
    await db.profile.add({ ...profile, id: 1 } as UserProfile);
  }
}

export async function getCheckin(dayKey: string): Promise<DayCheckin | undefined> {
  return db.checkins.get(dayKey);
}

export async function saveCheckin(checkin: DayCheckin): Promise<void> {
  await db.checkins.put(checkin);
}

export async function getAllCheckins(): Promise<DayCheckin[]> {
  return db.checkins.toArray();
}

export async function getStoredPlan(dayKey: string): Promise<StoredPlan | undefined> {
  return db.plans.get(dayKey);
}

export async function savePlan(plan: StoredPlan): Promise<void> {
  await db.plans.put(plan);
}

export async function getCompletedHistoricalPlans(): Promise<DailyPlan[]> {
  const checkins = await db.checkins.where('completed').equals(1).toArray(); // Dexie boolean works or we just filter manually
  const allCheckins = await db.checkins.toArray();
  const completedKeys = allCheckins.filter(c => c.completed).map(c => c.dayKey);
  
  if (completedKeys.length === 0) return [];
  
  const plans = await db.plans.where('dayKey').anyOf(completedKeys).toArray();
  return plans.map(p => p.plan);
}
