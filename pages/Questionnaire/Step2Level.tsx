import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, Flame, Rocket } from 'lucide-react';
import { Level } from '../../types';

interface Props {
  formData: any;
  onSelect: (field: string, value: any) => void;
  nextStep: () => void;
}

const levels = [
  {
    value: Level.Beginner,
    label: 'Débutant',
    sub: 'Je cours depuis moins d\'un an',
    icon: Sprout,
    color: '#4ade80',
    glow: 'rgba(74,222,128,0.15)',
    border: 'rgba(74,222,128,0.25)',
    detail: 'Moins de 20 km/semaine',
    badge: '0–1 an',
  },
  {
    value: Level.Intermediate,
    label: 'Intermédiaire',
    sub: 'Je cours régulièrement depuis 1–3 ans',
    icon: Flame,
    color: '#fb923c',
    glow: 'rgba(251,146,60,0.15)',
    border: 'rgba(251,146,60,0.25)',
    detail: '20–50 km/semaine',
    badge: '1–3 ans',
  },
  {
    value: Level.Advanced,
    label: 'Avancé',
    sub: 'Course régulière depuis plus de 3 ans',
    icon: Rocket,
    color: '#00d4ff',
    glow: 'rgba(0,212,255,0.15)',
    border: 'rgba(0,212,255,0.25)',
    detail: '50+ km/semaine',
    badge: '3+ ans',
  },
];

const Step2Level: React.FC<Props> = ({ formData, onSelect, nextStep }) => {
  const [showError, setShowError] = useState(false);

  const handleSelect = (value: Level) => {
    onSelect('level', value);
    setShowError(false);
  };

  const handleNext = () => {
    if (!formData.level) {
      setShowError(true);
      return;
    }
    nextStep();
  };

  return (
    <div className="flex flex-col h-full pt-4">
      {/* Header */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.p
          className="text-xs font-bold uppercase tracking-[0.2em] mb-3"
          style={{ color: 'rgba(0,255,135,0.7)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Étape 2 sur 3
        </motion.p>
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
          Votre Niveau
        </h2>
        <p className="text-gray-500 text-sm">Soyez honnête — c'est pour votre bien !</p>
      </motion.div>

      {/* Cartes niveau */}
      <div className="flex flex-col gap-4 flex-1">
        {levels.map((l, i) => {
          const isSelected = formData.level === l.value;
          return (
            <motion.button
              key={l.value}
              onClick={() => handleSelect(l.value)}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              whileTap={{ scale: 0.98 }}
              whileHover={{ x: 4 }}
              className="relative w-full text-left rounded-2xl p-5 overflow-hidden group"
              style={{
                background: isSelected
                  ? `linear-gradient(135deg, ${l.glow}, rgba(0,0,0,0.5))`
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isSelected ? l.border : 'rgba(255,255,255,0.07)'}`,
                boxShadow: isSelected ? `0 4px 24px ${l.glow}` : 'none',
              }}
            >
              {/* Hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(135deg, ${l.glow}, transparent)` }}
              />

              <div className="relative flex items-start gap-4">
                {/* Icône */}
                <motion.div
                  className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${l.glow}, rgba(0,0,0,0.6))`,
                    border: `1px solid ${l.border}`,
                  }}
                  animate={isSelected ? { scale: [1, 1.05, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <l.icon size={20} style={{ color: l.color }} />
                </motion.div>

                {/* Texte */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="text-sm font-black"
                      style={{ color: isSelected ? l.color : 'white' }}
                    >
                      {l.label}
                    </span>
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase"
                      style={{
                        background: l.glow,
                        color: l.color,
                        border: `1px solid ${l.border}`,
                      }}
                    >
                      {l.badge}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-1">{l.sub}</p>
                  <p className="text-[11px] font-medium" style={{ color: l.color, opacity: 0.7 }}>
                    {l.detail}
                  </p>
                </div>

                {/* Indicateur sélection */}
                <div
                  className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 transition-all duration-200"
                  style={{
                    borderColor: isSelected ? l.color : 'rgba(255,255,255,0.2)',
                    background: isSelected ? l.color : 'transparent',
                  }}
                >
                  {isSelected && (
                    <motion.div
                      className="w-2 h-2 rounded-full bg-black"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    />
                  )}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Erreur de validation */}
      <AnimatePresence>
        {showError && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center text-red-400 text-xs font-semibold mt-2"
          >
            Veuillez sélectionner votre niveau pour continuer
          </motion.p>
        )}
      </AnimatePresence>

      {/* CTA */}
      <motion.div
        className="pt-6 pb-2"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <motion.button
          onClick={handleNext}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.01 }}
          className="w-full py-4 rounded-2xl font-bold text-sm tracking-wide text-black relative overflow-hidden"
          style={{
            background: formData.level
              ? 'linear-gradient(135deg, #00ff87, #00d4ff)'
              : 'linear-gradient(135deg, rgba(0,255,135,0.3), rgba(0,212,255,0.3))',
            boxShadow: formData.level ? '0 0 30px rgba(0,255,135,0.3)' : 'none',
          }}
        >
          <motion.div
            className="absolute inset-0 bg-white/20"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.4 }}
          />
          Continuer →
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Step2Level;
