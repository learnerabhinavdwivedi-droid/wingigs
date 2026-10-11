'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getDayKey } from '../domain/time/day_key';
import { db } from '../data/local/db';

export function ScreenTracker() {
  const lastActiveRef = useRef<number>(Date.now());
  const pathname = usePathname();

  useEffect(() => {
    const handleVisibility = () => {
      // Never count time spent training in Outside mode as passive screen time
      if (pathname === '/outside') {
        lastActiveRef.current = Date.now();
        return;
      }

      if (document.visibilityState === 'hidden') {
        const now = Date.now();
        const diff = Math.floor((now - lastActiveRef.current) / 1000);
        
        if (diff > 0 && diff < 86400) {
          const dayKey = getDayKey();
          // Update screen seconds in IndexedDB directly
          db.checkins.get(dayKey).then(checkin => {
            if (checkin) {
              db.checkins.update(dayKey, { 
                screenSeconds: (checkin.screenSeconds || 0) + diff 
              });
            } else {
              db.checkins.put({
                dayKey,
                completed: false,
                minutes: 0,
                screenSeconds: diff
              });
            }
          });
        }
      } else {
        lastActiveRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    
    // Also track on beforeunload
    const handleUnload = () => handleVisibility();
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [pathname]);

  return null;
}
