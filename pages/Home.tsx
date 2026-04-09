import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Calendar, TrendingUp, ChevronRight, Target, Flame, Zap, Bot, BarChart3, ClipboardList, X, Sparkles, Dumbbell, MessageCircle, LineChart } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Layout from '../components/Layout';
import NotificationBanner from '../components/NotificationBanner';
import { scheduleNextReminder, isReminderEnabled } from '../services/notifications';

// ── Clé localStorage pour mémoriser la fermeture ───────────
const TUTORIAL_DISMISSED_KEY = 'myrun_tutorial_dismissed';

// ── Bannière tutoriel ──────────────────────────────────────
const TutorialBanner: React.FC<{ variant: 'welcome' | 'dashboard' }> = ({ variant }) => {
  const [show, setShow] = useState(false);
  const { setPage } = useAppContext();

  useEffect(() => {
    const dismissed = localStorage.getItem(TUTORIAL_DISMISSED_KEY);
    if (!dismissed) {
      setShow(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(TUTORIAL_DISMISSED_KEY, 'true');
    setShow(false);
  };

  const tips = variant === 'welcome'
    ? [
        { icon: <ClipboardList size={15} className="text-cyan-400" />, text: 'Créez votre programme personnalisé en répondant à quelques questions', color: '#00d4ff' },
        { icon: <Bot size={15} className="text-green-400" />, text: 'Un coach IA est disponible 24h/24 pour répondre à vos questions', color: '#00ff87' },
        { icon: <Dumbbell size={15} className="text-orange-400" />, text: 'Chaque séance est détaillée avec échauffement, corps et retour au calme', color: '#fb923c' },
        { icon: <LineChart size={15} className="text-purple-400" />, text: 'Suivez vos statistiques et votre progression semaine après semaine', color: '#a78bfa' },
      ]
    : [
        { icon: <Target size={15} className="text-cyan-400" />, text: 'Cliquez sur une semaine pour voir le détail de vos séances', color: '#00d4ff' },
        { icon: <Sparkles size={15} className="text-green-400" />, text: 'Après chaque séance, donnez votre ressenti pour adapter le plan', color: '#00ff87' },
        { icon: <MessageCircle size={15} className="text-orange-400" />, text: 'Utilisez le Coach IA pour des conseils personnalisés en temps réel', color: '#fb923c' },
        { icon: <LineChart size={15} className="text-purple-400" />, text: 'Consultez vos statistiques pour visualiser votre progression', color: '#a78bfa' },
      ];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.97 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="rounded-2xl p-5 relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(0,255,135,0.04))',
            border: '1px solid rgba(0,212,255,0.15)',
          }}
        >
          {/* Ligne accent haut */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

          {/* Bouton fermer */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Fermer"
          >
            <X size={14} />
          </button>

          {/* Titre */}
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.2)' }}
            >
              <Sparkles size={14} className="text-green-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">
                {variant === 'welcome' ? 'Bienvenue sur MY RUN !' : 'Guide rapide'}
              </p>
              <p className="text-[10px] text-gray-500">
                {variant === 'welcome' ? 'Votre coach running personnel' : 'Pour bien démarrer votre entraînement'}
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className="flex flex-col gap-3 mb-4">
            {tips.map((tip, i) => (
              <motion.div
                key={i}
                className="flex items-start gap-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `${tip.color}12`, border: `1px solid ${tip.color}25` }}
                >
                  {tip.icon}
                </div>
                <p className="text-xs text-gray-300 leading-relaxed pt-1">{tip.text}</p>
              </motion.div>
            ))}
          </div>

          {/* Action */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleDismiss}
              className="text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
            >
              Ne plus afficher
            </button>
            {variant === 'dashboard' && (
              <button
                onClick={() => { setPage('statistics'); handleDismiss(); }}
                className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
              >
                Voir mes stats <ChevronRight size={12} />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

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
// PAGE WELCOME (sans programme) — avec notice d'accueil
// ─────────────────────────────────────────────────────────────

const StepCard: React.FC<{
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  delay: number;
}> = ({ step, icon, title, description, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="flex items-start gap-4"
  >
    <div className="relative flex-shrink-0">
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center"
        style={{
          background: `${color}15`,
          border: `1px solid ${color}30`,
        }}
      >
        {icon}
      </div>
      <span
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
        style={{ background: color, color: '#0a0a0f' }}
      >
        {step}
      </span>
    </div>
    <div className="flex-1 pt-1">
      <p className="text-white font-bold text-sm">{title}</p>
      <p className="text-gray-500 text-xs leading-relaxed mt-0.5">{description}</p>
    </div>
  </motion.div>
);

const FeaturePill: React.FC<{
  icon: React.ReactNode;
  label: string;
  color: string;
  delay: number;
}> = ({ icon, label, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.3 }}
    className="flex items-center gap-2 px-3 py-2 rounded-xl"
    style={{
      background: `${color}08`,
      border: `1px solid ${color}20`,
    }}
  >
    {icon}
    <span className="text-xs font-semibold text-gray-300">{label}</span>
  </motion.div>
);

const WelcomeView: React.FC = () => {
  const { setPage, user } = useAppContext();

  return (
    <Layout>
      <div className="flex flex-col gap-5 py-2">

        {/* Tutoriel de bienvenue */}
        <TutorialBanner variant="welcome" />

        {/* Hero compact */}
        <motion.div
          className="text-center pt-4 pb-2"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-4"
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
            Votre coach running personnel
          </motion.div>

          <motion.img
            src="/logo-myrun.png"
            alt="MY RUN"
            className="h-28 mx-auto mb-3"
            style={{ filter: 'drop-shadow(0 0 8px rgba(0,255,135,0.3)) drop-shadow(0 0 20px rgba(0,212,255,0.15))' }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
          />

          <motion.p
            className="text-gray-400 text-sm leading-relaxed max-w-xs mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Préparez votre{' '}
            <span className="text-cyan-400 font-semibold">5km</span>,{' '}
            <span className="text-green-400 font-semibold">10km</span>,{' '}
            <span className="text-orange-400 font-semibold">semi</span> ou{' '}
            <span className="text-red-400 font-semibold">marathon</span>{' '}
            avec un plan 100% personnalisé.
          </motion.p>
        </motion.div>

        {/* ── COMMENT ÇA MARCHE ── */}
        <GlassCard delay={0.4} glow="rgba(0,212,255,0.06)">
          <div className="p-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400/70 mb-4">
              Comment ça marche
            </p>
            <div className="flex flex-col gap-5">
              <StepCard
                step={1}
                icon={<ClipboardList size={18} className="text-cyan-400" />}
                title="Créez votre programme"
                description="Choisissez votre distance, votre niveau et votre date de course. On génère un plan adapté à votre VMA."
                color="#00d4ff"
                delay={0.5}
              />
              <StepCard
                step={2}
                icon={<Zap size={18} className="text-green-400" />}
                title="Suivez vos séances"
                description="Chaque semaine : échauffement, corps de séance et retour au calme détaillés. Cochez au fur et à mesure."
                color="#00ff87"
                delay={0.6}
              />
              <StepCard
                step={3}
                icon={<Target size={18} className="text-orange-400" />}
                title="Atteignez votre objectif"
                description="Le plan s'adapte à vos sensations. Suivez votre progression jusqu'au jour J."
                color="#fb923c"
                delay={0.7}
              />
            </div>
          </div>
        </GlassCard>

        {/* ── CE QUI EST INCLUS ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3 ml-1">
            Inclus dans votre plan
          </p>
          <div className="grid grid-cols-2 gap-2">
            <FeaturePill icon={<Calendar size={14} className="text-purple-400" />} label="Plan semaine par semaine" color="#a78bfa" delay={0.75} />
            <FeaturePill icon={<Bot size={14} className="text-green-400" />} label="Coach IA 24h/24" color="#00ff87" delay={0.8} />
            <FeaturePill icon={<BarChart3 size={14} className="text-cyan-400" />} label="Allures personnalisées" color="#00d4ff" delay={0.85} />
            <FeaturePill icon={<Flame size={14} className="text-orange-400" />} label="Suivi de progression" color="#fb923c" delay={0.9} />
          </div>
        </motion.div>

        {/* CTA */}
        <motion.button
          onClick={() => setPage('new-program')}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95 }}
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
          Créer mon programme gratuitement
        </motion.button>

        {/* Note de confiance */}
        <motion.p
          className="text-center text-gray-500 text-[11px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          Aucune carte bancaire requise pour commencer.
        </motion.p>
      </div>
    </Layout>
  );
};

// ─────────────────────────────────────────────────────────────
// TABLEAU DE BORD (avec programme)
// ─────────────────────────────────────────────────────────────
const DashboardView: React.FC = () => {
  const { program, user, setPage } = useAppContext();

  // Planifier les rappels de séance si activés
  useEffect(() => {
    if (program && isReminderEnabled()) {
      scheduleNextReminder(program);
    }
  }, [program]);

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

        {/* Bannière notifications */}
        <NotificationBanner />

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
              <p className="text-xs text-gray-500">
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
                <ChevronRight size={16} className="text-gray-500" />
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
              <p className="text-gray-500 text-[11px] mt-0.5">Avant la course</p>
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
              <p className="text-gray-500 text-[11px] mt-0.5">VMA (km/h)</p>
            </div>
          </GlassCard>
        </div>

        {/* Tutoriel guide rapide */}
        <TutorialBanner variant="dashboard" />

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
