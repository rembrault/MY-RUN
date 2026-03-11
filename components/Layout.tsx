import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { Home, User, Gauge, ScrollText } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Page } from '../types';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

// ── Navigation latérale desktop ──────────────────────────────
const DesktopNav: React.FC = () => {
  const { page, setPage, program } = useAppContext();

  const navItems = [
    { id: 'home',           icon: Home,       label: 'Tableau de bord' },
    { id: 'my-programs',    icon: ScrollText, label: 'Mon programme'   },
    { id: 'vma-calculator', icon: Gauge,      label: 'Calculateur VMA' },
    { id: 'profile',        icon: User,       label: 'Mon profil'      },
  ];

  const handleNav = (targetPage: Page) => {
    if (!program && targetPage === 'home') setPage('welcome');
    else setPage(targetPage);
  };

  const activePage = page === 'welcome' ? 'home' : page;

  return (
    <nav className="flex flex-col gap-2">
      {navItems.map(item => {
        const isActive =
          activePage === item.id ||
          (item.id === 'my-programs' && page.toString().startsWith('week-'));
        return (
          <button
            key={item.id}
            onClick={() => handleNav(item.id as Page)}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 text-left
              ${isActive
                ? 'bg-green-400/10 text-green-400 border border-green-400/20'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <item.icon size={18} />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
};

// ── Layout principal ─────────────────────────────────────────
const Layout: React.FC<LayoutProps> = ({ children, showBottomNav = true }) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<number | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = window.setTimeout(() => setIsScrolling(false), 1500);
  };

  useEffect(() => {
    const mainEl = mainRef.current;
    const timeoutId = scrollTimeoutRef.current;
    if (mainEl) mainEl.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      if (mainEl) mainEl.removeEventListener('scroll', handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="futuristic-grid min-h-screen w-full text-white">

      {/* ═══════════════════════════════════
          VUE MOBILE (< 768px)
          Carte téléphone centrée — identique à avant
      ═══════════════════════════════════ */}
      <div className="flex md:hidden items-center justify-center min-h-screen p-2">
        <div className="relative w-full max-w-md h-[95vh] bg-[#111115] rounded-3xl border border-white/10 flex flex-col overflow-hidden">
          {/* Indicateur de scroll */}
          <div className={`absolute top-0 right-2 w-1 h-full bg-[#00ff87]/80 rounded-full z-0 pointer-events-none transition-opacity duration-300 ${isScrolling ? 'opacity-80' : 'opacity-0'}`} />
          <main ref={mainRef} className="flex-grow overflow-y-auto p-4 z-10 scrollbar-hide">
            {children}
          </main>
          {showBottomNav && <BottomNav />}
        </div>
      </div>

      {/* ═══════════════════════════════════
          VUE DESKTOP (≥ 768px)
          Sidebar gauche + contenu pleine largeur
      ═══════════════════════════════════ */}
      <div className="hidden md:flex min-h-screen">

        {/* ── Sidebar fixe ── */}
        <aside className="w-64 bg-[#0d0d12] border-r border-white/10 flex flex-col p-6 fixed h-full z-20">

          {/* Logo */}
          <div className="mb-10">
            <h1 className="text-3xl font-black tracking-widest">
              <span className="text-[#00d4ff]" style={{ textShadow: '0 0 8px #00d4ff' }}>MY</span>
              <span className="text-[#00ff87]" style={{ textShadow: '0 0 8px #00ff87' }}>RUN</span>
            </h1>
            <p className="text-gray-500 text-xs mt-1">Votre coach running</p>
          </div>

          {/* Navigation */}
          <DesktopNav />

          {/* Encart conseil */}
          <div className="mt-auto">
            <div className="bg-green-400/10 border border-green-400/20 rounded-2xl p-4">
              <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-1">Conseil du jour</p>
              <p className="text-gray-400 text-xs leading-relaxed">L'échauffement est essentiel pour prévenir les blessures et optimiser vos performances.</p>
            </div>
          </div>
        </aside>

        {/* ── Contenu principal ── */}
        <main ref={mainRef} className="flex-1 ml-64 overflow-y-auto scrollbar-hide">
          <div className="max-w-3xl mx-auto px-8 py-10">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
};

export default Layout;
