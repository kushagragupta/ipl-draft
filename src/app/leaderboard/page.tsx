'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface User { id: string; name: string; }
interface State { users: User[]; drafted: Record<string, string>; }
interface Player { id: string; name: string; total_points_2026: number; }

export default function Leaderboard() {
  const [state, setState] = useState<State | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);

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

  if (!state || !players.length) return <div className="p-8 font-display text-white text-2xl">Calculating Leaderboard...</div>;

  const standings = state.users.map(u => {
    const draftedIds = Object.keys(state.drafted).filter(pid => state.drafted[pid] === u.id);
    const draftedPlayers = draftedIds.map(pid => players.find(p => p.id === pid)!);
    const totalPoints = draftedPlayers.reduce((sum, p) => sum + (p?.total_points_2026 || 0), 0);
    return { user: u, totalPoints };
  }).sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <>
      <section className="mb-12 text-center md:text-left">
        <h1 className="font-headline text-5xl font-black italic tracking-tighter mb-4 text-on-background uppercase">
          GLOBAL <span className="text-secondary">LEADERBOARD</span>
        </h1>
        <p className="text-on-surface-variant max-w-2xl font-body md:mx-0 mx-auto">
          The official real-time standings for the season. Total scores uniquely aggregate the Dream11 mathematical matrix across all active manager acquisitions.
        </p>
      </section>

      <div className="flex flex-col gap-4 md:gap-5 w-full max-w-4xl">
        {standings.map((team, index) => {
            const isFirst = index === 0;
            const cardBg = isFirst 
                ? "bg-secondary-container/20 border-secondary focus:ring-secondary/50 hover:bg-secondary-container/30 border-2" 
                : "bg-surface-container border-outline-variant/10 focus:ring-primary/50 hover:border-primary/30 hover:bg-surface-container-highest border";

            return (
                <Link 
                  href={`/squads?team=${team.user.id}`} 
                  key={team.user.id}
                  className={`group relative flex items-center justify-between py-5 px-6 rounded-2xl transition-all outline-none focus:ring-2 cursor-pointer shadow-lg overflow-hidden ${cardBg}`}
                >
                    {isFirst && (
                         <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                    )}
                    
                    <div className="flex items-center gap-6 z-10">
                        {/* Rank Badge */}
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-headline font-black text-2xl shrink-0 ${isFirst ? 'bg-secondary text-on-secondary-fixed shadow-[0_0_15px_rgba(235,195,84,0.4)]' : 'bg-surface-container-highest text-on-surface-variant border border-outline-variant/20 group-hover:text-white transition-colors'}`}>
                           {index + 1}
                        </div>
                        
                        <div className="flex flex-col">
                           <h2 className={`font-headline font-black uppercase tracking-tight line-clamp-1 ${isFirst ? 'text-2xl md:text-3xl text-white' : 'text-xl md:text-2xl text-white/90'}`}>
                               {team.user.name}
                           </h2>
                           <span className="text-xs font-label uppercase text-on-surface-variant tracking-widest mt-1">
                               Managing Director
                           </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end z-10 shrink-0 border-l border-outline-variant/10 pl-6 ml-4">
                        <span className={`font-headline font-black leading-none ${isFirst ? 'text-4xl md:text-5xl text-secondary drop-shadow-[0_0_10px_rgba(235,195,84,0.3)]' : 'text-3xl md:text-4xl text-primary'}`}>
                            {team.totalPoints.toLocaleString()}
                        </span>
                        <span className="text-[10px] font-label font-bold text-on-surface-variant uppercase tracking-[0.2em] mt-2">
                             Total Points
                        </span>
                    </div>
                </Link>
            )
        })}
      </div>
    </>
  );
}
