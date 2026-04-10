import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone } from 'lucide-react';

const INSTALL_DISMISSED_KEY = 'myrun_install_dismissed';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Vérifier si déjà en mode standalone (installé)
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // Vérifier si déjà dismissé récemment
    const dismissed = localStorage.getItem(INSTALL_DISMISSED_KEY);
    if (dismissed) {
      const days = (Date.now() - new Date(dismissed).getTime()) / (1000 * 60 * 60 * 24);
      if (days < 14) return; // Re-proposer après 14 jours
    }

    // Détection iOS (pas de beforeinstallprompt sur iOS)
    const ua = navigator.userAgent;
    const isiOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isiOS);

    if (isiOS) {
      // Sur iOS, afficher après un délai
      const timer = setTimeout(() => setShow(true), 5000);
      return () => clearTimeout(timer);
    }

    // Android / Desktop : écouter l'événement beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShow(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShow(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(INSTALL_DISMISSED_KEY, new Date().toISOString());
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-24 left-4 right-4 z-50 rounded-2xl p-4 overflow-hidden"
          style={{
            background: 'rgba(18,18,28,0.97)',
            border: '1px solid rgba(0,255,135,0.15)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 -4px 30px rgba(0,0,0,0.4), 0 0 20px rgba(0,255,135,0.08)',
          }}
        >
          {/* Accent top */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-400/40 to-transparent" />

          {/* Close */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Fermer"
          >
            <X size={14} />
          </button>

          <div className="flex items-start gap-3">
            {/* Icon */}
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, rgba(0,255,135,0.15), rgba(0,212,255,0.1))',
                border: '1px solid rgba(0,255,135,0.25)',
              }}
            >
              <Smartphone size={18} className="text-green-400" />
            </div>

            <div className="flex-1 pr-6">
              <p className="text-sm font-bold text-white mb-1">Installer MY RUN</p>
              <p className="text-xs text-gray-400 leading-relaxed mb-3">
                {isIOS
                  ? 'Appuyez sur le bouton de partage puis "Sur l\'écran d\'accueil" pour installer l\'app.'
                  : 'Ajoutez MY RUN sur votre écran d\'accueil pour un accès rapide, même hors-ligne.'
                }
              </p>

              {!isIOS && deferredPrompt && (
                <button
                  onClick={handleInstall}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-black"
                  style={{
                    background: 'linear-gradient(135deg, #00ff87, #00d4ff)',
                    boxShadow: '0 0 15px rgba(0,255,135,0.25)',
                  }}
                >
                  <Download size={14} />
                  Installer
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default InstallBanner;
