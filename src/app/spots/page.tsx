'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../data/remote/supabase';
import Link from 'next/link';

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
    public_area: 'North Park Concourse',
    city: 'Seattle',
    sport_tags: ['badminton', 'outdoor'],
    tip: 'Wind drops noticeably around 6 PM. Flat smooth asphalt surface with lined court markers.'
  },
  {
    id: 's2',
    name: 'Lincoln Park Training Wall',
    public_area: 'Lower Concourse Athletic Wall',
    city: 'Seattle',
    sport_tags: ['badminton', 'wall-rallies'],
    tip: 'Solid concrete wall sheltered from coastal breezes, perfect for defensive wall rally practice.'
  },
  {
    id: 's3',
    name: 'Golden Gate Athletic Grounds',
    public_area: 'Polo Field Concourse',
    city: 'San Francisco',
    sport_tags: ['badminton', 'agility', 'outdoor'],
    tip: 'Sheltered from coastal gusts behind the eucalyptus grove. Great early morning grip.'
  },
  {
    id: 's4',
    name: 'Regent’s Park Outer Circle Courts',
    public_area: 'Hub Sports Pavilion',
    city: 'London',
    sport_tags: ['badminton', 'outdoor'],
    tip: 'Well-maintained hard courts with natural wind break hedges. Free public access.'
  },
  {
    id: 's5',
    name: 'East River Park Running Track & Wall',
    public_area: 'Track & Field Plaza',
    city: 'New York',
    sport_tags: ['badminton', 'wall-rallies'],
    tip: 'Ample open pavement and concrete handball walls. Excellent evening lighting.'
  }
];

export default function SpotsPage() {
  const [spots, setSpots] = useState<Spot[]>(DEFAULT_SPOTS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filterSport, setFilterSport] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
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
          setSpots([...data, ...DEFAULT_SPOTS.filter(d => !data.some(remote => remote.name === d.name))]);
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

  const handleShareSpot = (spot: Spot) => {
    const text = `${spot.name} - ${spot.public_area}, ${spot.city}. "${spot.tip || 'Great spot for training.'}"`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(spot.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const filteredSpots = spots.filter(s => {
    const matchesFilter = filterSport === 'all' || s.sport_tags?.includes(filterSport);
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      s.name.toLowerCase().includes(q) || 
      s.city.toLowerCase().includes(q) || 
      s.public_area.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  return (
    <main className="min-h-screen p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto text-slate-100 flex flex-col gap-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-lime-400 bg-lime-400/10 px-2.5 py-0.5 rounded-full border border-lime-400/20">
            Court Directory
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-1">
            Training Spots & Walls
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-lg">
            Community-verified outdoor courts, sheltered walls, and training locations.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/today"
            className="text-xs font-extrabold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl transition-colors hidden sm:inline-block"
          >
            &larr; Today
          </Link>

          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-300 hover:to-lime-400 text-slate-950 font-black py-2.5 px-4 rounded-xl shadow-lg shadow-lime-500/20 text-xs active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <span>+</span>
            <span>Add Training Spot</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Controls Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 text-sm">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by court name, city, landmark..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 focus:border-lime-400 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 text-xs font-bold overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Spots' },
            { id: 'badminton', label: '🏸 Badminton' },
            { id: 'wall-rallies', label: '🧱 Wall Rally' },
            { id: 'outdoor', label: '🌤️ Outdoor' }
          ].map(chip => (
            <button
              key={chip.id}
              onClick={() => setFilterSport(chip.id)}
              className={`px-3 py-2 rounded-xl border whitespace-nowrap transition-all ${
                filterSport === chip.id
                  ? 'bg-lime-400 border-lime-400 text-slate-950 font-black shadow-md shadow-lime-400/20'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Responsive Grid of Spot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredSpots.map(spot => (
          <div 
            key={spot.id} 
            className="bg-slate-900/70 border border-slate-800/80 p-5 rounded-3xl shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all backdrop-blur-sm group"
          >
            <div>
              <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className="font-black text-base sm:text-lg text-white tracking-tight group-hover:text-lime-300 transition-colors">
                  {spot.name}
                </h3>
                <span className="text-[10px] font-black uppercase text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-800/60 shrink-0">
                  {spot.city}
                </span>
              </div>

              <p className="text-xs font-semibold text-slate-400 mb-3 flex items-center gap-1.5">
                <span>📍</span>
                <span>{spot.public_area}</span>
              </p>

              {spot.tip && (
                <div className="text-xs leading-relaxed italic text-slate-300 bg-slate-950/60 border-l-2 border-lime-400 p-3 rounded-r-xl mb-4">
                  "{spot.tip}"
                </div>
              )}
            </div>

            {/* Bottom Actions & Tags */}
            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
              <div className="flex flex-wrap gap-1">
                {spot.sport_tags?.map(tag => (
                  <span key={tag} className="text-[10px] text-slate-400 font-bold bg-slate-800 px-2 py-0.5 rounded-md">
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleShareSpot(spot)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Copy spot details"
                >
                  {copiedId === spot.id ? '✓' : '🔗'}
                </button>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${spot.name} ${spot.city}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-800 hover:bg-slate-700 text-lime-400 font-bold px-2.5 py-1 rounded-lg text-xs transition-colors flex items-center gap-1"
                >
                  <span>Map</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          </div>
        ))}

        {filteredSpots.length === 0 && (
          <div className="col-span-full text-center py-16 text-slate-400 bg-slate-900/40 border border-slate-800 rounded-3xl p-8">
            <div className="text-4xl mb-3">📍</div>
            <div className="text-base font-bold text-white">No spots found matching your search.</div>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Try adjusting your filter or tap "+ Add Training Spot" to add the first one in this area.
            </p>
          </div>
        )}
      </div>

      {/* Add Spot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl text-slate-100">
            <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-lime-400">
                  Directory Contribution
                </span>
                <h3 className="font-black text-xl text-white">Add Training Spot</h3>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSpot} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Court / Wall Name</label>
                <input 
                  type="text" 
                  value={newSpot.name}
                  onChange={e => setNewSpot({ ...newSpot, name: e.target.value })}
                  placeholder="e.g. Miller Playfield Wall"
                  required
                  className="w-full bg-slate-950 border border-slate-800 focus:border-lime-400 rounded-xl p-3 text-white font-medium outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Public Area / Landmark</label>
                <input 
                  type="text" 
                  value={newSpot.public_area}
                  onChange={e => setNewSpot({ ...newSpot, public_area: e.target.value })}
                  placeholder="e.g. Lower concourse next to tennis court 3"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-lime-400 rounded-xl p-3 text-white font-medium outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">City</label>
                <input 
                  type="text" 
                  value={newSpot.city}
                  onChange={e => setNewSpot({ ...newSpot, city: e.target.value })}
                  placeholder="e.g. Seattle"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-lime-400 rounded-xl p-3 text-white font-medium outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Court Tip / Wind Conditions</label>
                <textarea 
                  value={newSpot.tip}
                  onChange={e => setNewSpot({ ...newSpot, tip: e.target.value })}
                  placeholder="e.g. Best in early morning before wind picks up. Good floodlights until 9 PM."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-lime-400 rounded-xl p-3 text-white font-medium outline-none"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-lime-400 hover:bg-lime-300 text-slate-950 font-black py-3 rounded-xl shadow-lg shadow-lime-500/20 transition-colors"
                >
                  Save Spot &rarr;
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}
