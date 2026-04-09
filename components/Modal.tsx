import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────

type ModalVariant = 'confirm' | 'success' | 'info' | 'danger';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  variant?: ModalVariant;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  /** Si true, pas de bouton annuler (modale d'info/succès) */
  singleAction?: boolean;
}

// ── Variant config ─────────────────────────────────────────

const VARIANTS: Record<ModalVariant, {
  icon: React.ReactNode;
  iconBg: string;
  iconBorder: string;
  btnGradient: string;
}> = {
  confirm: {
    icon: <Info size={22} className="text-cyan-400" />,
    iconBg: 'rgba(0,212,255,0.1)',
    iconBorder: 'rgba(0,212,255,0.2)',
    btnGradient: 'linear-gradient(135deg, #00ff87, #00d4ff)',
  },
  success: {
    icon: <CheckCircle size={22} className="text-green-400" />,
    iconBg: 'rgba(0,255,135,0.1)',
    iconBorder: 'rgba(0,255,135,0.2)',
    btnGradient: 'linear-gradient(135deg, #00ff87, #00d4ff)',
  },
  info: {
    icon: <Info size={22} className="text-cyan-400" />,
    iconBg: 'rgba(0,212,255,0.1)',
    iconBorder: 'rgba(0,212,255,0.2)',
    btnGradient: 'linear-gradient(135deg, #00d4ff, #00ff87)',
  },
  danger: {
    icon: <AlertTriangle size={22} className="text-red-400" />,
    iconBg: 'rgba(239,68,68,0.1)',
    iconBorder: 'rgba(239,68,68,0.2)',
    btnGradient: 'linear-gradient(135deg, #ef4444, #f97316)',
  },
};

// ── Component ──────────────────────────────────────────────

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  message,
  variant = 'confirm',
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  onConfirm,
  singleAction = false,
}) => {
  const v = VARIANTS[variant];

  // Ferme avec Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Bloque le scroll du body
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Card */}
          <motion.div
            className="relative w-full max-w-sm rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(18,18,28,0.97)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            }}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            {/* Top accent line */}
            <div
              className="h-px"
              style={{ background: v.btnGradient }}
            />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Fermer"
            >
              <X size={16} />
            </button>

            {/* Content */}
            <div className="px-6 pt-6 pb-5">
              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ background: v.iconBg, border: `1px solid ${v.iconBorder}` }}
              >
                {v.icon}
              </div>

              <h3 className="text-lg font-bold text-white text-center mb-2">{title}</h3>
              <p className="text-sm text-gray-400 text-center leading-relaxed">{message}</p>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6 flex gap-3">
              {!singleAction && (
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl font-bold text-sm text-gray-300 transition-all active:scale-95"
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {cancelLabel}
                </button>
              )}
              <button
                onClick={() => {
                  onConfirm?.();
                  onClose();
                }}
                className="flex-1 py-3 rounded-xl font-bold text-sm text-black transition-all active:scale-95"
                style={{ background: v.btnGradient }}
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
