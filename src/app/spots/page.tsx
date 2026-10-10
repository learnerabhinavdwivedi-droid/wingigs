'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../data/remote/supabase';

interface Spot {
  id: string;
  name: string;
  public_area: string;
  city: string;
  sport_tags?: string[];
  tip?: string;
}

const DEFAULT_SPOTS: Spot[] = [
  {
    id: 's1',
    name: 'Green Lake Community Courts',
    public_area: 'North Park Area',
    city: 'Seattle',
    sport_tags: ['badminton', 'outdoor'],
    tip: 'Wind drops around 6 PM. Great flat asphalt surface with lined court markers.'
  },
  {
    id: 's2',
    name: 'Lincoln Park Training Wall',
    public_area: 'Lower Concourse',
    city: 'Seattle',
    sport_tags: ['badminton', 'wall-rallies'],
    tip: 'Solid concrete wall perfect for high-speed defensive wall rallies.'
  },
  {
    id: 's3',
    name: 'Golden Gate Park Athletic Grounds',
    public_area: 'Polo Field Concourse',
    city: 'San Francisco',
    sport_tags: ['badminton', 'agility'],
    tip: 'Sheltered from coastal gusts behind the eucalyptus grove.'
  }
];

export default function SpotsPage() {
  const [spots, setSpots] = useState<Spot[]>(DEFAULT_SPOTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterSport, setFilterSport] = useState<string>('all');
  
  // New spot form state
  const [newSpot, setNewSpot] = useState({
    name: '',
    public_area: '',
    city: 'Seattle',
    tip: '',
    sport_tags: ['badminton']
  });

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const { data } = await supabase
          .from('spots')
          .select('*')
          .order('created_at', { ascending: false });
        if (data && data.length > 0) {
          setSpots([...data, ...DEFAULT_SPOTS]);
        }
      } catch (err) {
        // Fallback to default spots
      }
    };
    fetchSpots();
  }, []);

  const handleCreateSpot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpot.name) return;

    const created: Spot = {
      id: 'local-' + Date.now(),
      name: newSpot.name,
      public_area: newSpot.public_area || 'Public Court',
      city: newSpot.city || 'Seattle',
      tip: newSpot.tip,
      sport_tags: newSpot.sport_tags
    };

    setSpots([created, ...spots]);
    setShowAddModal(false);
    setNewSpot({
      name: '',
      public_area: '',
      city: 'Seattle',
      tip: '',
      sport_tags: ['badminton']
    });

    try {
      await supabase.from('spots').insert([
        {
          name: created.name,
          public_area: created.public_area,
          city: created.city,
          sport_tags: created.sport_tags,
          tip: created.tip
        }
      ]);
    } catch (err) {
      // Local fallback preserved in state
    }
  };

  const filteredSpots = spots.filter(s => {
    if (filterSport === 'all') return true;
    return s.sport_tags?.includes(filterSport);
  });

  return (
    <main className="min-h-screen p-4 sm:p-6 max-w-lg mx-auto text-slate-900 flex flex-col gap-5">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/50">
            Public Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mt-1">
            Training Spots
          </h1>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3.5 rounded-xl shadow-md shadow-blue-500/20 text-xs active:scale-[0.98] transition-all flex items-center gap-1.5"
        >
          <span>+</span>
          <span>Add Spot</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 text-xs font-semibold">
        {[
          { id: 'all', label: 'All Spots' },
          { id: 'badminton', label: '🏸 Badminton' },
          { id: 'wall-rallies', label: '🧱 Wall Rally' }
        ].map(chip => (
          <button
            key={chip.id}
            onClick={() => setFilterSport(chip.id)}
            className={`px-3 py-1.5 rounded-xl border transition-all ${
              filterSport === chip.id
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Spot Cards */}
      <div className="space-y-3.5">
        {filteredSpots.map(spot => (
          <div 
            key={spot.id} 
            className="bg-white border border-slate-200/90 p-4 sm:p-5 rounded-2xl shadow-sm hover:shadow transition-shadow"
          >
            <div className="flex justify-between items-start mb-1.5">
              <h2 className="font-extrabold text-base text-slate-900 tracking-tight">
                {spot.name}
              </h2>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200/50">
                {spot.city}
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-500 mb-3 flex items-center gap-1">
              <span>📍</span>
              <span>{spot.public_area}</span>
            </p>

            {spot.tip && (
              <div className="text-xs leading-relaxed italic text-slate-600 bg-slate-50 border-l-3 border-blue-500 p-2.5 rounded-r-xl">
                "{spot.tip}"
              </div>
            )}
          </div>
        ))}

        {filteredSpots.length === 0 && (
          <div className="text-center py-12 text-slate-400 bg-white border border-slate-200/80 rounded-2xl p-6">
            <div className="text-3xl mb-2">📍</div>
            <div className="text-sm font-semibold">No spots found in this category.</div>
            <p className="text-xs text-slate-400 mt-1">Tap "+ Add Spot" to add the first one!</p>
          </div>
        )}
      </div>

      {/* Add Spot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-lg text-slate-900">Add Training Spot</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSpot} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Spot / Court Name</label>
                <input 
                  type="text" 
                  value={newSpot.name}
                  onChange={e => setNewSpot({ ...newSpot, name: e.target.value })}
                  placeholder="e.g. Miller Playfield Wall"
                  required
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Public Area / Landmark</label>
                <input 
                  type="text" 
                  value={newSpot.public_area}
                  onChange={e => setNewSpot({ ...newSpot, public_area: e.target.value })}
                  placeholder="e.g. Near East Tennis Courts"
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">City</label>
                <input 
                  type="text" 
                  value={newSpot.city}
                  onChange={e => setNewSpot({ ...newSpot, city: e.target.value })}
                  placeholder="e.g. Seattle"
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Court Tip / Conditions</label>
                <textarea 
                  value={newSpot.tip}
                  onChange={e => setNewSpot({ ...newSpot, tip: e.target.value })}
                  placeholder="e.g. Best in morning before wind picks up. Good lights until 9 PM."
                  rows={2}
                  className="w-full text-xs font-medium p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md shadow-blue-500/20 transition-colors"
                >
                  Save Spot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
