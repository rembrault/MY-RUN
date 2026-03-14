import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Calendar, TrendingUp, ChevronRight, Target, Flame } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Layout from '../components/Layout';

// ── Compteur animé ──────────────────────────────────────────
const CountUp: React.FC<{ value: number; duration?: number }> = ({ value, duration = 800 }) => {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = value / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, value);
      setCurrent(Math.floor(start));
      if (start >= value) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{current}</>;
};

// ── Barre de progression animée ──────────────────────────────
const ProgressBar: React.FC<{ value: number; color?: string }> = ({
  value,
  color = 'linear-gradient(90deg, #00ff87, #00d4ff)',
}) => (
  <div className="relative h-1.5 bg-white/8 rounded-full overflow-hidden">
    <motion.div
      className="absolute inset-y-0 left-0 rounded-full"
      style={{ background: color }}
      initial={{ width: 0 }}
      animate={{ width: `${value}%` }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
    />
    {/* Shimmer */}
    <motion.div
      className="absolute inset-y-0 w-8 bg-white/30 skew-x-12"
      initial={{ left: '-10%' }}
      animate={{ left: '110%' }}
      transition={{ duration: 1.5, delay: 1.5, repeat: Infinity, repeatDelay: 3 }}
    />
  </div>
);

// ── Carte glassmorphism ───────────────────────────────────────
const GlassCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  glow?: string;
  delay?: number;
  onClick?: () => void;
}> = ({ children, className = '', glow, delay = 0, onClick }) => (
  <motion.div
    onClick={onClick}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    whileHover={onClick ? { y: -2, scale: 1.01 } : {}}
    whileTap={onClick ? { scale: 0.99 } : {}}
    className={`relative rounded-2xl overflow-hidden ${onClick ? 'cursor-pointer' : ''} ${className}`}
    style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      backdropFilter: 'blur(12px)',
      boxShadow: glow ? `0 4px 32px ${glow}` : '0 4px 24px rgba(0,0,0,0.3)',
    }}
  >
    {children}
  </motion.div>
);

