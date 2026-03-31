'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const getLinkClasses = (path: string) => {
    return pathname === path 
      ? "flex items-center gap-4 px-6 py-4 bg-[#23262c] text-[#ffe792] border-l-4 border-[#ffe792] font-body font-semibold"
      : "flex items-center gap-4 px-6 py-4 text-gray-500 hover:bg-[#1d2025] font-body font-semibold";
  };

  return (
    <aside className="hidden lg:flex flex-col py-8 h-screen w-64 fixed left-0 top-0 bg-[#111318] shadow-2xl z-40 pt-24 border-r border-surface-variant/30">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-surface-container-highest flex items-center justify-center border-l-4 border-tertiary">
            <span className="material-symbols-outlined text-tertiary text-3xl font-icon">sports_cricket</span>
          </div>
          <div>
            <h3 className="font-headline font-bold text-white text-[15px] leading-tight uppercase">Kushagra Gupta</h3>
            <p className="text-[10px] text-on-surface-variant font-label uppercase mt-1">Commissioner</p>
          </div>
        </div>
        <button className="w-full py-3 bg-primary text-on-primary-fixed font-headline font-black uppercase tracking-widest text-[11px] rounded-md shadow-[0_0_20px_rgba(255,231,146,0.3)] hover:shadow-[0_0_30px_rgba(255,231,146,0.5)] transition-all">
          View Live Draft
        </button>
      </div>
      <nav className="flex-1 space-y-1">
        <Link href="/leaderboard" className={getLinkClasses('/leaderboard')}>
          <span className="material-symbols-outlined font-icon">leaderboard</span>
          <span>Leaderboard</span>
        </Link>
        <Link href="/draft" className={getLinkClasses('/draft')}>
          <span className="material-symbols-outlined font-icon">gavel</span>
          <span>Draft Room</span>
        </Link>
        <Link href="/squads" className={getLinkClasses('/squads')}>
          <span className="material-symbols-outlined font-icon">groups</span>
          <span>Squads</span>
        </Link>
        <Link href="/teams" className={getLinkClasses('/teams')}>
          <span className="material-symbols-outlined font-icon">shield</span>
          <span>Teams</span>
        </Link>
        <Link href="/rules" className={getLinkClasses('/rules')}>
          <span className="material-symbols-outlined font-icon">description</span>
          <span>Rules</span>
        </Link>
      </nav>
      <div className="mt-auto px-6 border-t border-outline-variant/10 pt-6">
        <button className="flex items-center gap-4 py-3 text-gray-500 hover:text-white transition-colors">
          <span className="material-symbols-outlined font-icon text-lg">settings</span>
          <span className="text-sm font-semibold">Settings</span>
        </button>
      </div>
    </aside>
  );
}
