import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X } from 'lucide-react';
import {
    isNotificationSupported,
    getNotificationPermission,
    requestNotificationPermission,
    setReminderEnabled,
    isReminderEnabled,
} from '../services/notifications';

const DISMISSED_KEY = 'myrun_notif_banner_dismissed';

const NotificationBanner: React.FC = () => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Ne pas afficher si :
        // - Notifications non supportées
        // - Permission déjà accordée et rappels activés
        // - Bannière déjà rejetée cette semaine
        if (!isNotificationSupported()) return;
        if (getNotificationPermission() === 'granted' && isReminderEnabled()) return;
        if (getNotificationPermission() === 'denied') return;

        const dismissed = localStorage.getItem(DISMISSED_KEY);
        if (dismissed) {
            const dismissedDate = new Date(dismissed);
            const daysSince = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24);
            if (daysSince < 7) return; // Re-montrer après 7 jours
        }

        // Montrer après 3 secondes
        const timer = setTimeout(() => setShow(true), 3000);
        return () => clearTimeout(timer);
    }, []);

    const handleEnable = async () => {
        const granted = await requestNotificationPermission();
        if (granted) {
            setReminderEnabled(true);
        }
        setShow(false);
    };

    const handleDismiss = () => {
        localStorage.setItem(DISMISSED_KEY, new Date().toISOString());
        setShow(false);
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className="mb-4 rounded-2xl p-4 relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(0,255,135,0.05))',
                        border: '1px solid rgba(0,212,255,0.2)',
                    }}
                >
                    <button
                        onClick={handleDismiss}
                        className="absolute top-3 right-3 p-1 text-gray-500 hover:text-white transition-colors"
                    >
                        <X size={14} />
                    </button>

                    <div className="flex items-start gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{
                                background: 'rgba(0,212,255,0.1)',
                                border: '1px solid rgba(0,212,255,0.25)',
                            }}
                        >
                            <Bell size={18} className="text-cyan-400" />
                        </div>
                        <div className="flex-1 pr-4">
                            <p className="text-sm font-bold text-white mb-1">Rappels de séances</p>
                            <p className="text-xs text-gray-400 leading-relaxed mb-3">
                                Active les notifications pour ne jamais rater une séance d'entraînement !
                            </p>
                            <button
                                onClick={handleEnable}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-black"
                                style={{
                                    background: 'linear-gradient(135deg, #00ff87, #00d4ff)',
                                    boxShadow: '0 0 15px rgba(0,255,135,0.25)',
                                }}
                            >
                                Activer les rappels
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default NotificationBanner;
