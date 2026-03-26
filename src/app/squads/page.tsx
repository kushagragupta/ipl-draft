'use client';

import { useState, useEffect } from 'react';

interface User { id: string; name: string; }
interface State { users: User[]; drafted: Record<string, string>; }
interface Player { id: string; name: string; team: string; role: string; country: string; overseas: boolean; points2025: number; imageUrl?: string; }

export default function SquadsDirectory() {
  const [state, setState] = useState<State | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/draft?t=${Date.now()}`, { 
          headers: { 'ngrok-skip-browser-warning': 'true' },
          cache: 'no-store'
        });
        const data = await res.json();
        setState(data.state);
        setPlayers(data.players);
      } catch (e) {
        console.error(e);
      }
    }
    fetchData();
  }, []);

  if (!state || !players.length) return <div className="p-8 font-display text-white text-2xl">Loading Squads...</div>;

  // Group drafted players by User (Manager)
  const squads = state.users.map(u => {
    const draftedIds = Object.keys(state.drafted).filter(pid => state.drafted[pid] === u.id);
    const draftedPlayers = draftedIds.map(pid => players.find(p => p.id === pid)!);
    const totalPoints = draftedPlayers.reduce((sum, p) => sum + (p?.points2025 || 0), 0);
    return { user: u, players: draftedPlayers, totalPoints };
  });

  return (
    <>
      <section className="mb-12">
        <h1 className="font-headline text-5xl font-black italic tracking-tighter mb-4 text-on-background">
          TEAM SQUADS <span className="text-primary">2026</span>
        </h1>
        <p className="text-on-surface-variant max-w-2xl font-body">Browse completed manager squads, analyze player performance metrics, and track overseas quotas for the current drafted season.</p>
      </section>

      {/* Dynamic Filter Bar */}
      <section className="mb-10 flex flex-wrap items-center gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
        <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-highest rounded-lg">
          <span className="material-symbols-outlined text-primary text-sm font-icon">filter_list</span>
          <span className="font-label text-xs font-bold uppercase tracking-wider">Filter By Manager:</span>
        </div>
        <div className="flex gap-2 overflow-x-auto hide-scrollbar flex-1 pb-1">
          <button onClick={() => setFilter('All')} className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-label font-bold uppercase transition-colors ${filter === 'All' ? 'bg-primary text-on-primary' : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container-highest'}`}>All Teams</button>
          {state.users.map(m => (
            <button key={m.id} onClick={() => setFilter(m.id)} className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-label font-bold uppercase transition-colors ${filter === m.id ? 'bg-primary text-on-primary' : 'border border-outline-variant text-on-surface-variant hover:bg-surface-container-highest'}`}>
              {m.name}
            </button>
          ))}
        </div>
      </section>

      <div className="space-y-16">
        {squads.filter(sq => filter === 'All' || sq.user.id === filter).map(sq => (
          <div key={sq.user.id}>
            <div className="flex items-center justify-between mb-6 mt-8 pb-4 border-b border-outline-variant/10">
              <div className="flex items-center gap-4">
                <div className="h-8 w-1.5 bg-primary rounded-full"></div>
                <h2 className="font-headline text-2xl md:text-3xl font-black uppercase tracking-tight text-white line-clamp-1">{sq.user.name}'s Squad</h2>
                <span className="hidden md:inline-block bg-surface-container-highest text-on-surface-variant px-3 py-1 rounded-full font-label text-xs font-bold uppercase">{sq.players.length}/11 Players</span>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] font-label text-on-surface-variant uppercase tracking-widest">Total Fantasy Points</p>
                <p className="text-2xl md:text-3xl font-headline font-black text-secondary leading-none mt-1">{sq.totalPoints.toLocaleString()}</p>
              </div>
            </div>

            {sq.players.length === 0 ? (
               <div className="h-32 flex items-center justify-center border-2 border-dashed border-outline-variant/10 rounded-xl w-full">
                 <p className="text-on-surface-variant italic font-label text-sm uppercase font-bold tracking-widest">No players drafted yet</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sq.players.map((p, pIdx) => {
                  const cardBg = p.overseas 
                    ? "bg-error-container/10 border-error/20 hover:border-error/40 hover:bg-error-container/20" 
                    : "bg-surface-container-low border-outline-variant/10 hover:border-primary/40 hover:bg-surface-container-highest";
                  
                  return (
                    <div key={p.id} className={`flex items-center gap-4 py-5 px-4 lg:py-6 lg:px-5 min-h-[110px] rounded-xl border transition-all group ${cardBg}`}>
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden shrink-0 border-2 border-surface-container-lowest bg-surface-variant group-hover:border-primary/50 transition-colors">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-on-surface-variant text-2xl font-icon">person</span></div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1 py-1">
                        <h4 className="font-headline font-bold text-white text-sm md:text-base leading-tight uppercase pr-2">{p.name}</h4>
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                          <span className="text-[9px] font-label font-black text-on-surface-variant uppercase tracking-wider">{p.role}</span>
                          <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                          <span className="text-[9px] font-label font-bold text-on-surface-variant uppercase tracking-widest">{p.team}</span>
                          {(p.country && p.country !== 'India') && (
                            <>
                              <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                              <span className="text-[9px] font-label font-black text-error uppercase tracking-wider">{p.country}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Individual Points on Right Edge */}
                      <div className="shrink-0 flex flex-col items-end justify-center pl-2 border-l border-outline-variant/10">
                        <span className="text-xl font-headline font-black text-white leading-none">{p.points2025 || 0}</span>
                        <span className="text-[8px] font-label text-on-surface-variant uppercase tracking-widest mt-1">PTS</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
