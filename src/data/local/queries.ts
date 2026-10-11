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

export async function checkDevicePersistence(): Promise<boolean> {
  if (typeof window !== 'undefined' && navigator?.storage?.persisted) {
    try {
      return await navigator.storage.persisted();
    } catch {
      return false;
    }
  }
  return false;
}

export async function requestDevicePersistence(): Promise<boolean> {
  if (typeof window !== 'undefined' && navigator?.storage?.persist) {
    try {
      return await navigator.storage.persist();
    } catch {
      return false;
    }
  }
  return false;
}

export async function getDeviceStorageEstimate(): Promise<{ usageKB: number; quotaMB: number } | null> {
  if (typeof window !== 'undefined' && navigator?.storage?.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      return {
        usageKB: Math.round((estimate.usage || 0) / 1024),
        quotaMB: Math.round((estimate.quota || 0) / (1024 * 1024)),
      };
    } catch {
      return null;
    }
  }
  return null;
}

export async function saveBackupToDevice(): Promise<{ success: boolean; filename: string }> {
  const json = await exportDatabaseToJson();
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `bahar-backup-${dateStr}.json`;
  const blob = new Blob([json], { type: 'application/json' });

  // 1. Web Share API (native sheet on iOS / Android)
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      const file = new File([blob], filename, { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Bahar Device Backup',
          text: 'Bahar workout logs and profile backup file.'
        });
        return { success: true, filename };
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return { success: false, filename };
      }
    }
  }

  // 2. File System Access API (Chrome/Edge desktop)
  if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
    try {
      const pickerWindow = window as unknown as {
        showSaveFilePicker: (opts: {
          suggestedName: string;
          types: Array<{ description: string; accept: Record<string, string[]> }>;
        }) => Promise<{
          createWritable: () => Promise<{ write: (d: string) => Promise<void>; close: () => Promise<void> }>;
        }>;
      };
      const handle = await pickerWindow.showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: 'JSON Backup File',
          accept: { 'application/json': ['.json'] },
        }],
      });
      const writable = await handle.createWritable();
      await writable.write(json);
      await writable.close();
      return { success: true, filename };
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return { success: false, filename };
      }
    }
  }

  // 3. Universal Blob Download fallback
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return { success: true, filename };
}


