'use client';
import { useState, useEffect } from 'react';

// Shared interfaces
interface User { id: string; name: string; }
interface Pick { playerId: string; userId: string; round: number; pickNumber: number; }
interface State { users: User[]; currentTurnIndex: number; drafted: Record<string, string>; pickHistory: Pick[]; round: number; status: string; }
interface Player { id: string; name: string; team: string; role: string; country: string; overseas: boolean; points2025: number; imageUrl?: string; }

export default function DraftRoom() {
  const [state, setState] = useState<State | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [newUserName, setNewUserName] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');
  const [mobileDrawerTeamId, setMobileDrawerTeamId] = useState<string | null>(null);
  
  const fetchData = async () => {
    try {
      const res = await fetch(`/api/draft?t=${Date.now()}`, { 
        headers: { 'ngrok-skip-browser-warning': 'true' },
        cache: 'no-store'
      });
      const data = await res.json();
      setState(data.state);
      setPlayers(data.players);
    } catch (e: any) {
      console.error(e);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handlePick = async (playerId: string) => {
    if (!state) return;
    try {
      await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ action: 'PICK_PLAYER', payload: { playerId, userId: state.users[state.currentTurnIndex].id } })
      });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleAddUser = async () => {
    if (!newUserName.trim()) return;
    try {
      await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ action: 'ADD_USER', payload: { name: newUserName } })
      });
      setNewUserName('');
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleStartDraft = async () => {
    try {
      await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ action: 'START_DRAFT' })
      });
      fetchData();
    } catch (e) { console.error(e); }
  };

  const handleHardReset = async () => {
    try {
      await fetch('/api/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'ngrok-skip-browser-warning': 'true' },
        body: JSON.stringify({ action: 'HARD_RESET' })
      });
      setShowResetConfirm(false);
      fetchData();
    } catch (e) { console.error(e); }
  };

  if (!state || !players.length) return <div className="p-8 font-display text-white text-2xl">Loading Draft Arena...</div>;

  if (state.status === 'NOT_STARTED') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <h1 className="font-headline text-5xl md:text-7xl font-black uppercase tracking-tighter text-white italic mb-10">Draft <span className="text-primary">Lobby</span></h1>
        <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/20 w-full max-w-md shadow-2xl relative">
          <h3 className="font-headline font-bold text-white text-xl uppercase mb-4 tracking-wider">Registered Managers</h3>
          
          <div className="space-y-2 mb-8 min-h-[120px]">
            {state.users.map((u, i) => (
               <div key={i} className="flex items-center justify-between p-3.5 bg-surface-container-highest rounded border border-outline-variant/10 shadow-sm">
                 <span className="font-headline font-bold text-white uppercase tracking-wider">{u.name}</span>
               </div>
            ))}
            {state.users.length === 0 && <p className="text-on-surface-variant text-sm italic font-body py-4 text-center">No managers added yet.</p>}
          </div>

          <div className="flex gap-2 mb-8">
            <input 
              type="text" 
              value={newUserName}
              onChange={e => setNewUserName(e.target.value)}
              placeholder="Enter Manager Name"
              className="flex-1 bg-surface-container-highest border border-outline-variant/30 text-white rounded-lg px-4 py-3 outline-none focus:border-primary placeholder-on-surface-variant font-body transition-colors"
              onKeyDown={e => e.key === 'Enter' && handleAddUser()}
            />
            <button onClick={handleAddUser} className="bg-secondary hover:bg-secondary/90 text-on-secondary-container px-6 py-3 rounded-lg font-bold uppercase text-sm tracking-wider transition-colors shadow-lg">Add</button>
          </div>

          <button 
            onClick={handleStartDraft}
            disabled={state.users.length < 2}
            className="w-full py-4.5 bg-primary text-on-primary-fixed font-headline font-black text-lg uppercase tracking-widest rounded-lg shadow-[0_0_20px_rgba(255,231,146,0.2)] hover:shadow-[0_0_30px_rgba(255,231,146,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Ranked Draft
          </button>
        </div>
      </div>
    );
  }

  const activeUserId = state.users[state.currentTurnIndex].id;
  const availablePlayers = players.filter(p => !state.drafted[p.id]);
  
  const filteredPlayers = availablePlayers.filter(p => {
    if (teamFilter !== 'All' && p.team !== teamFilter) return false;
    if (roleFilter !== 'All' && p.role !== roleFilter) return false;
    if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const teamsList = ['All', ...Array.from(new Set(players.map(p => p.team))).sort()];
  const rolesList = ['All', ...Array.from(new Set(players.map(p => p.role))).sort()];

  return (
    <>
      {/* Reset Confirmation Modal */}
      {showResetConfirm && state.status !== 'COMPLETED' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-surface-container-highest p-8 rounded-2xl border border-error/30 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="w-16 h-16 rounded-full bg-error-container/20 flex items-center justify-center mb-4 border border-error/20">
                <span className="material-symbols-outlined text-4xl text-error font-icon">warning</span>
              </div>
              <h3 className="font-headline font-black text-white text-2xl uppercase tracking-wider text-center">Nuclear Reset?</h3>
              <p className="text-on-surface-variant font-body text-center mt-3 text-sm">This will permanently purge the entire Draft Arena database. All registered managers and picks will be vaporized.</p>
            </div>
            <div className="flex gap-4">
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 py-3.5 bg-surface-container border border-outline-variant/20 hover:bg-surface-variant text-white font-bold rounded-lg transition-colors uppercase text-xs tracking-wider">Cancel</button>
              <button onClick={handleHardReset} className="flex-1 py-3.5 bg-error text-on-error font-black rounded-lg hover:bg-error/90 shadow-[0_0_20px_rgba(255,180,171,0.3)] transition-colors uppercase text-xs tracking-wider">Annihilate</button>
            </div>
          </div>
        </div>
      )}

      {/* NBA-Style Draft Board Header */}
      <section className="mb-10 relative">
        {state.status !== 'COMPLETED' && (
          <button onClick={() => setShowResetConfirm(true)} className="absolute right-0 -top-8 text-error bg-error/10 hover:bg-error/20 px-3 py-1.5 rounded text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1 cursor-pointer">
            <span className="material-symbols-outlined text-[14px]">refresh</span> Reset Draft
          </button>
        )}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tertiary-container text-on-tertiary-container mb-4">
              <span className="material-symbols-outlined text-sm font-icon" style={{ fontVariationSettings: "'FILL' 1" }}>fiber_manual_record</span>
              <span className="font-label text-[10px] font-bold uppercase tracking-wider">Live Round {state.round}</span>
            </div>
            <h1 className="font-headline text-5xl md:text-7xl font-black uppercase tracking-tighter text-white italic leading-none mb-2">
              Draft <span className="text-primary">Center</span>
            </h1>
            <p className="text-on-surface-variant font-body text-lg max-w-xl">The 2026 Mega Auction is underway. Build your legacy.</p>
          </div>
          {/* Countdown Timer Module */}
          <div className="bg-surface-container-high p-6 rounded-xl border-l-4 border-primary shadow-2xl min-w-[280px]">
            {state.status === 'COMPLETED' ? (
              <div className="flex flex-col items-center justify-center space-y-2">
                <span className="material-symbols-outlined text-4xl text-primary font-icon">verified</span>
                <span className="text-xl font-headline font-black text-white uppercase tracking-widest">Draft Complete</span>
              </div>
            ) : (
              <>
                <p className="text-xs font-label uppercase text-on-surface-variant mb-2">Active Picker</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-headline font-black text-primary tracking-tighter">{state.users[state.currentTurnIndex]?.name}</span>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center">
                     <span className="material-symbols-outlined text-sm text-secondary font-icon">timer</span>
                  </div>
                  <p className="text-sm font-semibold text-white">is on the clock</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Draft Ticker (NBA Style) */}
      <div className="w-full bg-surface-container-lowest py-6 mb-12 -mx-4 md:-mx-8 px-4 md:px-8 overflow-hidden border-y border-outline-variant/20">
        <div className="flex items-center gap-8 overflow-x-auto hide-scrollbar whitespace-nowrap">
          {/* Current Pick Indicator */}
          {state.status !== 'COMPLETED' && (
            <div className="flex items-center gap-4 bg-primary px-6 py-3 rounded-md shadow-[0_0_30px_rgba(255,231,146,0.2)]">
              <span className="font-headline font-black text-on-primary-fixed text-2xl italic">#{state.pickHistory.length + 1}</span>
              <div className="h-10 w-[2px] bg-on-primary-fixed/20"></div>
              <div>
                <p className="text-[10px] font-label font-black uppercase text-on-primary-fixed leading-none">On the Clock</p>
                <p className="text-lg font-headline font-black uppercase text-on-primary-fixed">{state.users[state.currentTurnIndex]?.name}</p>
              </div>
            </div>
          )}
          {/* Recent Picks mapped */}
          <div className="flex items-center gap-12 text-on-surface-variant font-headline font-bold uppercase">
            {state.pickHistory.slice(0, 10).map((pick, i) => {
              const op = Math.max(20, 80 - (i * 15));
              const user = state.users.find(u => u.id === pick.userId);
              const player = players.find(p => p.id === pick.playerId);
              return (
                <div key={i} className="flex items-center gap-4" style={{ opacity: op / 100 }}>
                  <span className="text-xl italic">#{pick.pickNumber}</span>
                  <div>
                     <p className="text-[10px] font-label font-black leading-none text-secondary tracking-widest">{user?.name}</p>
                     <p className="text-sm text-white">{player?.name}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* DESKTOP Left Area: Managers & Squads Vertically */}
        <div className="hidden lg:block lg:col-span-8 order-2 lg:order-1 space-y-8">
           <div className="flex items-center justify-between">
              <h2 className="font-headline font-black text-3xl uppercase tracking-tight italic text-white">
                 League Squads
              </h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
              {state.users.map((manager, idx) => {
                 const isActive = state.currentTurnIndex === idx;
                 const managerDrafts = state.pickHistory.filter(pick => pick.userId === manager.id).sort((a,b) => a.pickNumber - b.pickNumber);
                 const draftedPlayers = managerDrafts.map(pick => players.find(p => p.id === pick.playerId)!);
                 const slots = [...draftedPlayers, ...Array(11 - draftedPlayers.length).fill(null)];
                 
                 return (
                    <div key={manager.id} className={`bg-surface-container-low rounded-xl border p-4 transition-all ${isActive ? 'border-primary ring-1 ring-primary/50 shadow-[0_0_20px_rgba(255,231,146,0.1)]' : 'border-outline-variant/10'}`}>
                       <div className="flex items-center justify-between mb-4 pb-3 border-b border-outline-variant/10">
                          <h3 className={`font-headline text-2xl italic uppercase font-black flex items-center gap-2 ${isActive ? 'text-primary' : 'text-white'}`}>
                            {manager.name}
                            {isActive && <span className="bg-primary text-on-primary-fixed text-[8px] px-1.5 py-0.5 rounded uppercase font-bold not-italic tracking-wider animate-pulse">Picking</span>}
                          </h3>
                          <span className="text-[10px] font-label text-on-surface-variant uppercase font-bold">{draftedPlayers.length}/11 Players</span>
                       </div>
                       
                       <div className="space-y-1.5">
                          {slots.map((p, i) => (
                            <div key={i} className={`flex items-center p-2 rounded-lg border-2 transition-all h-[42px] ${p ? (p.overseas ? 'border-error/30 bg-error-container/10' : 'border-outline-variant/20 bg-surface-container-high') : 'border-dashed border-outline-variant/10 bg-transparent'}`}>
                               {p ? (
                                  <div className="w-full flex justify-between items-center pl-1">
                                     <div className="flex flex-col flex-1 min-w-0 pr-2">
                                        <span className="font-headline font-bold text-white uppercase text-xs leading-none tracking-tight truncate max-w-[140px]">{p.name}</span>
                                        <span className="font-label text-[8px] text-on-surface-variant uppercase mt-1 truncate">
                                           {p.role} • {p.overseas ? 'OS' : 'IND'} • {p.team}
                                        </span>
                                     </div>
                                     {p.imageUrl ? (
                                       <img src={p.imageUrl} className="w-8 h-8 rounded-full object-cover bg-surface-variant shrink-0 border border-outline-variant/20" />
                                     ) : (
                                       <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center shrink-0 border border-outline-variant/20">
                                          <span className="material-symbols-outlined text-[14px] text-on-surface-variant opacity-70">person</span>
                                       </div>
                                     )}
                                  </div>
                               ) : (
                                  <span className="text-[9px] font-label uppercase text-on-surface-variant/40 italic font-bold pl-1">Slot {i+1}</span>
                               )}
                            </div>
                          ))}
                       </div>
                    </div>
                 )
              })}
           </div>
        </div>

        {/* Right Area: Player List with Filters */}
        <div className="lg:col-span-4 lg:col-start-9 order-1 lg:order-2 sticky top-[100px] z-10">
          <div className="bg-surface-container-low p-4 lg:p-5 rounded-xl border border-outline-variant/10 flex flex-col h-[65vh] lg:h-[650px] shadow-2xl">
             <div className="mb-4 space-y-3 shrink-0">
                <div className="flex items-baseline justify-between">
                  <h3 className="font-headline font-black text-xl text-white uppercase italic">Player Pool</h3>
                  <span className="text-secondary text-[10px] font-label font-bold uppercase">{availablePlayers.length} Remaining</span>
                </div>
                
                {/* Search Bar */}
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
                  <input 
                    type="text" 
                    placeholder="Search by name..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-surface-container-highest border border-outline-variant/20 focus:border-primary/50 text-white rounded-lg py-2.5 px-10 outline-none font-body text-sm transition-colors"
                  />
                </div>
                
                {/* Filters */}
                <div className="flex gap-2">
                  <div className="relative w-1/2">
                    <select value={teamFilter} onChange={(e) => setTeamFilter(e.target.value)} className="w-full appearance-none bg-surface-container-highest border border-outline-variant/20 focus:border-primary/30 text-white text-[10px] font-label font-bold uppercase px-3 py-2.5 rounded-lg outline-none cursor-pointer">
                      {teamsList.map(t => <option key={t} value={t}>{t === 'All' ? 'All Teams' : t}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[16px]">expand_more</span>
                  </div>
                  
                  <div className="relative w-1/2">
                    <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="w-full appearance-none bg-surface-container-highest border border-outline-variant/20 focus:border-primary/30 text-white text-[10px] font-label font-bold uppercase px-3 py-2.5 rounded-lg outline-none cursor-pointer">
                      {rolesList.map(r => <option key={r} value={r}>{r === 'All' ? 'All Roles' : r}</option>)}
                    </select>
                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none text-[16px]">expand_more</span>
                  </div>
                </div>
             </div>
             
             {/* Compact Cards List */}
             <div className="flex-1 overflow-y-auto space-y-2 hide-scrollbar pr-1">
                {filteredPlayers.map(p => (
                   <div key={p.id} onClick={() => handlePick(p.id)} className="flex items-center gap-3 p-2.5 rounded-lg border border-outline-variant/10 bg-surface-container-high hover:border-primary/40 hover:bg-surface-container-highest transition-all cursor-pointer group">
                      <div className="w-10 h-10 shrink-0">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded-full object-cover bg-surface-container-lowest border border-outline-variant/20" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center border border-outline-variant/20">
                            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">person</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                         <h5 className="font-headline font-bold text-sm text-white truncate">{p.name}</h5>
                         <p className="text-[8px] font-label text-on-surface-variant uppercase mt-1 flex items-center gap-1.5 truncate">
                           {p.role} <span className="w-1 h-1 bg-outline-variant rounded-full shrink-0"></span> {p.team} <span className="w-1 h-1 bg-outline-variant rounded-full shrink-0"></span> {p.country || "IND"}
                         </p>
                      </div>
                      
                      {state.status !== 'COMPLETED' && (
                        <button className="text-primary bg-primary/10 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                           <span className="material-symbols-outlined text-[16px]">add</span>
                        </button>
                      )}
                   </div>
                ))}
                
                {filteredPlayers.length === 0 && (
                   <div className="flex flex-col items-center justify-center h-32 text-on-surface-variant opacity-70">
                      <span className="material-symbols-outlined text-3xl mb-2">search_off</span>
                      <p className="text-xs italic font-label">No players found.</p>
                   </div>
                )}
             </div>
          </div>
        </div>
      </div>
      
      {/* ---------------- MOBILE SPECIFIC FOOTER & DRAWER ---------------- */}
      
      {/* Mobile Managers Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-surface-container-highest border-t border-outline-variant/20 p-3 z-40 pb-5 md:pb-6 flex overflow-x-auto gap-3 hide-scrollbar shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {state.users.map((m, idx) => {
          const isActive = state.currentTurnIndex === idx;
          return (
            <button 
              key={m.id} 
              onClick={() => setMobileDrawerTeamId(m.id)}
              className={`flex-shrink-0 px-4 py-2.5 rounded-lg font-headline font-bold uppercase tracking-wider text-[11px] border transition-colors ${isActive ? 'bg-primary/20 text-primary border-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)] animate-pulse' : 'bg-surface-container-low text-on-surface-variant border-outline-variant/20 hover:text-white'}`}
            >
              {m.name}
            </button>
          )
        })}
      </div>

      {/* Mobile Drawer (Bottom Sheet) */}
      {mobileDrawerTeamId && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end pointer-events-none">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={() => setMobileDrawerTeamId(null)}></div>
          
          {/* Sheet */}
          <div className="relative bg-[#111318] w-full h-[75vh] rounded-t-3xl border-t border-outline-variant/20 flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.5)] pointer-events-auto animate-in slide-in-from-bottom-20 duration-300">
            <div className="flex items-center justify-between p-5 border-b border-outline-variant/10 bg-surface-container-low shrink-0 rounded-t-3xl">
               {(() => {
                 const m = state.users.find(u => u.id === mobileDrawerTeamId)!;
                 const isActive = state.currentTurnIndex === state.users.findIndex(u => u.id === mobileDrawerTeamId);
                 const draftedCount = state.pickHistory.filter(pick => pick.userId === m.id).length;
                 return (
                   <>
                     <div>
                       <h3 className={`font-headline text-2xl md:text-3xl italic uppercase font-black flex items-center gap-2 ${isActive ? 'text-primary' : 'text-white'}`}>
                         {m.name}
                       </h3>
                       <p className="text-[10px] md:text-xs font-label text-on-surface-variant uppercase font-bold mt-1 tracking-wider">{draftedCount}/11 Players</p>
                     </div>
                     <button onClick={() => setMobileDrawerTeamId(null)} className="w-10 h-10 rounded-full bg-surface-variant border border-outline-variant/20 text-on-surface hover:bg-white/10 transition flex items-center justify-center">
                       <span className="material-symbols-outlined text-[20px]">expand_more</span>
                     </button>
                   </>
                 )
               })()}
            </div>
            
            <div className="overflow-y-auto p-4 space-y-2 flex-1 relative hide-scrollbar pb-10">
               {(() => {
                 const m = state.users.find(u => u.id === mobileDrawerTeamId)!;
                 const managerDrafts = state.pickHistory.filter(pick => pick.userId === m.id).sort((a,b) => a.pickNumber - b.pickNumber);
                 const draftedPlayers = managerDrafts.map(pick => players.find(p => p.id === pick.playerId)!);
                 const slots = [...draftedPlayers, ...Array(11 - draftedPlayers.length).fill(null)];
                 return slots.map((p, i) => (
                   <div key={i} className={`flex items-center p-2 rounded-lg border-2 transition-all h-[56px] ${p ? (p.overseas ? 'border-error/30 bg-error-container/10' : 'border-outline-variant/20 bg-surface-container-high') : 'border-dashed border-outline-variant/10 bg-transparent'}`}>
                      {p ? (
                         <div className="w-full flex justify-between items-center pl-2">
                            <div className="flex flex-col flex-1 min-w-0 pr-2">
                               <span className="font-headline font-bold text-white uppercase text-[13px] md:text-[14px] leading-none tracking-tight truncate max-w-[200px] md:max-w-xs">{p.name}</span>
                               <span className="font-label text-[9px] md:text-[10px] text-on-surface-variant uppercase mt-1.5 truncate tracking-widest">
                                  {p.role} • {p.overseas ? 'OS' : 'IND'} • {p.team}
                               </span>
                            </div>
                            {p.imageUrl ? (
                              <img src={p.imageUrl} className="w-10 h-10 rounded-full object-cover bg-surface-variant shrink-0 border border-outline-variant/20" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center shrink-0 border border-outline-variant/20">
                                 <span className="material-symbols-outlined text-[18px] text-on-surface-variant opacity-70">person</span>
                              </div>
                            )}
                         </div>
                      ) : (
                         <span className="text-[10px] font-label uppercase text-on-surface-variant/40 italic font-bold pl-2 tracking-widest">Empty Slot {i+1}</span>
                      )}
                   </div>
                 ));
               })()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
