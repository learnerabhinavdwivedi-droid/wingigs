'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../data/remote/supabase';

export default function SpotsPage() {
  const [spots, setSpots] = useState<any[]>([]);

  useEffect(() => {
    const fetchSpots = async () => {
      const { data } = await supabase.from('spots').select('*').order('created_at', { ascending: false });
      if (data) setSpots(data);
    };
    fetchSpots();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 text-black p-8 max-w-lg mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Public Spots</h1>
        <button className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 text-sm">
          Add Spot
        </button>
      </div>

      <div className="space-y-4">
        {spots.length > 0 ? spots.map(spot => (
          <div key={spot.id} className="bg-white p-4 rounded shadow">
            <h2 className="font-bold text-lg">{spot.name}</h2>
            <p className="text-sm text-gray-500">{spot.public_area}, {spot.city}</p>
            {spot.tip && (
              <div className="mt-2 text-sm italic text-gray-600 border-l-4 border-blue-500 pl-2">
                " {spot.tip} "
              </div>
            )}
          </div>
        )) : (
          <div className="text-center text-gray-500 mt-12">No public spots added yet.</div>
        )}
      </div>
    </main>
  );
}
