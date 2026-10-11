import { db, UserProfile, DayCheckin, StoredPlan } from './db';
import { DailyPlan } from '../../domain/validator/planValidator';

export async function getProfile(): Promise<UserProfile | undefined> {
  const profiles = await db.profile.toArray();
  return profiles[0];
}

export async function saveProfile(profile: Omit<UserProfile, 'id'>): Promise<void> {
  const existing = await getProfile();
  if (existing && existing.id) {
    await db.profile.put({ ...profile, id: existing.id } as UserProfile);
  } else {
    await db.profile.put({ ...profile, id: 1 } as UserProfile);
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
  const allCheckins = await db.checkins.toArray();
  const completedKeys = allCheckins.filter(c => c.completed).map(c => c.dayKey);
  
  if (completedKeys.length === 0) return [];
  
  const plans = await db.plans.where('dayKey').anyOf(completedKeys).toArray();
  return plans.map(p => p.plan);
}

export async function exportDatabaseToJson(): Promise<string> {
  const profiles = await db.profile.toArray();
  const checkins = await db.checkins.toArray();
  const plans = await db.plans.toArray();

  const exportPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: profiles[0] || null,
    checkins,
    plans
  };

  return JSON.stringify(exportPayload, null, 2);
}

export async function importDatabaseFromJson(jsonStr: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonStr);
    if (!data || typeof data !== 'object') return false;

    await db.transaction('rw', [db.profile, db.checkins, db.plans], async () => {
      if (data.profile) {
        await db.profile.clear();
        await db.profile.add(data.profile);
      }
      if (Array.isArray(data.checkins)) {
        await db.checkins.clear();
        await db.checkins.bulkPut(data.checkins);
      }
      if (Array.isArray(data.plans)) {
        await db.plans.clear();
        await db.plans.bulkPut(data.plans);
      }
    });
    return true;
  } catch (err) {
    console.error('Failed to import data:', err);
    return false;
  }
}

export async function resetDatabase(): Promise<void> {
  await db.transaction('rw', [db.profile, db.checkins, db.plans], async () => {
    await db.profile.clear();
    await db.checkins.clear();
    await db.plans.clear();
  });
}

