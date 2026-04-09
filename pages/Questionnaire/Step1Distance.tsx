import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, TrendingUp, Activity, Trophy } from 'lucide-react';
import { Distance } from '../../types';

interface Props {
  formData: any;
  onSelect: (field: string, value: any) => void;
  nextStep: () => void;
}

const distances = [
  {
    value: Distance.FiveK,
    label: '5 KM',
    sub: 'Vitesse & Explosivité',
    icon: Zap,
    color: '#00d4ff',
    glow: 'rgba(0,212,255,0.15)',
    border: 'rgba(0,212,255,0.25)',
    tag: 'Entrée en matière',
  },
  {
    value: Distance.TenK,
    label: '10 KM',
    sub: 'Vitesse & Intensité',
    icon: TrendingUp,
    color: '#00ff87',
    glow: 'rgba(0,255,135,0.15)',
    border: 'rgba(0,255,135,0.25)',
    tag: 'Classique',
  },
  {
    value: Distance.HalfMarathon,
    label: 'SEMI',
    sub: 'Endurance & Vitesse',
    icon: Activity,
    color: '#a78bfa',
    glow: 'rgba(167,139,250,0.15)',
    border: 'rgba(167,139,250,0.25)',
    tag: 'Populaire',
  },
  {
    value: Distance.Marathon,
    label: 'MARATHON',
    sub: 'Le défi ultime',
    icon: Trophy,
    color: '#fb923c',
    glow: 'rgba(251,146,60,0.15)',
    border: 'rgba(251,146,60,0.25)',
    tag: 'Légendaire',
  },
];

const Step1Distance: React.FC<Props> = ({ formData, onSelect, nextStep }) => {
  const [showError, setShowError] = useState(false);

  const handleSelect = (value: Distance) => {
    onSelect('distance', value);
    setShowError(false);
  };

  const handleNext = () => {
    if (!formData.distance) {
      setShowError(true);
      return;
    }
    nextStep();
  };

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24, scale: 0.96 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
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
          Étape 1 sur 3
        </motion.p>
        <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
          Votre Objectif
        </h2>
        <p className="text-gray-500 text-sm">Quelle distance préparez-vous ?</p>
      </motion.div>

      {/* Grille de cartes */}
      <motion.div
        className="flex flex-col gap-3 flex-1"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {distances.map((d) => {
          const isSelected = formData.distance === d.value;
          return (
            <motion.button
              key={d.value}
              variants={cardVariants}
              onClick={() => handleSelect(d.value)}
              whileTap={{ scale: 0.98 }}
              whileHover={{ x: 4 }}
              className="relative w-full text-left rounded-2xl p-4 transition-all duration-200 overflow-hidden group"
              style={{
                background: isSelected
                  ? `linear-gradient(135deg, ${d.glow}, rgba(0,0,0,0.6))`
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isSelected ? d.border : 'rgba(255,255,255,0.07)'}`,
                boxShadow: isSelected ? `0 0 20px ${d.glow}` : 'none',
              }}
            >
              {/* Hover background */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(135deg, ${d.glow}, transparent)` }}
              />

              {/* Ligne de gauche active */}
              {isSelected && (
                <motion.div
                  className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full"
                  style={{ background: d.color }}
                  layoutId="activeLine"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.2 }}
                />
              )}

              <div className="relative flex items-center gap-4">
                {/* Icône */}
                <div
                  className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${d.glow}, rgba(0,0,0,0.4))`,
                    border: `1px solid ${d.border}`,
                  }}
                >
                  <d.icon size={18} style={{ color: d.color }} />
                </div>

                {/* Texte */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className="text-sm font-black tracking-wider"
                      style={{ color: isSelected ? d.color : 'white' }}
                    >
                      {d.label}
                    </span>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider"
                      style={{
                        background: `${d.glow}`,
                        color: d.color,
                        border: `1px solid ${d.border}`,
                      }}
                    >
                      {d.tag}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{d.sub}</p>
                </div>

                {/* Radio */}
                <div
                  className="flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                  style={{
                    borderColor: isSelected ? d.color : 'rgba(255,255,255,0.2)',
                    background: isSelected ? d.color : 'transparent',
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
      </motion.div>

      {/* Erreur de validation */}
      <AnimatePresence>
        {showError && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center text-red-400 text-xs font-semibold mt-2"
          >
            Veuillez sélectionner une distance pour continuer
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
            background: formData.distance
              ? 'linear-gradient(135deg, #00ff87, #00d4ff)'
              : 'linear-gradient(135deg, rgba(0,255,135,0.3), rgba(0,212,255,0.3))',
            boxShadow: formData.distance ? '0 0 30px rgba(0,255,135,0.3)' : 'none',
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

export default Step1Distance;
