'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  getProfile, 
  saveProfile, 
  exportDatabaseToJson, 
  importDatabaseFromJson, 
  resetDatabase,
  saveBackupToDevice,
  checkDevicePersistence,
  requestDevicePersistence,
  getDeviceStorageEstimate
} from '../../data/local/queries';
import { UserProfile } from '../../data/local/db';
import { playAudioCue, unlockAudio } from '../../features/outside-mode/audio';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { HabitReminderSection } from '../../components/HabitReminderSection';
import { useTheme } from '../../context/ThemeContext';

export default function SettingsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sport, setSport] = useState('badminton');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [minutes, setMinutes] = useState(30);
  const [city, setCity] = useState('Seattle');
  const [savedSuccess, setSavedSuccess] = useState(false);
  
  const [exporting, setExporting] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [audioTesting, setAudioTesting] = useState(false);
  const [isPersisted, setIsPersisted] = useState(true);
  const [storageEstimate, setStorageEstimate] = useState<{ usageKB: number; quotaMB: number } | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    getProfile().then(p => {
      if (p) {
        setProfile(p);
        setSport(p.sport || 'badminton');
        setLevel(p.level || 'beginner');
        setMinutes(p.maxMinutesPerSession || 30);
        setCity(p.city || 'Seattle');
      }
    });
    checkDevicePersistence().then(persisted => {
      setIsPersisted(persisted);
      if (!persisted) {
        requestDevicePersistence().then(granted => {
          if (granted) setIsPersisted(true);
        });
      }
    });
    getDeviceStorageEstimate().then(est => setStorageEstimate(est));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveProfile({
      sport,
      level,
      maxMinutesPerSession: minutes,
      maxSessionsPerWeek: profile?.maxSessionsPerWeek || 3,
      city: city || 'Seattle',
      baselineResult: profile?.baselineResult
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportData = async () => {
    setExporting(true);
    setSaveSuccessMsg(null);
    try {
      const res = await saveBackupToDevice();
      if (res.success) {
        setSaveSuccessMsg(`Saved to device: ${res.filename}`);
        setTimeout(() => setSaveSuccessMsg(null), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const ok = await importDatabaseFromJson(text);
      if (ok) {
        setImportStatus('Backup restored successfully! Reloading...');
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setImportStatus('Failed to import: Invalid backup file format.');
      }
    } catch (err) {
      setImportStatus('Error reading backup file.');
    }
  };

  const handleTestAudio = () => {
    unlockAudio();
    setAudioTesting(true);
    playAudioCue('Bahar Voice Coach ready. Stay relaxed through your shoulders.');
    setTimeout(() => setAudioTesting(false), 3000);
  };

  const handleResetData = async () => {
    await resetDatabase();
    router.push('/onboarding');
    window.location.reload();
  };

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto text-slate-900 dark:text-slate-100 flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800/80">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-lime-600 dark:text-lime-400 bg-lime-500/10 dark:bg-lime-400/10 px-2.5 py-0.5 rounded-full border border-lime-500/20 dark:border-lime-400/20">
            System Preferences
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mt-1">
            Settings & Data Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Manage your baseline training parameters, local database backups, and privacy controls.
          </p>
        </div>

        <Link 
          href="/today" 
          className="self-start sm:self-auto text-xs font-extrabold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          &larr; Today's Plan
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        
        {/* Left Column: Baseline Configuration */}
        <form onSubmit={handleSaveProfile} className="bg-white/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-6 shadow-md dark:shadow-xl space-y-4 backdrop-blur-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-sm font-black uppercase tracking-wider text-lime-600 dark:text-lime-400">
              Training Baseline
            </h2>
            {savedSuccess && (
              <span className="text-xs font-bold text-lime-600 dark:text-lime-400 animate-pulse">
                ✓ Saved!
              </span>
            )}
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Sport Discipline</label>
              <select
                value={sport}
                onChange={e => setSport(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-medium focus:border-lime-500 outline-none"
              >
                <option value="badminton">🏸 Badminton</option>
                <option value="running">🏃 Running</option>
                <option value="calisthenics">💪 Bodyweight / Calisthenics</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Experience Level</label>
              <select
                value={level}
                onChange={e => setLevel(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-medium focus:border-lime-500 outline-none"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Session Target Duration</label>
              <select
                value={minutes}
                onChange={e => setMinutes(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-medium focus:border-lime-500 outline-none"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">City Location (Weather & AQI)</label>
              <input
                type="text"
                value={city}
                onChange={e => setCity(e.target.value)}
                placeholder="e.g. Seattle"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white font-medium focus:border-lime-500 outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-300 hover:to-lime-400 text-slate-950 font-black py-3 rounded-xl text-xs transition-all shadow-md shadow-lime-500/20 active:scale-95"
          >
            Save Baseline Changes
          </button>
        </form>

        {/* Right Column: Theme Selector, Habit Anchor, Audio Coach & Data Vault */}
        <div className="space-y-6">
          
          {/* Appearance & Color Theme */}
          <div className="bg-white/90 dark:bg-slate-900/70 border border-slate-200/90 dark:border-slate-800/80 rounded-3xl p-6 shadow-md dark:shadow-xl space-y-3 backdrop-blur-sm">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-800 dark:text-slate-300">
                Appearance & Theme
              </h3>
              <span className="text-[11px] font-bold text-lime-600 dark:text-lime-400 capitalize bg-lime-500/10 px-2.5 py-0.5 rounded-full border border-lime-500/20">
                {theme} Mode
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Switch between Athletic Obsidian dark mode and Athletic Platinum light mode.
            </p>
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-lime-400 text-white shadow-md ring-1 ring-lime-400'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                <span>🌙</span>
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  theme === 'light'
                    ? 'bg-lime-400 border-lime-500 text-slate-950 font-black shadow-md ring-1 ring-lime-500'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>☀️</span>
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  theme === 'system'
                    ? 'bg-sky-500 border-sky-600 text-white font-black shadow-md ring-1 ring-sky-400'
                    : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>💻</span>
                <span>System</span>
              </button>
            </div>
          </div>
          
          <HabitReminderSection />

          {/* Audio Coach Voice Test */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-3 backdrop-blur-sm">
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">
              Audio Court Coach
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Synthesized voice cues broadcast drill transitions on your phone while on court.
            </p>
            <button
              type="button"
              onClick={handleTestAudio}
              disabled={audioTesting}
              className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold py-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
            >
              {audioTesting ? (
                <>
                  <svg className="w-4 h-4 text-lime-500 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="16"/></svg>
                  <span>Speaking Cue...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="22"/>
                  </svg>
                  <span>Test Speech Synthesizer</span>
                </>
              )}
            </button>
          </div>

          {/* Backup & Portability */}
          <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-4 backdrop-blur-sm">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">
                  Data Backup & Portability
                </h3>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isPersisted ? 'Saved Permanently on Device' : 'Saved in Local Storage'}
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your workout logs, streaks, and training baselines are saved locally on this device{storageEstimate ? ` (~${storageEstimate.usageKB} KB stored offline)` : ''}.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExportData}
                disabled={exporting}
                className="bg-lime-400/15 hover:bg-lime-400/25 border border-lime-400/30 text-lime-400 font-bold py-3 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                aria-label="Export JSON to device"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>{exporting ? 'Saving...' : 'Export JSON'}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold py-3 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                <span>Import Backup</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {saveSuccessMsg && (
              <div className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 p-3 rounded-xl flex items-center gap-2 animate-in fade-in">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {importStatus && (
              <div className="text-xs font-semibold text-sky-400 bg-sky-950/60 border border-sky-800/60 p-3 rounded-xl">
                {importStatus}
              </div>
            )}
          </div>

          {/* Danger Zone: Wipe Database */}
          <div className="bg-rose-950/20 border border-rose-900/40 rounded-3xl p-6 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-4 h-4 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <h3 className="text-sm font-black uppercase tracking-wider text-rose-400">
                Clear Local Data
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Erase all locally cached IndexedDB tables (profile, check-in history, stored plans).
            </p>

            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="w-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                Reset Everything
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 bg-slate-800 text-slate-300 font-bold py-2.5 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetData}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-black py-2.5 rounded-xl text-xs transition-colors shadow-lg shadow-rose-600/30"
                >
                  Yes, Erase All
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </main>
  );
}
