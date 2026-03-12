// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MY RUN — ProgramPresentation.tsx
// Présentation animée et défilante du programme après génération
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Program } from '../types';
import { buildProgramPresentation, ProgramPresentation as IProgramPresentation } from '../services/planGenerator';

interface Props {
    program: Program;
    onComplete: () => void;
}

// ── Compteur animé ──────────────────────────────────────────
const CountUp: React.FC<{ value: number; duration?: number; suffix?: string }> = ({
    value, duration = 1200, suffix = ''
}) => {
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
    return <>{current}{suffix}</>;
};

// ── Section défilante individuelle ─────────────────────────
const SlideSection: React.FC<{
    children: React.ReactNode;
    delay?: number;
    className?: string;
}> = ({ children, delay = 0, className = '' }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
        className={className}
    >
        {children}
    </motion.div>
);

// ── Barre de progression de lecture ────────────────────────
const ReadingProgress: React.FC<{ progress: number }> = ({ progress }) => (
    <div className="fixed top-0 left-0 right-0 h-0.5 bg-gray-800 z-50">
        <motion.div
            className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
        />
    </div>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPOSANT PRINCIPAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ProgramPresentationScreen: React.FC<Props> = ({ program, onComplete }) => {
    const [readProgress, setReadProgress] = useState(0);
    const [canProceed, setCanProceed] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const presentation: IProgramPresentation = buildProgramPresentation(program);
    const isConditioning = (program as any).isConditioningProgram;
    const isIntensive = (program as any).isIntensiveProgram;

    // Calcul stats du programme
    const totalKm = program.weeks.reduce((sum, w) => sum + (w.totalKm || 0), 0);
    const totalSessions = program.weeks.reduce((sum, w) => sum + (w.sessionsCount || 0), 0);

    // Suivi de la progression de lecture
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const handleScroll = () => {
            const scrollTop = el.scrollTop;
            const scrollHeight = el.scrollHeight - el.clientHeight;
            const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
            setReadProgress(progress);
            if (progress > 85) setCanProceed(true);
        };

        el.addEventListener('scroll', handleScroll);

        // Auto-unlock après 5 secondes même sans scroll
        const timer = setTimeout(() => setCanProceed(true), 5000);

        return () => {
            el.removeEventListener('scroll', handleScroll);
            clearTimeout(timer);
        };
    }, []);

    // Couleur d'accentuation selon le type
    const accentColor = isConditioning
        ? 'text-emerald-400'
        : isIntensive
        ? 'text-amber-400'
        : 'text-green-400';

    const accentBg = isConditioning
        ? 'bg-emerald-400/10 border-emerald-400/20'
        : isIntensive
        ? 'bg-amber-400/10 border-amber-400/20'
        : 'bg-green-400/10 border-green-400/20';

    const accentGradient = isConditioning
        ? 'from-emerald-500 to-green-400'
        : isIntensive
        ? 'from-amber-500 to-orange-400'
        : 'from-green-500 to-emerald-400';

    return (
        <div className="futuristic-grid min-h-screen bg-gray-950 flex flex-col">
            <ReadingProgress progress={readProgress} />

            {/* Scrollable content */}
            <div
                ref={containerRef}
                className="flex-1 overflow-y-auto pb-32"
                style={{ scrollBehavior: 'smooth' }}
            >
                <div className="max-w-2xl mx-auto px-4 pt-8 pb-8">

                    {/* ── HEADER ─────────────────────────────────── */}
                    <SlideSection delay={0} className="text-center mb-10">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.7, ease: [0.34, 1.56, 0.64, 1] }}
                            className="text-6xl mb-4"
                        >
                            {isConditioning ? '🌿' : isIntensive ? '⚡' : '🏆'}
                        </motion.div>

                        <h1 className={`text-2xl font-bold ${accentColor} mb-2`}>
                            {presentation.title}
                        </h1>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            {presentation.subtitle}
                        </p>

                        {/* Ligne de séparation animée */}
                        <motion.div
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className={`h-px bg-gradient-to-r ${accentGradient} mt-6 opacity-40`}
                        />
                    </SlideSection>

                    {/* ── STATS HIGHLIGHTS ───────────────────────── */}
                    <SlideSection delay={0.2} className="mb-8">
                        <div className="grid grid-cols-2 gap-3">
                            {presentation.highlights.map((h, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                    className={`rounded-xl border p-4 ${accentBg}`}
                                >
                                    <div className="text-2xl mb-1">{h.icon}</div>
                                    <div className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">
                                        {h.label}
                                    </div>
                                    <div className={`text-sm font-semibold ${accentColor}`}>
                                        {h.value}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </SlideSection>

                    {/* ── STATS CHIFFRÉES ────────────────────────── */}
                    <SlideSection delay={0.4} className="mb-8">
                        <div className={`rounded-2xl border ${accentBg} p-5`}>
                            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
                                📊 Ce programme en chiffres
                            </h2>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className={`text-3xl font-bold ${accentColor}`}>
                                        <CountUp value={program.totalWeeks} suffix="" />
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">Semaines</div>
                                </div>
                                <div>
                                    <div className={`text-3xl font-bold ${accentColor}`}>
                                        <CountUp value={totalSessions} />
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">Séances</div>
                                </div>
                                <div>
                                    <div className={`text-3xl font-bold ${accentColor}`}>
                                        <CountUp value={Math.round(totalKm)} suffix=" km" />
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">Volume total</div>
                                </div>
                            </div>
                        </div>
                    </SlideSection>

                    {/* ── PHASES DU PROGRAMME ───────────────────── */}
                    <SlideSection delay={0.5} className="mb-8">
                        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                            🗓 Structure du programme
                        </h2>
                        <div className="space-y-3">
                            {presentation.phases.map((phase, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.6 + i * 0.15 }}
                                    className="flex items-start gap-4 bg-gray-900/60 rounded-xl border border-gray-800 p-4"
                                >
                                    <div className="flex-shrink-0 mt-1">
                                        <div
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: phase.color }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-semibold text-white">
                                                {phase.name}
                                            </span>
                                            <span className="text-xs text-gray-600 bg-gray-800 px-2 py-0.5 rounded-full">
                                                {phase.weeks}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500">{phase.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </SlideSection>

                    {/* ── PHILOSOPHIE ───────────────────────────── */}
                    <SlideSection delay={0.7} className="mb-8">
                        <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-5">
                            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                                🧠 La philosophie de ce programme
                            </h2>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                {presentation.philosophy}
                            </p>
                        </div>
                    </SlideSection>

                    {/* ── STRUCTURE HEBDOMADAIRE ────────────────── */}
                    <SlideSection delay={0.85} className="mb-8">
                        <div className="bg-gray-900/60 rounded-2xl border border-gray-800 p-5">
                            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                                📋 Structure hebdomadaire
                            </h2>
                            <p className="text-sm text-gray-300 leading-relaxed">
                                {presentation.weeklyStructure}
                            </p>
                        </div>
                    </SlideSection>

                    {/* ── PRINCIPE CLÉ ──────────────────────────── */}
                    <SlideSection delay={1.0} className="mb-8">
                        <motion.div
                            className={`rounded-2xl border ${accentBg} p-5`}
                            animate={{
                                boxShadow: [
                                    '0 0 0px rgba(74,222,128,0)',
                                    '0 0 20px rgba(74,222,128,0.15)',
                                    '0 0 0px rgba(74,222,128,0)',
                                ]
                            }}
                            transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                        >
                            <p className={`text-sm font-medium ${accentColor} leading-relaxed`}>
                                {presentation.keyPrinciple}
                            </p>
                        </motion.div>
                    </SlideSection>

                    {/* ── SEMAINE OFFERTE (conditioning uniquement) ── */}
                    {isConditioning && (
                        <SlideSection delay={1.1} className="mb-8">
                            <motion.div
                                className="rounded-2xl border border-yellow-500/30 bg-yellow-500/5 p-5"
                                initial={{ scale: 0.95 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 1.2, type: 'spring' }}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl">🎁</span>
                                    <h2 className="text-sm font-bold text-yellow-400">
                                        Semaine 1 — 100% Offerte !
                                    </h2>
                                </div>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Accès complet à toutes les séances de la 1ère semaine sans aucun engagement.
                                    Découvre la qualité de MY RUN avant de démarrer ta vraie préparation.
                                </p>
                            </motion.div>
                        </SlideSection>
                    )}

                    {/* ── MESSAGE FINAL ─────────────────────────── */}
                    <SlideSection delay={1.2} className="text-center mb-4">
                        <p className="text-xs text-gray-600">
                            Fais défiler pour continuer ↓
                        </p>
                    </SlideSection>

                </div>
            </div>

            {/* ── BOUTON CTA FIXE EN BAS ────────────────────── */}
            <AnimatePresence>
                {canProceed && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-950 via-gray-950/95 to-transparent"
                    >
                        <div className="max-w-2xl mx-auto">
                            <motion.button
                                onClick={onComplete}
                                whileTap={{ scale: 0.97 }}
                                className={`w-full py-4 rounded-2xl bg-gradient-to-r ${accentGradient} text-gray-950 font-bold text-base tracking-wide shadow-lg`}
                                style={{
                                    boxShadow: isConditioning
                                        ? '0 0 30px rgba(52,211,153,0.3)'
                                        : isIntensive
                                        ? '0 0 30px rgba(251,191,36,0.3)'
                                        : '0 0 30px rgba(74,222,128,0.3)'
                                }}
                            >
                                {isConditioning
                                    ? '🌿 Démarrer ma mise en forme'
                                    : isIntensive
                                    ? '⚡ Lancer mon programme intensif'
                                    : '🏆 Accéder à mon programme'}
                            </motion.button>
                            <p className="text-center text-xs text-gray-600 mt-2">
                                {isConditioning
                                    ? 'Semaine 1 gratuite · Aucune CB requise'
                                    : 'Personnalisé pour toi · Basé sur ta VMA'}
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProgramPresentationScreen;
