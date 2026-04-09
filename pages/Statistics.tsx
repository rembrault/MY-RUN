import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart,
} from 'recharts';
import { TrendingUp, Flame, Heart, Footprints, Clock, CheckCircle, ChevronRight } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Layout from '../components/Layout';
import { Program, Session, SessionFeedback } from '../types';

// ── Helpers ─────────────────────────────────────────────────

const parseDuration = (dur?: string): number => {
  if (!dur) return 0;
  const parts = dur.split(':').map(Number);
  return parts.length === 2 ? parts[0] + parts[1] / 60 : parts[0] * 60 + parts[1] + (parts[2] || 0) / 60;
};

const getAllSessions = (program: Program): Session[] =>
  program.weeks.flatMap(w => w.sessions.filter(s => s.type !== 'Repos'));

const getCompletedSessions = (program: Program): Session[] =>
  getAllSessions(program).filter(s => s.completed);

// ── Stat Card ───────────────────────────────────────────────

const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  color: string;
  delay: number;
}> = ({ icon, label, value, sub, color, delay }) => (
  <motion.div
    className="rounded-2xl p-4"
    style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
    }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
  >
    <div className="flex items-center gap-2 mb-2">
      <div className="p-1.5 rounded-lg" style={{ background: `${color}15` }}>
        {icon}
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{label}</span>
    </div>
    <p className="text-2xl font-black text-white">{value}</p>
    {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
  </motion.div>
);

// ── Chart Card wrapper ──────────────────────────────────────

const ChartCard: React.FC<{
  title: string;
  children: React.ReactNode;
  delay: number;
}> = ({ title, children, delay }) => (
  <motion.div
    className="rounded-2xl p-5"
    style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
    }}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
  >
    <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400/70 mb-4">{title}</p>
    {children}
  </motion.div>
);

// ── Custom Tooltip ──────────────────────────────────────────

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2 text-xs"
      style={{
        background: 'rgba(10,10,15,0.95)',
        border: '1px solid rgba(255,255,255,0.15)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      }}
    >
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="font-bold">
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
        </p>
      ))}
    </div>
  );
};

// ── Sensation label & colors ────────────────────────────────

const SENSATION_MAP: Record<string, { label: string; color: string; emoji: string }> = {
  easy: { label: 'Facile', color: '#00ff87', emoji: '😊' },
  medium: { label: 'Correct', color: '#f59e0b', emoji: '😐' },
  hard: { label: 'Difficile', color: '#ef4444', emoji: '😤' },
};

// ═════════════════════════════════════════════════════════════
// PAGE STATISTIQUES
// ═════════════════════════════════════════════════════════════

