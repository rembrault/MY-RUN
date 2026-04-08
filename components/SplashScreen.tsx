import React from 'react';
import { motion } from 'framer-motion';

interface SplashScreenProps {
    onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
    return (
        <motion.div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
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
                <motion.img
                    src="/logo-myrun.png"
                    alt="MY RUN"
                    className="h-40"
                    style={{
                        filter: 'drop-shadow(0 0 10px rgba(0,255,135,0.35)) drop-shadow(0 0 25px rgba(0,212,255,0.2))',
                    }}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.6, type: 'spring', stiffness: 200 }}
                />

                {/* Reflet néon sous le logo */}
                <motion.div
                    className="absolute -bottom-3 w-40 h-6 rounded-full blur-xl"
                    style={{
                        background: 'radial-gradient(ellipse, rgba(0,255,135,0.25) 0%, rgba(0,212,255,0.15) 40%, transparent 70%)',
                    }}
                    initial={{ opacity: 0, scaleX: 0.5 }}
                    animate={{ opacity: [0, 0.6, 0.35, 0.6], scaleX: [0.5, 1.1, 0.9, 1.05] }}
                    transition={{ delay: 0.8, duration: 2, repeat: Infinity, repeatType: 'reverse' }}
                />

                {/* Ligne de séparation animée */}
                <motion.div
                    className="mt-5 h-0.5 rounded-full"
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
                    Entraînez-vous plus intelligemment.
                </motion.p>
            </div>

            {/* ══ Animation coureur 🏃 qui court sur la piste ══ */}
            <motion.div
                className="absolute bottom-24 w-full flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.3 }}
            >
                {/* Piste / ligne de course */}
                <motion.div
                    className="absolute w-full h-px"
                    style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(0,255,135,0.3) 20%, rgba(0,212,255,0.3) 80%, transparent 100%)',
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.3, duration: 0.5 }}
                />

                {/* Coureur emoji qui traverse l'écran */}
                <motion.div
                    className="text-3xl"
                    style={{ filter: 'drop-shadow(0 0 8px rgba(0,255,135,0.6))' }}
                    initial={{ x: '-10vw', opacity: 0 }}
                    animate={{
                        x: ['0vw', '110vw'],
                        opacity: [0, 1, 1, 1, 0],
                    }}
                    transition={{
                        delay: 1.4,
                        duration: 2.2,
                        ease: 'easeInOut',
                        opacity: { delay: 1.3, duration: 2.3, times: [0, 0.05, 0.5, 0.9, 1] },
                    }}
                >
                    🏃
                </motion.div>

                {/* Traînée lumineuse derrière le coureur */}
                <motion.div
                    className="absolute h-0.5 rounded-full"
                    style={{
                        background: 'linear-gradient(90deg, transparent, #00ff87, #00d4ff)',
                        boxShadow: '0 0 10px rgba(0,255,135,0.5)',
                    }}
                    initial={{ x: '-10vw', width: 0, opacity: 0 }}
                    animate={{
                        x: ['0vw', '105vw'],
                        width: [0, 60, 40, 0],
                        opacity: [0, 0.8, 0.8, 0],
                    }}
                    transition={{
                        delay: 1.4,
                        duration: 2.2,
                        ease: 'easeInOut',
                    }}
                />
            </motion.div>

            {/* Texte de chargement en bas */}
            <motion.div
                className="absolute bottom-12 flex flex-col items-center gap-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.4 }}
            >
                <motion.span
                    className="text-xs text-gray-500 tracking-wider"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0.5, 1] }}
                    transition={{ delay: 1.5, duration: 1.5 }}
                >
                    Chargement...
                </motion.span>
            </motion.div>
        </motion.div>
    );
};

export default SplashScreen;
