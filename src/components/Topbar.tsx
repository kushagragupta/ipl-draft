'use client';
import Link from 'next/link';

export default function Topbar() {
  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-20 bg-[#0c0e12] shadow-[0_8px_32px_rgba(0,0,0,0.5)] border-b border-surface-variant/50">
      <div className="flex items-center gap-8">
        <span className="text-2xl font-black text-[#ffe792] italic font-headline tracking-tight uppercase">DRAFT ARENA</span>
        <div className="hidden md:flex gap-6 items-center">
          <Link href="/draft" className="font-headline font-bold uppercase tracking-tight text-gray-400 hover:text-white transition-colors">Draft Room</Link>
          <Link href="/squads" className="font-headline font-bold uppercase tracking-tight text-gray-400 hover:text-white transition-colors">Squads</Link>
          <Link href="/teams" className="font-headline font-bold uppercase tracking-tight text-[#ffe792] border-b-4 border-[#ffe792] pb-1">Teams</Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-on-surface-variant hover:bg-[#1d2025] rounded-full transition-all">
          <span className="material-symbols-outlined font-icon">notifications</span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-outline-variant/30">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-label uppercase text-on-surface-variant leading-none">Manager</p>
            <p className="font-headline font-bold text-sm tracking-tight text-white">K. SHARMA</p>
          </div>
        </div>
      </div>
    </nav>
  );
}