const Statistics: React.FC = () => {
  const { program, setPage } = useAppContext();

  const stats = useMemo(() => {
    if (!program) return null;

    const all = getAllSessions(program);
    const completed = getCompletedSessions(program);
    const feedbacks = completed.filter(s => s.feedback).map(s => s.feedback!);

    // ── Global stats ──
    const totalKm = completed.reduce((sum, s) => {
      const fbDist = s.feedback?.distance;
      return sum + (fbDist || s.distance || 0);
    }, 0);

    const totalMinutes = completed.reduce((sum, s) => {
      const fbDur = parseDuration(s.feedback?.duration);
      return sum + (fbDur || s.duration || 0);
    }, 0);

    const totalElevation = feedbacks.reduce((sum, f) => sum + (f.elevation || 0), 0);

    const avgHR = feedbacks.filter(f => f.avgHeartRate).length > 0
      ? feedbacks.reduce((sum, f) => sum + (f.avgHeartRate || 0), 0) / feedbacks.filter(f => f.avgHeartRate).length
      : 0;

    // ── Weekly volume chart data ──
    const weeklyData = program.weeks.map(w => {
      const wCompleted = w.sessions.filter(s => s.completed && s.type !== 'Repos');
      const km = wCompleted.reduce((sum, s) => sum + (s.feedback?.distance || s.distance || 0), 0);
      const mins = wCompleted.reduce((sum, s) => sum + (parseDuration(s.feedback?.duration) || s.duration || 0), 0);
      return {
        name: `S${w.weekNumber}`,
        km: Math.round(km * 10) / 10,
        minutes: Math.round(mins),
        sessions: wCompleted.length,
        planned: w.totalKm,
      };
    });

    // ── Sensation distribution ──
    const sensationCounts = { easy: 0, medium: 0, hard: 0 };
    feedbacks.forEach(f => {
      if (f.sensation in sensationCounts) sensationCounts[f.sensation as keyof typeof sensationCounts]++;
    });
    const sensationData = Object.entries(sensationCounts)
      .filter(([, v]) => v > 0)
      .map(([key, value]) => ({
        name: SENSATION_MAP[key].label,
        value,
        color: SENSATION_MAP[key].color,
        emoji: SENSATION_MAP[key].emoji,
      }));

    // ── Heart rate evolution ──
    const hrData: { name: string; bpm: number }[] = [];
    program.weeks.forEach(w => {
      w.sessions.forEach(s => {
        if (s.completed && s.feedback?.avgHeartRate) {
          hrData.push({
            name: `S${w.weekNumber}`,
            bpm: s.feedback.avgHeartRate,
          });
        }
      });
    });

    // ── Session type breakdown ──
    const typeCount: Record<string, number> = {};
    completed.forEach(s => {
      typeCount[s.type] = (typeCount[s.type] || 0) + 1;
    });
    const typeData = Object.entries(typeCount).map(([name, value]) => ({ name, value }));

    const TYPE_COLORS: Record<string, string> = {
      'Endurance': '#00d4ff',
      'Fractionné': '#ff6b6b',
      'Sortie longue': '#00ff87',
      'Course à rythme': '#f59e0b',
      'Côtes': '#a855f7',
    };

    return {
      all, completed, feedbacks,
      totalKm, totalMinutes, totalElevation, avgHR,
      weeklyData, sensationData, hrData, typeData, typeCount, TYPE_COLORS,
      completionRate: all.length > 0 ? Math.round((completed.length / all.length) * 100) : 0,
    };
  }, [program]);

  // ── Pas de programme ──
  if (!program || !stats) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <TrendingUp size={48} className="text-gray-500 mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Pas encore de statistiques</h2>
          <p className="text-gray-500 text-sm mb-6 max-w-xs">
            Créez un programme d'entraînement et complétez des séances pour voir vos statistiques de progression.
          </p>
          <button
            onClick={() => setPage('new-program')}
            className="px-6 py-3 rounded-xl font-bold text-sm text-black"
            style={{ background: 'linear-gradient(135deg, #00ff87, #00d4ff)' }}
          >
            Créer mon programme
          </button>
        </div>
      </Layout>
    );
  }

  const { completed, totalKm, totalMinutes, totalElevation, avgHR, completionRate } = stats;
  const hours = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);

  return (
    <Layout>
      <div className="flex flex-col gap-5 py-2">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-black text-white">Statistiques</h1>
          <p className="text-xs text-gray-500 mt-1">
            {program.raceName || program.distance} — {program.totalWeeks} semaines
          </p>
        </motion.div>

        {/* ── Progression globale ── */}
        <motion.div
          className="rounded-2xl p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,255,135,0.08))',
            border: '1px solid rgba(0,255,135,0.15)',
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-green-400/80">Progression</span>
            <span className="text-2xl font-black text-white">{completionRate}%</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #00d4ff, #00ff87)' }}
              initial={{ width: 0 }}
              animate={{ width: `${completionRate}%` }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {completed.length} séance{completed.length > 1 ? 's' : ''} sur {stats.all.length}
          </p>
        </motion.div>

        {/* ── Stats globales ── */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon={<Footprints size={16} className="text-cyan-400" />}
            label="Distance"
            value={`${totalKm.toFixed(1)} km`}
            delay={0.2}
            color="#00d4ff"
          />
          <StatCard
            icon={<Clock size={16} className="text-green-400" />}
            label="Temps total"
            value={hours > 0 ? `${hours}h${mins.toString().padStart(2, '0')}` : `${mins} min`}
            delay={0.25}
            color="#00ff87"
          />
          <StatCard
            icon={<Heart size={16} className="text-red-400" />}
            label="FC moyenne"
            value={avgHR > 0 ? `${Math.round(avgHR)} bpm` : '—'}
            delay={0.3}
            color="#ef4444"
          />
          <StatCard
            icon={<Flame size={16} className="text-orange-400" />}
            label="Dénivelé"
            value={totalElevation > 0 ? `${totalElevation} m` : '—'}
            delay={0.35}
            color="#f59e0b"
          />
        </div>

        {/* ── Volume par semaine (bar chart) ── */}
        <ChartCard title="Volume par semaine (km)" delay={0.4}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.weeklyData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} width={30} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="planned" name="Prévu" fill="rgba(0,212,255,0.15)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="km" name="Réalisé" fill="#00ff87" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 justify-center">
            <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <span className="w-2.5 h-2.5 rounded-sm" style={{ background: 'rgba(0,212,255,0.3)' }} /> Prévu
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <span className="w-2.5 h-2.5 rounded-sm bg-green-400" /> Réalisé
            </span>
          </div>
        </ChartCard>

        {/* ── Sensations (pie chart) ── */}
        {stats.sensationData.length > 0 && (
          <ChartCard title="Ressenti après séances" delay={0.5}>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie
                    data={stats.sensationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={55}
                    paddingAngle={3}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {stats.sensationData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-2">
                {stats.sensationData.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-lg">{s.emoji}</span>
                    <div>
                      <p className="text-xs font-bold text-white">{s.name}</p>
                      <p className="text-[10px] text-gray-500">{s.value} séance{s.value > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        )}

        {/* ── Fréquence cardiaque (line chart) ── */}
        {stats.hrData.length > 2 && (
          <ChartCard title="Évolution fréquence cardiaque" delay={0.6}>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={stats.hrData}>
                <defs>
                  <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} width={35} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="bpm" name="BPM" stroke="#ef4444" fill="url(#hrGrad)" strokeWidth={2} dot={{ r: 3, fill: '#ef4444' }} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* ── Types de séances (horizontal bars) ── */}
        {stats.typeData.length > 0 && (
          <ChartCard title="Répartition des séances" delay={0.7}>
            <div className="flex flex-col gap-3">
              {stats.typeData.sort((a, b) => b.value - a.value).map((t, i) => {
                const color = stats.TYPE_COLORS[t.name] || '#6b7280';
                const pct = Math.round((t.value / completed.length) * 100);
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-300">{t.name}</span>
                      <span className="text-xs text-gray-500">{t.value} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.8 + i * 0.1 }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        )}

        {/* ── Spacer bottom ── */}
        <div className="h-4" />
      </div>
    </Layout>
  );
};

export default Statistics;
