import React from 'react';
import { motion } from 'framer-motion';

interface SplashScreenProps {
    onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
    return (
        <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{ backgroundColor: '#0a0a0f' }}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onAnimationComplete={(definition: { opacity?: number }) => {
                if (definition.opacity === 0) onComplete();
            }}
        >
            {/* Grid background animé */}
            <motion.div
                className="absolute inset-0"
                style={{
                    backgroundImage:
                        'linear-gradient(rgba(0, 212, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 212, 255, 0.05) 1px, transparent 1px)',
                    backgroundSize: '40px 40px',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 1] }}
                transition={{ duration: 1.2 }}
            />

            {/* Cercle pulsant derrière le logo */}
            <motion.div
                className="absolute rounded-full"
                style={{
                    width: 200,
                    height: 200,
                    background: 'radial-gradient(circle, rgba(0,255,135,0.15) 0%, transparent 70%)',
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.5, 1.2], opacity: [0, 0.8, 0.4] }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
            />

            {/* Logo MY RUN */}
            <div className="relative flex flex-col items-center">
                {/* Icone coureur stylisée */}
                <motion.div
                    className="mb-4"
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
                >
                    <svg
                        width="56"
                        height="56"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#00ff87"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        {/* Runner silhouette */}
                        <circle cx="13" cy="4" r="2" />
                        <path d="M7 21l3-7 2.5 2 4.5-6" />
                        <path d="M16 11l-2.5 3L11 12l-3 7" />
                        <path d="M21 17l-3-1" />
                    </svg>
                </motion.div>

                {/* Texte MY */}
                <motion.span
                    className="text-7xl font-black tracking-tighter leading-none"
                    style={{
                        color: '#00d4ff',
                        textShadow: '0 0 4px #00d4ff, 0 0 12px #00d4ff',
                    }}
                    initial={{ x: -40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5, ease: 'easeOut' }}
                >
                    MY
                </motion.span>

                {/* Texte RUN */}
                <motion.span
                    className="text-7xl font-black tracking-tighter leading-none"
                    style={{
                        color: '#00ff87',
                        textShadow: '0 0 4px #00ff87, 0 0 12px #00ff87',
                    }}
                    initial={{ x: 40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5, ease: 'easeOut' }}
                >
                    RUN
                </motion.span>

                {/* Ligne de séparation animée */}
                <motion.div
                    className="mt-4 h-0.5 rounded-full"
                    style={{
                        background: 'linear-gradient(90deg, #00d4ff, #00ff87)',
                        boxShadow: '0 0 8px rgba(0,255,135,0.5)',
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: 120 }}
                    transition={{ delay: 1.0, duration: 0.6, ease: 'easeInOut' }}
                />

                {/* Tagline */}
                <motion.p
                    className="mt-4 text-sm text-gray-400 tracking-widest uppercase"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3, duration: 0.5 }}
                >
                    Train smarter. Run faster.
                </motion.p>
            </div>

            {/* Indicateur de chargement en bas */}
            <motion.div
                className="absolute bottom-16 flex flex-col items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.4 }}
            >
                {/* Barre de progression */}
                <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full rounded-full"
                        style={{
                            background: 'linear-gradient(90deg, #00d4ff, #00ff87)',
                        }}
                        initial={{ width: '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ delay: 1.5, duration: 1.2, ease: 'easeInOut' }}
                    />
                </div>
                <motion.span
                    className="text-xs text-gray-500"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0.5, 1] }}
                    transition={{ delay: 1.5, duration: 1.5, repeat: 0 }}
                >
                    Chargement...
                </motion.span>
            </motion.div>
        </motion.div>
    );
};

export default SplashScreen;
