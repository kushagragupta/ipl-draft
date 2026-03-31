'use client';

import { useState, useEffect } from 'react';

interface Player {
  id: string;
  name: string;
  team: string; // "CSK", "MI", etc.
  role: string; // "Batsman", "Bowler", "All-rounder", "Wicketkeeper"
  country: string;
  overseas: boolean;
  total_points_2026: number;
  imageUrl?: string;
}

export default function TeamsDirectory() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('CSK');
  const [potentialXI, setPotentialXI] = useState<(Player | null)[]>(Array(11).fill(null));

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/draft?t=${Date.now()}`, { 
          headers: { 'ngrok-skip-browser-warning': 'true' },
          cache: 'no-store'
        });
        const data = await res.json();
        setPlayers(data.players || []);
      } catch (e: any) {
        console.error(e);
      }
    }
    fetchData();
  }, []);

  if (!players.length) return <div className="p-8 font-display text-white text-2xl">Loading Squads...</div>;

  const teams = Array.from(new Set(players.map(p => p.team))).sort();
  const currentSquad = players.filter(p => p.team === selectedTeam);

  const groupByRole = (squad: Player[]) => {
    const map: Record<string, Player[]> = {
      'Batsman': [],
      'Wicketkeeper': [],
      'All-rounder': [],
      'Bowler': []
    };
    squad.forEach(p => {
      if (map[p.role]) {
        map[p.role].push(p);
      } else {
        // Fallback if there's any anomaly
        if (!map['Others']) map['Others'] = [];
        map['Others'].push(p);
      }
    });
    return map;
  };

  const squadByRole = groupByRole(currentSquad);

  const handleDragStart = (e: React.DragEvent, playerId: string) => {
    e.dataTransfer.setData('playerId', playerId);
  };

  const handleDrop = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    const playerId = e.dataTransfer.getData('playerId');
    if (!playerId) return;

    const player = players.find(p => p.id === playerId);
    if (!player) return;

    // Remove player from other slots if they exist to avoid duplicates
    const newXI = [...potentialXI];
    const existingIndex = newXI.findIndex(p => p?.id === player.id);
    if (existingIndex > -1) {
      newXI[existingIndex] = null;
    }

    newXI[slotIndex] = player;
    setPotentialXI(newXI);
  };

  const removePlayer = (slotIndex: number) => {
    const newXI = [...potentialXI];
    newXI[slotIndex] = null;
    setPotentialXI(newXI);
  };

  return (
    <>
      <section className="mb-8">
        <h1 className="font-headline text-5xl font-black italic tracking-tighter mb-4 text-on-background uppercase">
          Franchise <span className="text-secondary">Hub</span>
        </h1>
        <p className="text-on-surface-variant max-w-2xl font-body">Browse official IPL rosters, analyze player performance metrics, and build your Potential XI for any franchise.</p>
      </section>

      {/* Team Tabs */}
      <div className="flex bg-surface-container-low border border-outline-variant/20 rounded-xl p-2 mb-10 overflow-x-auto hide-scrollbar gap-2">
        {teams.map(team => (
          <button
            key={team}
            onClick={() => setSelectedTeam(team)}
            className={`whitespace-nowrap px-6 py-3 rounded-lg font-headline font-bold uppercase transition-all tracking-wide text-sm ${
              selectedTeam === team 
                ? 'bg-secondary text-on-secondary shadow-lg shadow-secondary/20' 
                : 'text-on-surface hover:bg-surface-container-highest hover:text-white'
            }`}
          >
            {team}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Area: The Squads Segment */}
        <div className="lg:col-span-8 space-y-12">
          {Object.entries(squadByRole).map(([role, rolePlayers]) => {
            if (rolePlayers.length === 0) return null;
            return (
              <div key={role}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-1 w-16 bg-outline-variant"></div>
                  <h2 className="font-headline text-2xl font-black uppercase tracking-tight text-white">{role}s</h2>
                  <span className="text-on-surface-variant font-label text-xs uppercase">{rolePlayers.length} Players</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rolePlayers.map((p) => {
                    const isOverseas = p.overseas;
                    const cardBg = isOverseas 
                      ? 'bg-error-container/10 border-error/20 hover:border-error/40 hover:bg-error-container/20' 
                      : 'bg-surface-container-low border-outline-variant/10 hover:border-primary/40 hover:bg-surface-container-highest';
                    const iconColor = isOverseas ? 'text-error' : 'text-primary';

                    return (
                      <div 
                        key={p.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, p.id)}
                        className={`relative flex items-center gap-3 md:gap-4 py-3 px-3 md:py-4 md:px-4 min-h-[85px] md:min-h-[100px] rounded-xl border transition-all group lg:cursor-grab lg:active:cursor-grabbing ${cardBg}`}
                      >
                        <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full overflow-hidden shrink-0 border-2 border-surface-container-lowest bg-surface-variant group-hover:border-primary/50 transition-colors lg:pointer-events-none">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><span className="material-symbols-outlined text-on-surface-variant text-xl md:text-2xl font-icon">person</span></div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 py-0.5 md:py-1 lg:pointer-events-none">
                          <h4 className="font-headline font-bold text-white text-[13px] md:text-sm lg:text-base leading-tight uppercase pr-2">{p.name}</h4>
                          <div className="flex items-center gap-1 md:gap-1.5 mt-1 md:mt-1.5 flex-wrap">
                            <span className="text-[8px] md:text-[9px] font-label font-black text-on-surface-variant uppercase tracking-wider">{p.role}</span>
                            <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
                            <span className="text-[8px] md:text-[9px] font-label font-bold text-on-surface-variant uppercase tracking-widest">{p.team}</span>
                            {(p.country && p.country !== 'India') && (
                              <>
                                <span className="w-1 h-1 rounded-full bg-outline-variant hidden sm:block"></span>
                                <span className="text-[8px] md:text-[9px] font-label font-black text-error uppercase tracking-wider">{p.country}</span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Individual Points on Right Edge */}
                        <div className="shrink-0 flex flex-col items-end justify-center pl-2 md:pl-3 border-l border-outline-variant/10 lg:pointer-events-none">
                          <span className="text-base md:text-xl font-headline font-black text-white leading-none">{p.total_points_2026 || 0}</span>
                          <span className="text-[8px] font-label text-on-surface-variant uppercase tracking-widest mt-1">PTS</span>
                        </div>
                        
                        {/* Drag indicator icon on hover (Desktop only) */}
                        <div className="hidden lg:flex absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <span className={`material-symbols-outlined text-[14px] ${iconColor} font-icon`}>drag_indicator</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Area: Potential XI sidebar (Hidden on Mobile) */}
        <div className="hidden lg:block lg:col-span-4">
          <div className="sticky top-28 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-2xl">
            <div className="mb-6 pb-4 border-b border-outline-variant/10">
              <h2 className="font-headline text-2xl font-black italic tracking-tighter uppercase text-white flex items-center justify-between">
                Potential XI
                <span className="bg-secondary/20 text-secondary text-xs not-italic font-label px-3 py-1 rounded-full font-bold">
                  {potentialXI.filter(Boolean).length} / 11
                </span>
              </h2>
              <p className="text-xs text-on-surface-variant font-label mt-2">Drag and drop players here to build your squad configuration.</p>
            </div>
            
            <div className="space-y-1.5">
              {potentialXI.map((slot, index) => (
                <div 
                  key={index}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(e, index)}
                  className={`relative flex items-center p-2 rounded-lg border-2 transition-all ${
                    slot 
                      ? (slot.overseas ? 'border-error/40 bg-error-container/10' : 'border-primary/40 bg-primary/5') 
                      : 'border-dashed border-outline-variant/30 bg-surface-container-low hover:bg-surface-container hover:border-outline-variant/60'
                  } h-[42px]`}
                >
                  {slot ? (
                    <div className="w-full flex items-center justify-between pl-1">
                       <div className="flex flex-col">
                         <span className="font-headline font-bold text-white uppercase text-xs leading-none tracking-tight max-w-[150px] truncate">{slot.name}</span>
                         <span className="font-label text-[8px] text-on-surface-variant uppercase mt-0.5">
                           {slot.role} • {slot.overseas ? 'OS' : 'IND'}
                         </span>
                       </div>
                       <button 
                         onClick={() => removePlayer(index)}
                         className="p-1 rounded-full hover:bg-surface-variant text-on-surface-variant hover:text-white transition-colors flex items-center justify-center shrink-0"
                       >
                         <span className="material-symbols-outlined text-[14px]">close</span>
                       </button>
                    </div>
                  ) : (
                    <div className="w-full flex items-center justify-center gap-2 text-on-surface-variant opacity-60 pointer-events-none">
                      <span className="text-xs font-label uppercase italic tracking-widest font-bold">Slot {index + 1}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <button 
              onClick={() => setPotentialXI(Array(11).fill(null))}
              className="w-full mt-4 py-2 border border-error/50 text-error hover:bg-error/10 font-headline font-bold uppercase tracking-widest text-xs rounded-lg transition-colors"
            >
              Clear Squad
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