// ─────────────────────────────────────────────────────────────
// PAGE WELCOME (sans programme)
// ─────────────────────────────────────────────────────────────
const WelcomeView: React.FC = () => {
  const { setPage, user } = useAppContext();

  return (
    <Layout>
      <div className="flex flex-col gap-6 py-4">
        {/* Hero */}
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-6"
            style={{
              background: 'rgba(0,255,135,0.08)',
              border: '1px solid rgba(0,255,135,0.2)',
              color: '#00ff87',
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Programmes sur mesure
          </motion.div>

          {/* Logo animé */}
          <motion.h1
            className="text-6xl font-black tracking-widest mb-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          >
            <span
              style={{
                background: 'linear-gradient(90deg, #00d4ff, #00ff87, #00d4ff)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              MYRUN
            </span>
          </motion.h1>

          <motion.p
            className="text-gray-400 text-base leading-relaxed max-w-sm mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Plans d'entraînement sur mesure pour le{' '}
            <span className="text-cyan-400 font-semibold">10km</span>,{' '}
            <span className="text-green-400 font-semibold">semi</span> et{' '}
            <span className="text-orange-400 font-semibold">marathon</span>.
          </motion.p>
        </motion.div>

        {/* Feature card */}
        <GlassCard delay={0.4} glow="rgba(0,255,135,0.08)">
          <div className="p-5 flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}
            >
              <Target size={18} className="text-cyan-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-1">Conçu par des experts</p>
              <p className="text-gray-500 text-xs leading-relaxed">
                Programmes basés sur votre VMA personnelle, adaptés semaine après semaine.
              </p>
            </div>
          </div>
        </GlassCard>

        {/* CTA */}
        <motion.button
          onClick={() => setPage('new-program')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          className="w-full py-5 rounded-2xl font-black text-black text-base tracking-wide relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #00ff87, #00d4ff)',
            boxShadow: '0 0 40px rgba(0,255,135,0.35)',
          }}
        >
          <motion.div
            className="absolute inset-0 bg-white/20"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.5 }}
          />
          + Créer mon programme
        </motion.button>
      </div>
    </Layout>
  );
};

// ─────────────────────────────────────────────────────────────
// TABLEAU DE BORD (avec programme)
// ─────────────────────────────────────────────────────────────
const DashboardView: React.FC = () => {
  const { program, user, setPage } = useAppContext();
  if (!program) return null;

  const completedSessions = program.weeks.flatMap(w => w.sessions).filter(s => s.completed).length;
  const totalSessions = program.weeks.flatMap(w => w.sessions).filter(s => s.type !== 'Repos').length;
  const progressPct = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;

  const today = new Date();
  const raceDate = new Date(program.raceDate);
  const daysLeft = Math.max(0, Math.ceil((raceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  // Prochaine séance
  const nextSession = program.weeks
    .flatMap(w => w.sessions)
    .find(s => !s.completed && s.type !== 'Repos');

  // Semaine courante
  const currentWeekIndex = program.weeks.findIndex(w =>
    w.sessions.some(s => !s.completed && s.type !== 'Repos')
  );

  const distanceLabels: Record<string, string> = {
    '5k': '5 KM', '10k': '10 KM', 'semi-marathon': 'Semi', 'marathon': 'Marathon',
  };

  return (
    <Layout>
      <div className="flex flex-col gap-5">

        {/* Salutation */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-gray-500 text-sm">
            {today.getHours() < 12 ? 'Bonjour' : today.getHours() < 18 ? 'Bon après-midi' : 'Bonsoir'},{' '}
            <span className="text-white font-semibold">{user.name?.split(' ')[0] || 'Athlète'}</span> !
          </p>
          <h1 className="text-2xl font-black text-white mt-0.5">Tableau de bord</h1>
        </motion.div>

        {/* Carte programme principal */}
        <GlassCard
          delay={0.1}
          glow="rgba(0,212,255,0.1)"
          onClick={() => setPage('my-programs')}
        >
          {/* Gradient top */}
          <div
            className="absolute top-0 left-0 right-0 h-32 opacity-30"
            style={{ background: 'linear-gradient(180deg, rgba(0,212,255,0.15), transparent)' }}
          />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

          <div className="relative p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span
                  className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-2"
                  style={{
                    background: 'rgba(0,255,135,0.1)',
                    border: '1px solid rgba(0,255,135,0.2)',
                    color: '#00ff87',
                  }}
                >
                  <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse" />
                  En cours
                </span>
                <p className="text-white font-bold text-base">
                  {distanceLabels[program.distance] || program.distance}
                  {program.timeObjective && program.timeObjective !== 'Finir' && (
                    <span className="text-gray-400 font-normal text-sm ml-2">
                      · Objectif {program.timeObjective}
                    </span>
                  )}
                </p>
              </div>
              <motion.div
                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
              >
                <Target size={16} className="text-cyan-400" />
              </motion.div>
            </div>

            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-500">Progression</span>
                <span className="text-white font-bold">
                  <CountUp value={progressPct} />%
                </span>
              </div>
              <ProgressBar value={progressPct} />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-600">
                {completedSessions}/{totalSessions} séances complétées
              </p>
              <div className="flex items-center gap-1 text-cyan-400 text-xs font-semibold">
                Voir le détail <ChevronRight size={12} />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Prochaine séance */}
        {nextSession && (
          <GlassCard
            delay={0.2}
            onClick={() => currentWeekIndex >= 0 && setPage(`week-${currentWeekIndex}` as any)}
          >
            <div className="p-5">
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-3"
                style={{ color: 'rgba(0,255,135,0.6)' }}
              >
                Prochaine séance
              </p>
              <div className="flex items-center gap-4">
                <motion.div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(251,146,60,0.15), rgba(251,146,60,0.05))',
                    border: '1px solid rgba(251,146,60,0.25)',
                  }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Play size={18} className="text-orange-400 ml-0.5" />
                </motion.div>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">{nextSession.title}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {nextSession.type} · {nextSession.duration} min
                  </p>
                </div>
                <ChevronRight size={16} className="text-gray-600" />
              </div>
            </div>
          </GlassCard>
        )}

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <GlassCard delay={0.3}>
            <div className="p-4 text-center">
              <motion.div
                className="w-8 h-8 rounded-xl mx-auto mb-2 flex items-center justify-center"
                style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)' }}
              >
                <Calendar size={14} className="text-purple-400" />
              </motion.div>
              <p className="text-2xl font-black text-white">
                J-<CountUp value={daysLeft} />
              </p>
              <p className="text-gray-600 text-[11px] mt-0.5">Avant la course</p>
            </div>
          </GlassCard>

          <GlassCard delay={0.35}>
            <div className="p-4 text-center">
              <motion.div
                className="w-8 h-8 rounded-xl mx-auto mb-2 flex items-center justify-center"
                style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.2)' }}
              >
                <TrendingUp size={14} className="text-orange-400" />
              </motion.div>
              <p className="text-2xl font-black text-white">
                {program.vma || user.vma || '—'}
              </p>
              <p className="text-gray-600 text-[11px] mt-0.5">VMA (km/h)</p>
            </div>
          </GlassCard>
        </div>

        {/* Semaines complétées */}
        {completedSessions > 0 && (
          <GlassCard delay={0.4}>
            <div className="p-4 flex items-center gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.2)' }}
              >
                <Flame size={16} className="text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-white font-semibold text-sm">Belle progression !</p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {completedSessions} séance{completedSessions > 1 ? 's' : ''} complétée{completedSessions > 1 ? 's' : ''}
                </p>
              </div>
              <div
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  background: 'rgba(0,255,135,0.1)',
                  border: '1px solid rgba(0,255,135,0.2)',
                  color: '#00ff87',
                }}
              >
                +{progressPct}%
              </div>
            </div>
          </GlassCard>
        )}
      </div>
    </Layout>
  );
};

// ─────────────────────────────────────────────────────────────
// HOME — Routeur
// ─────────────────────────────────────────────────────────────
const Home: React.FC = () => {
  const { program } = useAppContext();
  return program ? <DashboardView /> : <WelcomeView />;
};

export default Home;
