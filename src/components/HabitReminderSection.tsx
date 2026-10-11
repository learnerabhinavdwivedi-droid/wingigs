'use client';

import React, { useState } from 'react';

export function HabitReminderSection() {
  const [reminderTime, setReminderTime] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('bahar_habit_time');
        if (stored) return stored;
      } catch {
        // Fall back
      }
    }
    return '07:30';
  });

  const [notificationStatus, setNotificationStatus] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  const [savedNote, setSavedNote] = useState(false);

  const handleRequestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Notifications are not supported on this browser.');
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationStatus(permission);
    if (permission === 'granted') {
      new Notification('🏸 Bahar Habit Activated', {
        body: `Daily training reminder locked for ${reminderTime}. Building unstoppable momentum.`,
        icon: '/icon-192x192.png'
      });
    }
  };

  const handleSaveTime = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setReminderTime(val);
    try {
      localStorage.setItem('bahar_habit_time', val);
      setSavedNote(true);
      setTimeout(() => setSavedNote(false), 2000);
    } catch {
      // Ignore storage errors
    }
  };

  const handleDownloadICS = () => {
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Bahar//Resilient Training PWA//EN',
      'BEGIN:VEVENT',
      'SUMMARY:🏸 Bahar Court Training Session',
      'DESCRIPTION:Failure-tolerant athletic drills session. Launch app: https://bahar.app/today',
      'RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR',
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bahar-habit-routine.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    '🏸 Bahar Court Training Session'
  )}&details=${encodeURIComponent(
    'Failure-tolerant athletic drills session. Launch app: https://bahar.app/today'
  )}&recur=${encodeURIComponent('RRULE:FREQ=WEEKLY;BYDAY=MO,WE,FR')}`;

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-lime-600 dark:text-lime-400 block mb-0.5">
            Habit Anchor
          </span>
          <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
            Daily Training Trigger &amp; Calendar Sync
          </h4>
        </div>
        <span className="text-xl">⏰</span>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
        Consistent athletes rely on environmental triggers. Anchor your 25-minute court session into your daily routine.
      </p>

      {/* Time Picker */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Preferred Training Hour:</label>
        <div className="flex items-center gap-2">
          <input
            type="time"
            value={reminderTime}
            onChange={handleSaveTime}
            className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-lime-600 dark:text-lime-400 font-bold px-2.5 py-1 rounded-lg text-xs outline-none"
          />
          {savedNote && <span className="text-[10px] text-lime-600 dark:text-lime-400 font-bold">Saved!</span>}
        </div>
      </div>

      {/* Notification and Calendar CTAs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={handleRequestPermission}
          className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            notificationStatus === 'granted'
              ? 'bg-lime-500/15 dark:bg-lime-400/10 border-lime-500/30 dark:border-lime-400/30 text-lime-700 dark:text-lime-400'
              : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-sm'
          }`}
        >
          <span>🔔</span>
          <span>{notificationStatus === 'granted' ? 'Notification Alert Active' : 'Enable Daily Push Alert'}</span>
        </button>

        <a
          href={googleCalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-center shadow-sm"
        >
          <span>📅</span>
          <span>Add to Google Calendar</span>
        </a>
      </div>

      <button
        type="button"
        onClick={handleDownloadICS}
        className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-center font-semibold underline underline-offset-2"
      >
        Download Apple / Outlook .ICS Calendar Habit File
      </button>
    </div>
  );
}
