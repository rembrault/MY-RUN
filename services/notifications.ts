import { Program, Session, Week } from '../types';

// ── Permission ──────────────────────────────────────────────
export const isNotificationSupported = (): boolean =>
    'Notification' in window && 'serviceWorker' in navigator;

export const getNotificationPermission = (): NotificationPermission | 'unsupported' =>
    isNotificationSupported() ? Notification.permission : 'unsupported';

export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!isNotificationSupported()) return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
};

// ── Envoi de notification via Service Worker ────────────────
export const sendNotification = async (title: string, options?: NotificationOptions): Promise<void> => {
    if (getNotificationPermission() !== 'granted') return;

    try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, {
            icon: '/icon-192.svg',
            badge: '/icon-192.svg',
            vibrate: [100, 50, 100],
            ...options,
        });
    } catch {
        // Fallback si le SW n'est pas disponible
        if (Notification.permission === 'granted') {
            new Notification(title, { icon: '/icon-192.svg', ...options });
        }
    }
};

// ── Trouver la prochaine séance ─────────────────────────────
export const getNextSession = (program: Program): { session: Session; week: Week; dayIndex: number } | null => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const week of program.weeks) {
        for (let i = 0; i < week.sessions.length; i++) {
            const session = week.sessions[i];
            if (session.type === 'Repos' || session.completed) continue;

            // Calculer la date de la séance
            const sessionDate = getSessionDate(program, week, session);
            if (sessionDate && sessionDate >= today) {
                return { session, week, dayIndex: i };
            }
        }
    }
    return null;
};

// ── Calculer la date d'une séance ───────────────────────────
const getSessionDate = (program: Program, week: Week, session: Session): Date | null => {
    if (session.date) return new Date(session.date);

    const startDate = program.startDate ? new Date(program.startDate) : null;
    if (!startDate) return null;

    const dayMap: Record<string, number> = {
        'Lundi': 1, 'Mardi': 2, 'Mercredi': 3, 'Jeudi': 4,
        'Vendredi': 5, 'Samedi': 6, 'Dimanche': 0,
    };

    const weekStart = new Date(startDate);
    weekStart.setDate(weekStart.getDate() + (week.weekNumber - 1) * 7);

    const targetDay = dayMap[session.day];
    if (targetDay === undefined) return null;

    const currentDay = weekStart.getDay();
    const diff = (targetDay - currentDay + 7) % 7;
    const sessionDate = new Date(weekStart);
    sessionDate.setDate(sessionDate.getDate() + diff);

    return sessionDate;
};

// ── Planifier les rappels ───────────────────────────────────
const REMINDER_KEY = 'myrun_reminder_timeout';
const REMINDER_PREF_KEY = 'myrun_notifications_enabled';

export const isReminderEnabled = (): boolean => {
    try {
        return localStorage.getItem(REMINDER_PREF_KEY) === 'true';
    } catch {
        return false;
    }
};

export const setReminderEnabled = (enabled: boolean): void => {
    localStorage.setItem(REMINDER_PREF_KEY, enabled ? 'true' : 'false');
};

export const scheduleNextReminder = (program: Program): void => {
    // Annuler le rappel précédent
    clearScheduledReminder();

    if (!isReminderEnabled() || getNotificationPermission() !== 'granted') return;

    const next = getNextSession(program);
    if (!next) return;

    const sessionDate = getSessionDate(program, next.week, next.session);
    if (!sessionDate) return;

    // Rappel la veille à 20h
    const reminderDate = new Date(sessionDate);
    reminderDate.setDate(reminderDate.getDate() - 1);
    reminderDate.setHours(20, 0, 0, 0);

    const now = new Date();
    const delay = reminderDate.getTime() - now.getTime();

    if (delay <= 0) {
        // Si la veille est déjà passée, rappel le jour même à 7h
        const morningReminder = new Date(sessionDate);
        morningReminder.setHours(7, 0, 0, 0);
        const morningDelay = morningReminder.getTime() - now.getTime();

        if (morningDelay > 0 && morningDelay < 24 * 60 * 60 * 1000) {
            const timeoutId = window.setTimeout(() => {
                sendSessionReminder(next.session, next.week);
            }, morningDelay);
            localStorage.setItem(REMINDER_KEY, String(timeoutId));
        }
        return;
    }

    // Ne pas planifier plus de 24h à l'avance (limitation setTimeout)
    if (delay > 24 * 60 * 60 * 1000) return;

    const timeoutId = window.setTimeout(() => {
        sendSessionReminder(next.session, next.week);
    }, delay);
    localStorage.setItem(REMINDER_KEY, String(timeoutId));
};

export const clearScheduledReminder = (): void => {
    const saved = localStorage.getItem(REMINDER_KEY);
    if (saved) {
        window.clearTimeout(Number(saved));
        localStorage.removeItem(REMINDER_KEY);
    }
};

const sendSessionReminder = (session: Session, week: Week): void => {
    const emoji = session.type === 'Fractionné' ? '⚡' :
                  session.type === 'Sortie longue' ? '🏃' :
                  session.type === 'Course à rythme' ? '💨' :
                  session.type === 'Côtes' ? '⛰️' : '🏃‍♂️';

    sendNotification(`${emoji} Séance demain !`, {
        body: `${session.title} — Semaine ${week.weekNumber}\n${session.duration ? `${session.duration} min` : ''}${session.distance ? ` · ${session.distance} km` : ''}`,
        tag: 'session-reminder',
        renotify: true,
    });
};
