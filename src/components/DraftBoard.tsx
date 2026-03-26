'use client';

import { useState, useEffect } from 'react';
import PlayerCard from './PlayerCard';
import SquadView from './SquadView';

interface User { id: string; name: string; }
interface Pick { playerId: string; userId: string; round: number; pickNumber: number; }
interface State { users: User[]; currentTurnIndex: number; drafted: Record<string, string>; pickHistory: Pick[]; round: number; }
interface Player { id: string; name: string; team: string; role: string; overseas: boolean; top20: boolean; points2025: number; }

export default function DraftBoard() {
  const [state, setState] = useState<State | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  
  const fetchData = async () => {
    try {
      const res = await fetch('/api/draft');
      const data = await res.json();
      setState(data.state);
      setPlayers(data.players);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchData(); }, []);

  const handlePick = async (playerId: string) => {
    if (!state) return;
    try {
      await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'PICK_PLAYER', payload: { playerId, userId: state.users[state.currentTurnIndex].id } })
      });
      fetchData();
    } catch (e) { console.error(e); }
  };

  if (!state || !players.length) {
    return <div className="p-10 text-on-surface font-display text-2xl">Loading the Arena...</div>;
  }

  const currentUser = state.users[state.currentTurnIndex];

  return (
    <div className="flex flex-col h-full">
      {/* Draft Ticker */}
      <div className="bg-surface-container-lowest py-3 overflow-hidden border-b border-outline-variant/20">
        <div className="whitespace-nowrap flex gap-8 animate-marquee pl-4">
          <span className="text-secondary font-display font-bold">LATEST PICKS &rarr;</span>
          {state.pickHistory.slice(0, 10).map((pick, i) => {
            const p = players.find(pl => pl.id === pick.playerId);
            const u = state.users.find(us => us.id === pick.userId);
            return (
              <span key={i} className="text-on-surface font-label text-sm uppercase">
                <span className="text-primary">{u?.name}</span> drafted <span className="font-bold">{p?.name}</span>
              </span>
            );
          })}
        </div>
      </div>

      <div className="flex-1 p-8 grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Board */}
        <div className="xl:col-span-3">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-display-lg font-display text-on-surface mb-2 tracking-tight">ROUND {state.round}</h1>
              <p className="text-title-lg font-body text-on-surface-variant gap-2 flex items-center">
                Active Pick: 
                <span className="inline-block bg-gradient-to-r from-primary to-primary-container text-on-primary-fixed px-4 py-1 rounded-sm font-bold shadow-lg">
                  {currentUser.name}
                </span>
              </p>
            </div>
            <div className="text-right">
              <p className="text-label-sm font-label text-outline-variant">{players.length - Object.keys(state.drafted).length} PLAYERS AVAILABLE</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {players.map(player => (
               <PlayerCard 
                 key={player.id} 
                 player={player} 
                 isDrafted={!!state.drafted[player.id]}
                 disabled={false}
                 onPick={handlePick}
               />
             ))}
          </div>
        </div>

        {/* Squad View Sidebar */}
        <div className="xl:col-span-1 bg-surface-container-low rounded-md p-6 h-fit border border-outline-variant/20 sticky top-8">
           <SquadView state={state} players={players} />
        </div>
      </div>
    </div>
  );
}
