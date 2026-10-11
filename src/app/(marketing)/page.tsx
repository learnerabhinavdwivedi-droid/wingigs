import Link from 'next/link';

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-between px-4 sm:px-6 lg:px-8 py-8 sm:py-12 selection:bg-lime-400 selection:text-slate-950">
      
      {/* Top Brand Bar */}
      <header className="w-full max-w-6xl flex items-center justify-between pb-8 border-b border-slate-900">
        <div className="flex items-center gap-2.5">
          <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-lime-400 to-emerald-400 flex items-center justify-center text-slate-950 text-xl font-black shadow-lg shadow-lime-500/20">
            🏸
          </span>
          <div className="flex flex-col">
            <span className="text-2xl font-black tracking-tight text-white flex items-center gap-1">
              Bahar<span className="text-lime-400">.</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline">
              Resilient Athletic Training
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/today"
            className="text-xs sm:text-sm font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl hover:border-slate-700 transition-colors"
          >
            Open App &rarr;
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-3xl text-center py-12 sm:py-20 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-lime-400/10 border border-lime-400/20 text-lime-400 text-xs font-black uppercase tracking-wider mb-6">
          <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
          The Failure-Tolerant Training Engine
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.08] mb-6 text-white">
          Expect failure. <br />
          <span className="bg-gradient-to-r from-lime-400 via-emerald-300 to-sky-300 bg-clip-text text-transparent">
            Build unstoppable momentum.
          </span>
        </h1>

        <p className="text-sm sm:text-lg lg:text-xl text-slate-300 max-w-xl mb-10 leading-relaxed font-normal">
          Offline-first athletic training designed for reality. When fatigue strikes, bad weather rolls in, or motivation dips, Bahar adjusts your envelope instead of breaking your streak.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
          <Link
            href="/onboarding"
            className="flex-1 bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-300 hover:to-lime-400 text-slate-950 font-black py-4 px-8 rounded-2xl text-center text-base sm:text-lg shadow-xl shadow-lime-500/25 active:scale-[0.99] transition-all"
          >
            Start Free Training &rarr;
          </Link>
          <Link
            href="/today"
            className="flex-1 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-200 font-bold py-4 px-8 rounded-2xl text-center text-base sm:text-lg transition-all"
          >
            Launch Today
          </Link>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-6 sm:p-7 backdrop-blur-sm shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-lime-400/10 border border-lime-400/20 text-lime-400 flex items-center justify-center text-2xl mb-4 font-bold">
            🛡️
          </div>
          <h3 className="text-lg font-black mb-2 text-white">Adaptive Daily Envelope</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Calculates daily intensity caps based on sleep, soreness, energy, weather, and current streak. Never overtrains, never breaks momentum.
          </p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-6 sm:p-7 backdrop-blur-sm shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-sky-400/10 border border-sky-400/20 text-sky-400 flex items-center justify-center text-2xl mb-4 font-bold">
            🔊
          </div>
          <h3 className="text-lg font-black mb-2 text-white">Audio Court Coach</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Pocket-ready browser voice cues and a background-persistent timer keep your drills on rhythm without glancing at your screen.
          </p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-3xl p-6 sm:p-7 backdrop-blur-sm shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 flex items-center justify-center text-2xl mb-4 font-bold">
            📱
          </div>
          <h3 className="text-lg font-black mb-2 text-white">Screen vs. Court Telemetry</h3>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Measures your passive phone screen idling against active court minutes. Beat the screen every single day with tangible ratios.
          </p>
        </div>
      </div>

      {/* Footer info */}
      <footer className="w-full max-w-6xl border-t border-slate-900 pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div>100% Local-First with IndexedDB (Dexie). No accounts required.</div>
        <div className="flex gap-4">
          <Link href="/today" className="hover:text-slate-300">Today</Link>
          <Link href="/progress" className="hover:text-slate-300">Analytics</Link>
          <Link href="/spots" className="hover:text-slate-300">Court Spots</Link>
          <Link href="/buddy" className="hover:text-slate-300">Accountability</Link>
        </div>
      </footer>
    </main>
  );
}
