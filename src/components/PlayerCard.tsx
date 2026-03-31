'use client';

interface Player {
  id: string;
  name: string;
  team: string;
  role: string;
  overseas: boolean;
  top20: boolean;
  total_points_2026: number;
}

interface PlayerCardProps {
  player: Player;
  onPick: (playerId: string) => void;
  disabled: boolean;
  isDrafted: boolean;
}

export default function PlayerCard({ player, onPick, disabled, isDrafted }: PlayerCardProps) {
  // Determine team accent color classes (naive implementation using inline styles for dynamic colors based on team)
  let accentColor = '#72a2fd'; // default blue
  if (player.team === 'CSK') accentColor = '#ffe792';
  if (player.team === 'RCB') accentColor = '#ff7163';
  if (player.team === 'MI') accentColor = '#004ba0';

  return (
    <div 
      className={`relative p-4 rounded-md bg-surface-container-low transition-all duration-300
        ${isDrafted ? 'opacity-30 grayscale' : 'hover:bg-surface-container-highest group'} 
        ${!disabled && !isDrafted ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={() => {
        if (!disabled && !isDrafted) onPick(player.id);
      }}
    >
      {/* Team Accent Line */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-md"
        style={{ backgroundColor: accentColor }}
      />
      
      <div className="pl-2">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-on-surface font-headline text-lg group-hover:text-primary transition-colors">
            {player.name}
          </h3>
          <span className="text-xs font-label text-outline-variant font-bold ml-2">
            {player.team}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <span className="bg-surface-container-highest text-on-surface px-2 py-1 rounded-full text-[10px] uppercase font-label">
            {player.role}
          </span>
          {player.overseas && (
            <span className="bg-tertiary-container text-on-surface px-2 py-1 rounded-full text-[10px] uppercase font-label">
              Overseas
            </span>
          )}
          {player.top20 && (
            <span className="bg-secondary-container text-on-surface px-2 py-1 rounded-full text-[10px] uppercase font-label">
              Top 20
            </span>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-surface-variant pt-2 mt-2">
          <span className="text-xs text-on-surface-variant font-body">2025 Points</span>
          <span className="text-primary font-display text-xl">{player.total_points_2026}</span>
        </div>

        {/* Hover Action */}
        {!isDrafted && !disabled && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md glass-panel">
            <button className="bg-primary hover:bg-primary-container text-surface-container-lowest font-bold py-2 px-6 rounded-md font-body transition-colors">
              Pick Player
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
