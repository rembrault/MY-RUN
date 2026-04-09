import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { Home, User, Gauge, ScrollText, Bot, Zap, BarChart3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { Page } from '../types';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

// ── Particules d'ambiance ────────────────────────────────────
const AmbientParticles: React.FC = () => {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 4,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-green-400/20"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{
            opacity: [0, 0.6, 0],
            y: [0, -30, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

// ── Logo animé avec gradient ─────────────────────────────────
const AnimatedLogo: React.FC = () => {
  return (
    <motion.div
      className="mb-10 relative"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center gap-2 mb-1">
        <img
            src="/logo-myrun.png"
            alt="MY RUN"
            className="h-10"
            style={{ filter: 'drop-shadow(0 0 4px rgba(0,255,135,0.25)) drop-shadow(0 0 10px rgba(0,212,255,0.12))' }}
        />
      </div>
      <p className="text-gray-500 text-xs tracking-wider uppercase ml-1">Votre coach running</p>
    </motion.div>
  );
};

// ── Navigation latérale desktop ──────────────────────────────
const DesktopNav: React.FC = () => {
  const { page, setPage, program } = useAppContext();

  const navItems = [
    { id: 'home',           icon: Home,       label: 'Tableau de bord', color: 'cyan' },
    { id: 'my-programs',    icon: ScrollText, label: 'Mon programme',   color: 'green' },
    { id: 'coach-ia',       icon: Bot,        label: 'Coach IA',        color: 'green', badge: 'IA' },
    { id: 'statistics',     icon: BarChart3,  label: 'Statistiques',    color: 'cyan' },
    { id: 'vma-calculator', icon: Gauge,      label: 'Calculateur VMA', color: 'cyan' },
    { id: 'profile',        icon: User,       label: 'Mon profil',      color: 'green' },
  ];

  const handleNav = (targetPage: Page) => {
    if (!program && targetPage === 'home') setPage('welcome');
    else setPage(targetPage);
  };

  const activePage = page === 'welcome' ? 'home' : page;

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item, i) => {
        const isActive =
          activePage === item.id ||
          (item.id === 'my-programs' && page.toString().startsWith('week-'));

        return (
          <motion.button
            key={item.id}
            onClick={() => handleNav(item.id as Page)}
            className="relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors duration-200 text-left group overflow-hidden"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.97 }}
          >
            {/* Fond actif */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,255,135,0.12))',
                    border: '1px solid rgba(0,255,135,0.2)',
                  }}
                  layoutId="activeNav"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </AnimatePresence>

            {/* Hover glow */}
            {!isActive && (
              <div className="absolute inset-0 rounded-xl bg-white/0 group-hover:bg-white/4 transition-colors duration-200" />
            )}

            <item.icon
              size={16}
              className={`flex-shrink-0 transition-colors duration-200 ${
                isActive ? 'text-green-400' : 'text-gray-500 group-hover:text-gray-300'
              }`}
            />
            <span className={`transition-colors duration-200 ${
              isActive ? 'text-white font-semibold' : 'text-gray-500 group-hover:text-gray-300'
            }`}>
              {item.label}
            </span>
            {item.badge && (
              <span className="ml-auto text-[9px] font-bold bg-green-400/15 text-green-400 px-1.5 py-0.5 rounded-full border border-green-400/20">
                {item.badge}
              </span>
            )}
          </motion.button>
        );
      })}
    </nav>
  );
};

// ── Conseil du jour animé ────────────────────────────────────
const DailyTip: React.FC = () => {
  const tips = [
    "L'échauffement est essentiel pour prévenir les blessures.",
    "Hydratez-vous avant, pendant et après chaque séance.",
    "Le sommeil est votre meilleur allié pour progresser.",
    "La régularité prime sur l'intensité pour un débutant.",
  ];
  const tip = tips[Math.floor(Date.now() / 86400000) % tips.length];

  return (
    <motion.div
      className="mt-auto relative overflow-hidden rounded-2xl p-4"
      style={{
        background: 'linear-gradient(135deg, rgba(0,255,135,0.06), rgba(0,212,255,0.04))',
        border: '1px solid rgba(0,255,135,0.15)',
      }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <motion.div
        className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-green-400/40 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      />
      <p className="text-green-400 text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        Conseil du jour
      </p>
      <p className="text-gray-500 text-xs leading-relaxed">{tip}</p>
    </motion.div>
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
      ═══════════════════════════════════ */}
      <div className="flex md:hidden items-center justify-center min-h-screen p-2">
        <div className="relative w-full max-w-md h-[95vh] bg-[#0a0a0f] rounded-3xl border border-white/8 flex flex-col overflow-hidden shadow-2xl">
          {/* Glow mobile */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400/30 to-transparent" />
          <div className={`absolute top-0 right-2 w-0.5 h-full bg-gradient-to-b from-green-400/0 via-green-400/60 to-green-400/0 rounded-full z-0 pointer-events-none transition-opacity duration-500 ${isScrolling ? 'opacity-100' : 'opacity-0'}`} />
          <main ref={mainRef} className="flex-grow overflow-y-auto p-4 z-10 scrollbar-hide">
            {children}
          </main>
          {showBottomNav && <BottomNav />}
        </div>
      </div>

      {/* ═══════════════════════════════════
          VUE DESKTOP (≥ 768px)
      ═══════════════════════════════════ */}
      <div className="hidden md:flex min-h-screen">

        {/* ── Sidebar fixe ── */}
        <aside className="w-64 bg-[#080810] border-r border-white/6 flex flex-col p-6 fixed h-full z-20 overflow-hidden">
          {/* Particules d'ambiance */}
          <AmbientParticles />

          {/* Glow latéral */}
          <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-green-400/20 to-transparent" />
          <div className="absolute top-20 right-0 w-32 h-32 bg-green-400/3 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-0 w-24 h-24 bg-cyan-400/3 rounded-full blur-3xl" />

          <div className="relative z-10 flex flex-col h-full">
            <AnimatedLogo />
            <DesktopNav />
            <DailyTip />
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
