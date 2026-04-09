// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MY RUN — ProgramTimingAdvisor.tsx
// Recommandation intelligente basée sur la date de course
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Distance, Level } from '../types';
import {
    analyzeProgramTiming,
    ProgramRecommendation,
    OPTIMAL_WEEKS
} from '../services/planGenerator';

interface Props {
    distance: Distance;
    level: Level;
    raceDate: Date;
    onAcceptOptimal: () => void;
    onAcceptConditioning: () => void;
    onAcceptIntensive: () => void;
}

// ── Badge animé ────────────────────────────────────────────
const ScenarioBadge: React.FC<{ scenario: 'optimal' | 'tooFar' | 'tooClose' }> = ({ scenario }) => {
    const configs = {
        optimal: { label: '✅ Timing parfait', color: 'bg-green-400/10 border-green-400/30 text-green-400' },
        tooFar:  { label: '📅 Course éloignée', color: 'bg-blue-400/10 border-blue-400/30 text-blue-400' },
        tooClose:{ label: '⚡ Course proche', color: 'bg-amber-400/10 border-amber-400/30 text-amber-400' },
    };
    const { label, color } = configs[scenario];
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-medium ${color}`}>
            {label}
        </span>
    );
};

// ── Timeline visuelle ──────────────────────────────────────
const Timeline: React.FC<{ rec: ProgramRecommendation }> = ({ rec }) => {
    if (rec.scenario === 'optimal') {
        return (
            <div className="flex items-center gap-2 my-4">
                <div className="w-3 h-3 rounded-full bg-green-400 flex-shrink-0" />
                <div className="flex-1 h-1 bg-gradient-to-r from-green-500 to-emerald-400 rounded-full" />
                <div className="w-3 h-3 rounded-full bg-green-400 flex-shrink-0" />
                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">Jour J 🏁</span>
            </div>
        );
    }

    if (rec.scenario === 'tooFar') {
        const condPct = rec.conditioningWeeks! / rec.weeksUntilRace * 100;
        const mainPct = rec.mainProgramWeeks! / rec.weeksUntilRace * 100;
        return (
            <div className="my-4">
                <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-2">
                    <div
                        className="bg-emerald-500/50 rounded-l-full"
                        style={{ width: `${condPct}%` }}
                    />
                    <div
                        className="bg-blue-500/70 rounded-r-full"
                        style={{ width: `${mainPct}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm bg-emerald-500/50 inline-block" />
                        Mise en forme ({rec.conditioningWeeks} sem.)
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-sm bg-blue-500/70 inline-block" />
                        Préparation ({rec.mainProgramWeeks} sem.)
                    </span>
                    <span>🏁</span>
                </div>
            </div>
        );
    }

    // tooClose
    return (
        <div className="my-4">
            <div className="flex h-3 rounded-full overflow-hidden">
                <div className="bg-amber-500/70 rounded-full w-full" />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>⚡ Début intensif</span>
                <span>🏁 Course ({rec.weeksUntilRace} sem.)</span>
            </div>
        </div>
    );
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPOSANT PRINCIPAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ProgramTimingAdvisor: React.FC<Props> = ({
    distance,
    level,
    raceDate,
    onAcceptOptimal,
    onAcceptConditioning,
    onAcceptIntensive,
}) => {
    const rec = analyzeProgramTiming(distance, level, raceDate);
    const optimal = OPTIMAL_WEEKS[distance]?.[level];

    const handleCTA = () => {
        if (rec.scenario === 'optimal') onAcceptOptimal();
        else if (rec.scenario === 'tooFar') onAcceptConditioning();
        else onAcceptIntensive();
    };

    const ctaLabel = rec.scenario === 'optimal'
        ? '🚀 Créer mon programme'
        : rec.scenario === 'tooFar'
        ? '🌿 Démarrer la mise en forme + programme'
        : '⚡ Créer le programme intensif';

    const cardBg = rec.scenario === 'optimal'
        ? 'border-green-500/20 bg-green-500/5'
        : rec.scenario === 'tooFar'
        ? 'border-blue-500/20 bg-blue-500/5'
        : 'border-amber-500/20 bg-amber-500/5';

    const ctaGradient = rec.scenario === 'optimal'
        ? 'from-green-500 to-emerald-400'
        : rec.scenario === 'tooFar'
        ? 'from-blue-500 to-cyan-400'
        : 'from-amber-500 to-orange-400';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-4"
            >
                {/* ── Titre ───────────────────────────── */}
                <div className="text-center">
                    <h2 className="text-lg font-bold text-white mb-1">
                        Analyse de ton programme
                    </h2>
                    <p className="text-xs text-gray-500">
                        Basé sur ton niveau et ta date de course
                    </p>
                </div>

                {/* ── Carte principale ────────────────── */}
                <motion.div
                    className={`rounded-2xl border p-5 ${cardBg}`}
                    initial={{ scale: 0.97 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex items-start justify-between mb-3">
                        <div>
                            <p className="text-sm font-semibold text-white mb-1">
                                {rec.message}
                            </p>
                            <ScenarioBadge scenario={rec.scenario} />
                        </div>
                        <div className="text-right text-xs text-gray-500">
                            <div>Optimal : {optimal?.min}-{optimal?.max} sem.</div>
                        </div>
                    </div>

                    {/* Timeline */}
                    <Timeline rec={rec} />

                    {/* Détail */}
                    <div className="bg-gray-900/60 rounded-xl p-3">
                        <p className="text-xs text-gray-400 leading-relaxed whitespace-pre-line">
                            {rec.detail}
                        </p>
                    </div>
                </motion.div>

                {/* ── Fenêtre optimale info ────────────── */}
                {rec.scenario !== 'optimal' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gray-900/40 border border-gray-800 rounded-xl px-4 py-3"
                    >
                        <p className="text-xs text-gray-500 text-center">
                            💡 Fenêtre idéale pour ton niveau :{' '}
                            <span className="text-white font-medium">
                                {optimal?.min} à {optimal?.max} semaines
                            </span>{' '}
                            avant la course
                        </p>
                    </motion.div>
                )}

                {/* ── CTA principal ────────────────────── */}
                <motion.button
                    onClick={handleCTA}
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.01 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`w-full py-4 rounded-2xl bg-gradient-to-r ${ctaGradient} text-gray-950 font-bold text-sm tracking-wide`}
                >
                    {ctaLabel}
                </motion.button>

                {/* ── Option alternative (si tooFar : possibilité de commencer direct) ── */}
                {rec.scenario === 'tooFar' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center"
                    >
                        <button
                            onClick={onAcceptOptimal}
                            className="text-xs text-gray-500 underline underline-offset-2 hover:text-gray-400 transition-colors"
                        >
                            Ou commencer directement le programme de {rec.mainProgramWeeks} semaines maintenant
                        </button>
                    </motion.div>
                )}

                {/* ── Option alternative (si tooClose : changer de course) ── */}
                {rec.scenario === 'tooClose' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center"
                    >
                        <p className="text-xs text-gray-500">
                            Tu peux aussi changer ta date de course pour une préparation optimale
                        </p>
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
};

export default ProgramTimingAdvisor;
