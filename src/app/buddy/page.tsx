'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../data/remote/supabase';
import { useRouter } from 'next/navigation';

export default function BuddyPage() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [buddies, setBuddies] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/onboarding');
      setSession(session);
    });

    // Fetch buddies
    const fetchBuddies = async () => {
      const { data, error } = await supabase
        .from('buddy_pairs')
        .select('*, user_a, user_b');
      if (data) setBuddies(data);
    };
    fetchBuddies();
  }, [router]);

  return (
    <main className="min-h-screen bg-gray-50 text-black p-8 max-w-lg mx-auto">
      <h1 className="text-3xl font-bold mb-4">Your Buddy</h1>
      <p className="mb-8">Pair up with someone to stay accountable.</p>

      {buddies.length > 0 ? (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-bold text-lg mb-2">Active Buddy</h2>
          {buddies.map(b => (
            <div key={b.id} className="border-t py-2">
              Slot: {b.slot_days} at {b.slot_time}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-4 rounded shadow">
          <p className="text-gray-500 mb-4">You don't have a buddy yet.</p>
          <button className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">
            Copy Invite Link
          </button>
        </div>
      )}
    </main>
  );
}
