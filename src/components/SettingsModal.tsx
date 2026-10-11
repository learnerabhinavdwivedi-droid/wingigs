'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  getProfile, 
  saveProfile, 
  importDatabaseFromJson, 
  resetDatabase,
  saveBackupToDevice,
  checkDevicePersistence,
  requestDevicePersistence,
  getDeviceStorageEstimate
} from '../data/local/queries';
import { UserProfile } from '../data/local/db';
import { playAudioCue, unlockAudio } from '../features/outside-mode/audio';
import { useRouter } from 'next/navigation';
import { HabitReminderSection } from './HabitReminderSection';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { theme, setTheme } = useTheme();
  const { user, signOut: authSignOut, isSupabaseConnected } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  
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
    if (isOpen) {
      getProfile().then(p => {
        if (p) {
          setProfile(p);
          setSport(p.sport || 'badminton');
          setLevel(p.level || 'beginner');
          setMinutes(p.maxMinutesPerSession || 30);
          setCity(p.city || 'Seattle');
        }
        setSavedSuccess(false);
        setImportStatus(null);
        setSaveSuccessMsg(null);
        setConfirmReset(false);
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
    }
  }, [isOpen]);

  if (!isOpen) return null;

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
        setImportStatus('Backup restored successfully! Refreshing...');
        setTimeout(() => {
          onClose();
          window.location.reload();
        }, 1200);
      } else {
        setImportStatus('Failed to import: Invalid backup file format.');
      }
    } catch {
      setImportStatus('Error reading file.');
    }
  };

  const handleTestAudio = () => {
    unlockAudio();
    setAudioTesting(true);
    playAudioCue('Bahar Voice Coach ready. Keep your footwork light and your chest up.');
    setTimeout(() => setAudioTesting(false), 3000);
  };

  const handleResetData = async () => {
    await resetDatabase();
    onClose();
    router.push('/onboarding');
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative my-8 max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-lime-500/15 dark:bg-lime-400/10 border border-lime-500/30 dark:border-lime-400/20 text-lime-600 dark:text-lime-400 flex items-center justify-center text-sm font-bold">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Settings & Data Vault</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">100% Local-first Dexie storage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-base font-bold transition-colors"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-4 space-y-6 flex-1 pr-1">
          {/* Appearance & Color Theme */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-300">
                Appearance & Theme
              </span>
              <span className="text-[11px] font-bold text-lime-600 dark:text-lime-400 capitalize bg-lime-500/10 px-2 py-0.5 rounded-full border border-lime-500/20">
                {theme} Mode
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
              Switch between high-contrast Athletic Obsidian dark mode and Athletic Platinum light mode.
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-lime-400 text-white shadow-md ring-1 ring-lime-400'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-white'
                }`}
              >
                <span>🌙</span>
                <span>Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  theme === 'light'
                    ? 'bg-lime-400 border-lime-500 text-slate-950 font-black shadow-md ring-1 ring-lime-500'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>☀️</span>
                <span>Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  theme === 'system'
                    ? 'bg-sky-500 text-white border-sky-600 font-black shadow-md ring-1 ring-sky-400'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <span>💻</span>
                <span>System</span>
              </button>
            </div>
          </div>

          {/* Athlete Account & Cloud Authentication */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-300">
                Athlete Account & Sync
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <span className={`w-1.5 h-1.5 rounded-full ${isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-lime-500'}`} />
                {user ? (user.isAnonymous ? 'Guest Athlete' : 'Cloud Member') : 'Local Mode'}
              </span>
            </div>

            {user ? (
              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-lime-400 to-emerald-400 text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : '🏸'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                      {user.displayName || 'Athlete'}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {user.email}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => setShowAuthModal(true)}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    Manage
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await authSignOut();
                    }}
                    className="px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-100 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 pt-1">
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Sign in or create an account to synchronize streaks and buddy pairings across devices.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAuthModal(true)}
                  className="w-full py-2.5 px-4 rounded-xl bg-lime-400 hover:bg-lime-300 text-slate-950 font-black text-xs transition-all shadow-md shadow-lime-400/20 active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>Sign In / Create Athlete Account</span>
                </button>
              </div>
            )}
          </div>

          {/* Profile Quick Edit */}
          <form onSubmit={handleSaveProfile} className="space-y-4 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-lime-600 dark:text-lime-400">
                Training Baseline
              </span>
              {savedSuccess && (
                <span className="text-[11px] font-bold text-lime-600 dark:text-lime-400 animate-pulse">
                  ✓ Profile Saved!
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Sport</label>
                <select
                  value={sport}
                  onChange={e => setSport(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:border-lime-400 outline-none"
                >
                  <option value="badminton">🏸 Badminton</option>
                  <option value="running">🏃 Running</option>
                  <option value="calisthenics">💪 Bodyweight</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Level</label>
                <select
                  value={level}
                  onChange={e => setLevel(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:white font-medium focus:border-lime-400 outline-none"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">Session Duration</label>
                <select
                  value={minutes}
                  onChange={e => setMinutes(Number(e.target.value))}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:border-lime-400 outline-none"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-bold mb-1">City (Weather/AQI)</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:border-lime-400 outline-none"
                  placeholder="e.g. Seattle"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-lime-400 font-bold py-2.5 rounded-xl text-xs transition-colors border border-slate-700/60 shadow-sm"
            >
              Update Baseline Settings
            </button>
          </form>

          {/* Daily Habit Anchor & Calendar Trigger */}
          <HabitReminderSection />

          {/* Audio Coach Voice Test */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-300">
                Court Audio Coach
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Browser Speech API</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
              Pocket cues call drill changes hands-free without looking at your screen. Test your speech synthesis below.
            </p>
            <button
              type="button"
              onClick={handleTestAudio}
              disabled={audioTesting}
              className="w-full bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
            >
              {audioTesting ? (
                <>
                  <svg className="w-4 h-4 text-lime-500 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="16"/></svg>
                  <span>Playing Voice Cue...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="22"/>
                  </svg>
                  <span>Test Speech Voice Cue</span>
                </>
              )}
            </button>
          </div>

          {/* Data Saved On Device & Backup */}
          <div className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 space-y-3">
            <div>
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-300">
                  Data Backup & Portability
                </span>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {isPersisted ? 'Saved Permanently on Device' : 'Saved in Local Storage'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Your workout logs, streaks, and custom baselines are saved locally on this device{storageEstimate ? ` (~${storageEstimate.usageKB} KB stored offline)` : ''}.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleExportData}
                disabled={exporting}
                className="bg-lime-400/15 hover:bg-lime-400/25 dark:bg-lime-500/15 dark:hover:bg-lime-500/25 border border-lime-500/30 dark:border-lime-400/30 text-lime-700 dark:text-lime-400 font-bold py-2.5 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
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
                className="bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold py-2.5 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
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
              <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 p-2.5 rounded-xl flex items-center gap-2 animate-in fade-in">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {importStatus && (
              <div className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 p-2.5 rounded-xl">
                {importStatus}
              </div>
            )}
          </div>

          {/* Danger Zone: Reset Database */}
          <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 rounded-2xl p-4">
            <div className="flex items-center gap-1.5 mb-1">
              <svg className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Danger Zone
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
              Erase all local profile settings, check-in history, and generated training plans.
            </p>

            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="w-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold py-2 rounded-xl text-xs transition-colors"
              >
                Delete All Data & Start Fresh
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold py-2 rounded-xl text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResetData}
                  className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-black py-2 rounded-xl text-xs transition-colors shadow-lg shadow-rose-600/30"
                >
                  Yes, Erase Everything
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 shrink-0 flex items-center justify-between text-[11px] text-slate-500">
          <span>Bahar v0.1.0 (PWA)</span>
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
          >
            Done
          </button>
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
}
