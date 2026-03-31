import React from 'react';

export default function RulesPage() {
  return (
    <div className="flex-1 space-y-6 max-w-6xl mx-auto w-full pb-12">
      <div className="flex flex-col gap-2 pt-6">
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          FANTASY SCORING SYSTEM
        </h1>
        <p className="text-muted-foreground text-sm">
          The official Draft Arena mathematical matrix indicating exact point awards for player actions inside IPL 2026.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Batting Rules */}
        <div className="p-5 flex flex-col gap-4 rounded-xl border border-white/10 bg-[#161b22]/50 backdrop-blur-md shadow-xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <span className="material-symbols-outlined text-blue-400 text-3xl">sports_cricket</span>
            <h2 className="text-xl font-bold text-white tracking-wide">Batting</h2>
          </div>
          <div className="flex flex-col gap-2 text-sm text-gray-300">
            <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-400">Every Run Scored</span> <span className="font-mono text-primary">+1</span></div>
            <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-400">Boundary Bonus</span> <span className="font-mono text-primary">+4</span></div>
            <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-400">Six Bonus</span> <span className="font-mono text-primary">+6</span></div>
            <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-400">Half Century (50)</span> <span className="font-mono text-primary">+8</span></div>
            <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-400">Century (100)</span> <span className="font-mono text-primary">+16</span></div>
            <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-400">Dismissal for Duck</span> <span className="font-mono text-red-400">-2</span></div>
            <div className="mt-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">Strike Rate (Min 10 Balls)</div>
            <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-400">&gt; 170 Runs / 100 Balls</span> <span className="font-mono text-primary">+6</span></div>
            <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-400">150.01 - 170</span> <span className="font-mono text-primary">+4</span></div>
            <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-400">130 - 150</span> <span className="font-mono text-primary">+2</span></div>
            <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-400">60 - 70</span> <span className="font-mono text-red-400">-2</span></div>
            <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-400">50 - 59.99</span> <span className="font-mono text-red-400">-4</span></div>
            <div className="flex justify-between py-1"><span className="text-gray-400">&lt; 50 Runs / 100 Balls</span> <span className="font-mono text-red-400">-6</span></div>
          </div>
        </div>

        {/* Bowling Rules */}
        <div className="p-5 flex flex-col gap-4 rounded-xl border border-white/10 bg-[#161b22]/50 backdrop-blur-md shadow-xl overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 border-b border-white/5 pb-4">
            <span className="material-symbols-outlined text-green-400 text-3xl">sports_baseball</span>
            <h2 className="text-xl font-bold text-white tracking-wide">Bowling</h2>
          </div>
          <div className="flex flex-col gap-2 text-sm text-gray-300">
            <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-400">Wicket</span> <span className="font-mono text-primary">+30</span></div>
            <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-400">Bonus (LBW / Bowled)</span> <span className="font-mono text-primary">+8</span></div>
            <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-400">Dot Ball</span> <span className="font-mono text-primary">+1</span></div>
            <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-400">Maiden Over</span> <span className="font-mono text-primary">+12</span></div>
            <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-400">3 Wicket Haul</span> <span className="font-mono text-primary">+4</span></div>
            <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-400">4 Wicket Haul</span> <span className="font-mono text-primary">+8</span></div>
            <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-400">5 Wicket Haul</span> <span className="font-mono text-primary">+16</span></div>
            <div className="mt-2 text-xs font-semibold text-green-400 uppercase tracking-wider">Economy Rate (Min 2 Overs)</div>
            <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-400">Below 5 Runs/Over</span> <span className="font-mono text-primary">+6</span></div>
            <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-400">Between 5 - 5.99</span> <span className="font-mono text-primary">+4</span></div>
            <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-400">Between 6 - 7</span> <span className="font-mono text-primary">+2</span></div>
            <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-400">Between 10 - 11</span> <span className="font-mono text-red-400">-2</span></div>
            <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-400">Between 11.01 - 12</span> <span className="font-mono text-red-400">-4</span></div>
            <div className="flex justify-between py-1"><span className="text-gray-400">Above 12 Runs/Over</span> <span className="font-mono text-red-400">-6</span></div>
          </div>
        </div>

        {/* Fielding & Other Rules */}
        <div className="flex flex-col gap-6">
          <div className="p-5 flex flex-col gap-4 rounded-xl border border-white/10 bg-[#161b22]/50 backdrop-blur-md shadow-xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <span className="material-symbols-outlined text-amber-400 text-3xl">security</span>
              <h2 className="text-xl font-bold text-white tracking-wide">Fielding</h2>
            </div>
            <div className="flex flex-col gap-2 text-sm text-gray-300">
              <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-400">Catch</span> <span className="font-mono text-primary">+8</span></div>
              <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-400">3 Catch Bonus</span> <span className="font-mono text-primary">+4</span></div>
              <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-400">Stumping</span> <span className="font-mono text-primary">+12</span></div>
              <div className="flex justify-between py-1 border-b border-white/5"><span className="text-gray-400">Run Out (Direct Hit)</span> <span className="font-mono text-primary">+12</span></div>
              <div className="flex justify-between py-1"><span className="text-gray-400">Run Out (Thrower/Catcher)</span> <span className="font-mono text-primary">+6</span></div>
            </div>
          </div>

          <div className="p-5 flex flex-col gap-4 rounded-xl border border-white/10 bg-[#161b22]/50 backdrop-blur-md shadow-xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <span className="material-symbols-outlined text-purple-400 text-3xl">military_tech</span>
              <h2 className="text-xl font-bold text-white tracking-wide">Other Points</h2>
            </div>
            <div className="flex flex-col gap-2 text-sm text-gray-300">
              <div className="flex justify-between py-1"><span className="text-gray-400">In Playing XI or Impact Sub</span> <span className="font-mono text-primary">+4</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
