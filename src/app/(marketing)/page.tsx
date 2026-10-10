import Link from 'next/link';

export default function MarketingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950 text-white flex flex-col items-center justify-between px-6 py-12 selection:bg-blue-500 selection:text-white">
      {/* Top Brand Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between pb-8">
        <div className="flex items-center gap-2">
          <span className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-xl shadow-lg shadow-blue-500/30">
            🏸
          </span>
          <span className="text-2xl font-black tracking-tight">
            Bahar<span className="text-blue-500">.</span>
          </span>
        </div>
        <Link
          href="/today"
          className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
        >
          Sign in / Open App &rarr;
        </Link>
      </div>

      {/* Hero Section */}
      <div className="max-w-2xl text-center py-12 flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          The Resilient Training Engine
        </div>

        <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-[1.1] mb-6">
          Expect failure. <br />
          <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
            Build unstoppable momentum.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-lg mb-10 leading-relaxed">
          Offline-first athletic training designed for reality. When fatigue strikes, bad weather rolls in, or motivation dips, Bahar adjusts your envelope instead of breaking your streak.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
          <Link
            href="/onboarding"
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-8 rounded-2xl text-center text-lg shadow-xl shadow-blue-600/30 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all"
          >
            Start Free Training &rarr;
          </Link>
          <Link
            href="/today"
            className="flex-1 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold py-4 px-8 rounded-2xl text-center text-lg transition-all"
          >
            Open Today
          </Link>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="w-full max-w-4xl grid sm:grid-cols-3 gap-6 py-12">
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center text-xl mb-4 font-bold">
            🛡️
          </div>
          <h3 className="text-lg font-bold mb-2 text-white">Daily Envelope</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Adapts daily intensity based on soreness, energy, weather, and streak. Never overtrains, never drops consistency.
          </p>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl mb-4 font-bold">
            🔊
          </div>
          <h3 className="text-lg font-bold mb-2 text-white">Audio Court Coach</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Pocket-ready speech cues and background-persistent timer keep your drills on pace without needing to look at a screen.
          </p>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl mb-4 font-bold">
            📱
          </div>
          <h3 className="text-lg font-bold mb-2 text-white">Screen vs. Court</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Automatically contrasts your passive mobile screen time with active training minutes. Beat the screen every single day.
          </p>
        </div>
      </div>

      {/* Footer info */}
      <footer className="w-full max-w-4xl border-t border-slate-800/80 pt-8 pb-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div>100% Local-First with IndexedDB (Dexie). No mandatory logins.</div>
        <div className="flex gap-4">
          <Link href="/today" className="hover:text-slate-300">Today</Link>
          <Link href="/progress" className="hover:text-slate-300">Progress</Link>
          <Link href="/spots" className="hover:text-slate-300">Court Spots</Link>
        </div>
      </footer>
    </main>
  );
}
