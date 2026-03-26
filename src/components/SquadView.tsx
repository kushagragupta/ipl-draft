'use client';

export default function SquadView({ state, players }: { state: any, players: any[] }) {
  // Compute points and squads
  const squads = state.users.map((u: any) => {
    const draftedPlayers = Object.keys(state.drafted)
      .filter(pid => state.drafted[pid] === u.id)
      .map(pid => players.find(p => p.id === pid));
    
    const totalPoints = draftedPlayers.reduce((sum, p) => sum + (p?.points2025 || 0), 0);
    return { ...u, players: draftedPlayers, totalPoints };
  });

  // Sort by points
  squads.sort((a: any, b: any) => b.totalPoints - a.totalPoints);

  return (
    <div>
      <h2 className="text-headline-lg font-display text-on-surface mb-6">STANDINGS</h2>
      <div className="flex flex-col gap-4">
        {squads.map((sq: any, idx: number) => (
          <div key={sq.id} className="bg-surface p-4 rounded-md border border-surface-variant">
            <div className="flex justify-between items-center mb-2">
              <span className="font-headline font-bold text-on-surface">
                {idx + 1}. {sq.name}
              </span>
              <span className="text-primary font-display text-lg">{sq.totalPoints} pts</span>
            </div>
            
            <div className="flex flex-col gap-1 mt-2">
              {sq.players.length === 0 ? (
                <span className="text-xs text-on-surface-variant italic font-body">No players yet</span>
              ) : (
                sq.players.map((p: any) => (
                  <div key={p.id} className="text-xs flex justify-between font-body text-on-surface-variant">
                    <span>{p.name} <span className="opacity-50">({p.team})</span></span>
                    <span>{p.points2025}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
