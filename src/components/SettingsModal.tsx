'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getProfile, saveProfile, exportDatabaseToJson, importDatabaseFromJson, resetDatabase } from '../data/local/queries';
import { UserProfile } from '../data/local/db';
import { playAudioCue, unlockAudio } from '../features/outside-mode/audio';
import { useRouter } from 'next/navigation';
import { HabitReminderSection } from './HabitReminderSection';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
      });
      setSavedSuccess(false);
      setImportStatus(null);
      setConfirmReset(false);
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
    try {
      const json = await exportDatabaseToJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `bahar-backup-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
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
    } catch (err) {
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
        className="bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl relative my-8 max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-lime-400/10 border border-lime-400/20 text-lime-400 flex items-center justify-center text-sm font-bold">
              ⚙️
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white">Settings & Data Vault</h2>
              <p className="text-[11px] text-slate-400">100% Local-first Dexie storage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-base font-bold transition-colors"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto py-4 space-y-6 flex-1 pr-1">
          {/* Profile Quick Edit */}
          <form onSubmit={handleSaveProfile} className="space-y-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-lime-400">
                Training Baseline
              </span>
              {savedSuccess && (
                <span className="text-[11px] font-bold text-lime-400 animate-pulse">
                  ✓ Profile Saved!
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Sport</label>
                <select
                  value={sport}
                  onChange={e => setSport(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:border-lime-400 outline-none"
                >
                  <option value="badminton">🏸 Badminton</option>
                  <option value="running">🏃 Running</option>
                  <option value="calisthenics">💪 Bodyweight</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Level</label>
                <select
                  value={level}
                  onChange={e => setLevel(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:border-lime-400 outline-none"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Session Duration</label>
                <select
                  value={minutes}
                  onChange={e => setMinutes(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:border-lime-400 outline-none"
                >
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes</option>
                  <option value={45}>45 Minutes</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">City (Weather/AQI)</label>
                <input
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:border-lime-400 outline-none"
                  placeholder="e.g. Seattle"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-700 text-lime-400 font-bold py-2 rounded-xl text-xs transition-colors border border-slate-700/60"
            >
              Update Baseline Settings
            </button>
          </form>

          {/* Daily Habit Anchor & Calendar Trigger */}
          <HabitReminderSection />

          {/* Audio Coach Voice Test */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300">
                Court Audio Coach
              </span>
              <span className="text-[11px] text-slate-400">Browser Speech API</span>
            </div>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Pocket cues call drill changes hands-free without looking at your screen. Test your speech synthesis below.
            </p>
            <button
              type="button"
              onClick={handleTestAudio}
              disabled={audioTesting}
              className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>{audioTesting ? '🔊 Playing Voice Cue...' : '🎙️ Test Speech Voice Cue'}</span>
            </button>
          </div>

          {/* Data Export & Import */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-3">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-slate-300 block mb-1">
                Data Backup & Portability
              </span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your workout logs, streaks, and custom baseline never leave your browser unless you export them.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleExportData}
                disabled={exporting}
                className="bg-lime-500/10 hover:bg-lime-500/20 border border-lime-400/30 text-lime-400 font-bold py-2.5 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>📥</span>
                <span>{exporting ? 'Exporting...' : 'Export JSON'}</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold py-2.5 px-3 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <span>📤</span>
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

            {importStatus && (
              <div className="text-[11px] font-semibold text-sky-400 bg-sky-950/40 border border-sky-800/60 p-2.5 rounded-xl">
                {importStatus}
              </div>
            )}
          </div>

          {/* Danger Zone: Reset Database */}
          <div className="bg-rose-950/20 border border-rose-900/40 rounded-2xl p-4">
            <span className="text-xs font-black uppercase tracking-wider text-rose-400 block mb-1">
              Danger Zone
            </span>
            <p className="text-xs text-slate-400 mb-3">
              Erase all local profile settings, check-in history, and generated training plans.
            </p>

            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="w-full bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-bold py-2 rounded-xl text-xs transition-colors"
              >
                Delete All Data & Start Fresh
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="flex-1 bg-slate-800 text-slate-300 font-bold py-2 rounded-xl text-xs"
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
        <div className="pt-3 border-t border-slate-800 shrink-0 flex items-center justify-between text-[11px] text-slate-500">
          <span>Bahar v0.1.0 (PWA)</span>
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-300 hover:text-white"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
