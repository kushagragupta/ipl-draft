'use client';

import { useState, useEffect } from 'react';

interface Player {
  id: string;
  name: string;
  team: string; // "CSK", "MI", etc.
  role: string; // "Batsman", "Bowler", "All-rounder", "Wicketkeeper"
  country: string;
  overseas: boolean;
  points2025: number;
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
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {rolePlayers.map((p) => {
                    const isOverseas = p.overseas;
                    const cardBg = isOverseas ? 'bg-error-container/10 border-error/30' : 'bg-surface-container-low border-outline-variant/10';
                    const iconColor = isOverseas ? 'text-error' : 'text-primary';
                    const stripeColor = isOverseas ? 'bg-error' : 'bg-primary';

                    return (
                      <div 
                        key={p.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, p.id)}
                        className={`relative group overflow-visible pt-8 px-6 pb-6 mt-8 rounded-md border transition-all hover:-translate-y-1 hover:shadow-2xl cursor-grab active:cursor-grabbing ${cardBg}`}
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-surface-variant opacity-20"></div>
                        <div className={`absolute top-0 left-0 w-1 h-full ${stripeColor} opacity-80 group-hover:opacity-100 transition-opacity`}></div>
                        
                        <div className="absolute -top-10 right-4 w-20 h-20 md:w-24 md:h-24 z-10 bg-surface-variant rounded-full flex items-center justify-center border-4 border-surface-container-low shadow-xl overflow-hidden pointer-events-none">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-4xl text-on-surface-variant font-icon">person</span>
                          )}
                        </div>
                        
                        <div className="flex justify-between items-start mb-4 relative z-20">
                          <span className={`material-symbols-outlined ${iconColor} font-icon`}>drag_indicator</span>
                        </div>
                        
                        <div className="relative z-20">
                          <span className={`font-label text-[10px] font-extrabold ${iconColor} uppercase tracking-[0.2em] leading-none`}>{p.role} • {p.country || "Ind"}</span>
                          <h3 className="font-headline text-2xl font-black mt-1 uppercase leading-tight text-white mb-2">{p.name}</h3>
                          
                          {isOverseas && (
                            <div className="flex flex-wrap gap-2 mt-1">
                              <span className="px-2 py-0.5 rounded-full bg-error/20 text-error text-[9px] font-label font-bold uppercase border border-error/20">Overseas</span>
                            </div>
                          )}
                          
                          <div className={`mt-4 flex justify-between items-end border-t border-outline-variant/20 pt-4`}>
                            <div>
                              <span className="text-[10px] font-label uppercase text-on-surface-variant">Fantasy Points</span>
                              <p className="text-xl font-headline font-bold text-white leading-none mt-1">{p.points2025}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Area: Potential XI sidebar */}
        <div className="lg:col-span-4">
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
