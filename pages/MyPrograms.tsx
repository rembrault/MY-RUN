import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, ChevronRight, Trash2, Check, Trophy, Zap, Camera } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Layout from '../components/Layout';

const MyPrograms: React.FC = () => {
  const { program, isPaid, deleteProgram, setPage } = useAppContext();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!program) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <p className="text-gray-500 text-sm">Aucun programme actif.</p>
          <motion.button
            onClick={() => setPage('new-program')}
            whileTap={{ scale: 0.97 }}
            className="px-6 py-3 rounded-2xl font-bold text-black text-sm"
            style={{ background: 'linear-gradient(135deg, #00ff87, #00d4ff)' }}
          >
            + Créer un programme
          </motion.button>
        </div>
      </Layout>
    );
  }

  const completedSessions = program.weeks
    .flatMap(w => w.sessions)
    .filter(s => s.completed).length;
  const totalSessions = program.weeks
    .flatMap(w => w.sessions)
    .filter(s => s.type !== 'Repos').length;
  const progressPct = totalSessions > 0
    ? Math.round((completedSessions / totalSessions) * 100)
    : 0;

  const distanceLabels: Record<string, string> = {
    '5k': '5 KM', '10k': '10 KM', 'semi-marathon': 'Semi-Marathon', 'marathon': 'Marathon',
  };

  const isConditioning = (program as any).isConditioningProgram;
  const isIntensive = (program as any).isIntensiveProgram;

  const headerColor = isConditioning
    ? { from: '#22c55e', to: '#10b981' }
    : isIntensive
    ? { from: '#f59e0b', to: '#ef4444' }
    : { from: '#00d4ff', to: '#00ff87' };

  return (
    <Layout>
      <div className="flex flex-col gap-5">

        {/* Titre */}
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-black text-white">Mes Programmes</h1>
          <motion.button
            onClick={() => setShowDeleteConfirm(true)}
            whileTap={{ scale: 0.9 }}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <Trash2 size={15} className="text-red-400" />
          </motion.button>
        </motion.div>

        {/* Hero card programme */}
        <motion.div
          className="relative rounded-3xl overflow-hidden"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{
            background: `linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6))`,
            border: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          {/* Fond dégradé */}
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${headerColor.from}15, ${headerColor.to}08)`,
            }}
          />
          <div
            className="absolute top-0 left-0 right-0 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${headerColor.from}60, transparent)` }}
          />

          {/* Image placeholder */}
          <div className="relative h-32 flex items-center justify-center">
            <motion.div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${headerColor.from}20, ${headerColor.to}10)`,
                border: `1px solid ${headerColor.from}30`,
              }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Trophy size={24} style={{ color: headerColor.from }} />
            </motion.div>
            <div className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-black/40 flex items-center justify-center border border-white/10">
              <Camera size={13} className="text-gray-500" />
            </div>
          </div>

          {/* Info */}
          <div className="relative px-5 pb-5">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
                style={{
                  background: `${headerColor.from}15`,
                  border: `1px solid ${headerColor.from}30`,
                  color: headerColor.from,
                }}
              >
                {isConditioning ? '🌿 Mise en Forme' : isIntensive ? '⚡ Intensif' : '🏆 En Cours'}
              </span>
            </div>
            <p className="text-white font-bold text-base">
              {distanceLabels[program.distance] || program.distance}
              {' · '}{program.totalWeeks} semaines
            </p>

            {/* Barre de progression */}
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-gray-500">Progression globale</span>
                <span className="font-bold" style={{ color: headerColor.from }}>{progressPct}%</span>
              </div>
              <div className="h-1.5 bg-white/8 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${headerColor.from}, ${headerColor.to})` }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Liste des semaines */}
        <div className="flex flex-col gap-2">
          {program.weeks.map((week, index) => {
            const isFree = (week as any).isFree;
            const isLocked = !isFree && !isPaid;
            const weekCompleted = week.sessions
              .filter(s => s.type !== 'Repos')
              .every(s => s.completed);
            const weekStarted = week.sessions.some(s => s.completed);
            const sessionsDone = week.sessions.filter(s => s.completed).length;
            const sessionsTotal = week.sessions.filter(s => s.type !== 'Repos').length;

            const statusColor = weekCompleted
              ? '#00ff87'
              : weekStarted
              ? '#00d4ff'
              : isFree
              ? '#fbbf24'
              : isLocked
              ? 'rgba(255,255,255,0.2)'
              : 'rgba(255,255,255,0.5)';

            return (
              <motion.button
                key={week.weekNumber}
                onClick={() => !isLocked && setPage(`week-${index}` as any)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.04, duration: 0.4 }}
                whileTap={!isLocked ? { scale: 0.98 } : {}}
                whileHover={!isLocked ? { x: 3 } : {}}
                className="relative w-full text-left rounded-2xl p-4 group transition-colors duration-200 overflow-hidden"
                style={{
                  background: weekCompleted
                    ? 'rgba(0,255,135,0.04)'
                    : isLocked
                    ? 'rgba(255,255,255,0.01)'
                    : 'rgba(255,255,255,0.03)',
                  border: weekCompleted
                    ? '1px solid rgba(0,255,135,0.15)'
                    : isFree
                    ? '1px solid rgba(251,191,36,0.25)'
                    : '1px solid rgba(255,255,255,0.06)',
                  opacity: isLocked && !isFree ? 0.6 : 1,
                }}
              >
                {/* Hover overlay */}
                {!isLocked && (
                  <div className="absolute inset-0 bg-white/0 group-hover:bg-white/2 transition-colors duration-200 rounded-2xl" />
                )}

                <div className="relative flex items-center gap-4">
                  {/* Numéro semaine */}
                  <div
                    className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black"
                    style={{
                      background: weekCompleted
                        ? 'rgba(0,255,135,0.15)'
                        : `rgba(255,255,255,0.05)`,
                      border: `1px solid ${statusColor}25`,
                      color: weekCompleted ? '#00ff87' : 'rgba(255,255,255,0.5)',
                    }}
                  >
                    {weekCompleted ? <Check size={14} className="text-green-400" /> : week.weekNumber}
                  </div>

                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-bold text-white truncate">
                        Semaine {week.weekNumber}
                      </span>
                      {isFree && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0"
                          style={{
                            background: 'rgba(251,191,36,0.15)',
                            border: '1px solid rgba(251,191,36,0.3)',
                            color: '#fbbf24',
                          }}>
                          Gratuit
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 truncate">{week.title}</p>
                  </div>

                  {/* Droite : sessions ou cadenas */}
                  <div className="flex-shrink-0 flex items-center gap-2">
                    {isLocked ? (
                      <Lock size={14} className="text-gray-700" />
                    ) : (
                      <>
                        <div className="text-right">
                          <p className="text-sm font-bold" style={{ color: statusColor }}>
                            {sessionsDone}/{sessionsTotal}
                          </p>
                          <p className="text-[10px] text-gray-600">séances</p>
                        </div>
                        <ChevronRight size={14} className="text-gray-700 group-hover:text-gray-500 transition-colors" />
                      </>
                    )}
                  </div>
                </div>

                {/* Mini barre de progression de la semaine */}
                {!isLocked && sessionsTotal > 0 && (
                  <div className="relative mt-3 h-0.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{
                        background: weekCompleted
                          ? '#00ff87'
                          : `linear-gradient(90deg, #00d4ff, #00ff87)`,
                        width: `${(sessionsDone / sessionsTotal) * 100}%`,
                      }}
                      initial={{ scaleX: 0, transformOrigin: 'left' }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: 0.3 + index * 0.04, duration: 0.6 }}
                    />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* CTA paiement si locked */}
        {!isPaid && program.weeks.some(w => !(w as any).isFree) && (
          <motion.button
            onClick={() => setPage('payment')}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
            className="w-full py-4 rounded-2xl font-bold text-black text-sm relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #00ff87, #00d4ff)',
              boxShadow: '0 0 30px rgba(0,255,135,0.25)',
            }}
          >
            <motion.div
              className="absolute inset-0 bg-white/20"
              initial={{ x: '-100%' }}
              whileHover={{ x: '100%' }}
              transition={{ duration: 0.4 }}
            />
            🔓 Débloquer tout le programme
          </motion.button>
        )}
      </div>

      {/* Modal suppression */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
            <motion.div
              className="relative w-full max-w-sm rounded-3xl p-6 z-10"
              style={{
                background: 'rgba(15,15,20,0.95)',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 mx-auto">
                <Trash2 size={20} className="text-red-400" />
              </div>
              <h3 className="text-white font-black text-lg text-center mb-2">Supprimer ce programme ?</h3>
              <p className="text-gray-500 text-sm text-center mb-6">Il sera archivé dans l'historique.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 rounded-2xl text-sm font-semibold text-gray-400 border border-white/10"
                >
                  Annuler
                </button>
                <button
                  onClick={() => { deleteProgram(); setShowDeleteConfirm(false); }}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold text-white bg-red-500/20 border border-red-500/30"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default MyPrograms;
