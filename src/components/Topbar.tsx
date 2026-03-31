'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Topbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Leaderboard', path: '/leaderboard', icon: 'leaderboard' },
    { name: 'Draft Room', path: '/draft', icon: 'gavel' },
    { name: 'Squads', path: '/squads', icon: 'groups' },
    { name: 'Teams', path: '/teams', icon: 'shield' },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-6 h-20 bg-[#0c0e12] shadow-[0_8px_32px_rgba(0,0,0,0.5)] border-b border-surface-variant/50">
        <div className="flex items-center gap-4 md:gap-8">
          {/* Mobile Hamburger */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="lg:hidden p-2 text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors flex items-center justify-center border border-primary/20"
          >
            <span className="material-symbols-outlined font-icon">{isMobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
          
          <span className="text-xl md:text-2xl font-black text-[#ffe792] italic font-headline tracking-tight uppercase">DRAFT ARENA</span>
          
          {/* Desktop Links (Redundant with Sidebar, but keeping them hidden on small screens) */}
          <div className="hidden lg:flex gap-6 items-center ml-8">
            {navLinks.map(link => (
              <Link key={link.path} href={link.path} className={`font-headline font-bold uppercase tracking-tight transition-colors ${pathname === link.path ? 'text-[#ffe792] border-b-4 border-[#ffe792] pb-1' : 'text-gray-400 hover:text-white'}`}>
                {link.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button className="hidden sm:block p-2 text-on-surface-variant hover:bg-[#1d2025] rounded-full transition-all">
            <span className="material-symbols-outlined font-icon">notifications</span>
          </button>
          <div className="flex items-center gap-3 sm:pl-4 sm:border-l border-outline-variant/30">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-label uppercase text-on-surface-variant leading-none">Manager</p>
              <p className="font-headline font-bold text-sm tracking-tight text-white">K. SHARMA</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center lg:hidden">
              <span className="material-symbols-outlined text-primary text-sm font-icon">person</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed top-20 left-0 w-full h-[calc(100vh-80px)] bg-background z-40 border-t border-outline-variant/30 flex flex-col animate-in slide-in-from-left-4 duration-200">
          <nav className="flex flex-col p-6 gap-4">
            {navLinks.map(link => (
              <Link 
                key={link.path}
                href={link.path} 
                onClick={() => setIsMobileMenuOpen(false)} 
                className={`flex items-center gap-4 px-5 py-4 rounded-xl font-headline font-black uppercase tracking-widest text-lg border transition-colors ${pathname === link.path ? 'bg-primary/10 text-primary border-primary/30 shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]' : 'bg-surface-container-low text-on-surface-variant border-outline-variant/10 hover:border-outline-variant/30'}`}
              >
                <span className="material-symbols-outlined text-2xl font-icon">{link.icon}</span> 
                {link.name}
              </Link>
            ))}
          </nav>
          
          <div className="mt-auto p-6 border-t border-outline-variant/10 mb-8">
            <div className="flex items-center gap-4 px-5 py-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
              <div className="w-10 h-10 rounded-full bg-surface-container-highest border-2 border-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-primary font-icon">account_circle</span>
              </div>
              <div>
                <p className="text-[10px] font-label uppercase text-on-surface-variant leading-none tracking-widest">Active Commissioner</p>
                <p className="font-headline font-black text-white uppercase mt-1">K. SHARMA</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
