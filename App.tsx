import React, { useState, useEffect, lazy, Suspense } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AppProvider, useAppContext } from './context/AppContext';
import PageTransition from './components/PageTransition';
import SplashScreen from './components/SplashScreen';
import ErrorBoundary from './components/ErrorBoundary';
import InstallBanner from './components/InstallBanner';

// ── Pages chargées immédiatement (critiques au démarrage) ──
import Auth from './pages/Auth';
import Home from './pages/Home';

// ── Pages lazy-loaded (chargées à la demande) ──────────────
const Welcome = lazy(() => import('./pages/Welcome'));
const Questionnaire = lazy(() => import('./pages/Questionnaire/Questionnaire'));
const Profile = lazy(() => import('./pages/Profile'));
const Payment = lazy(() => import('./pages/Payment'));
const WeekDetail = lazy(() => import('./pages/WeekDetail'));
const EditProfile = lazy(() => import('./pages/EditProfile'));
const CalendarExport = lazy(() => import('./pages/CalendarExport'));
const VMACalculator = lazy(() => import('./pages/VMACalculator'));
const ProgramView = lazy(() => import('./pages/ProgramView'));
const MyPrograms = lazy(() => import('./pages/MyPrograms'));
const CoachIA = lazy(() => import('./pages/CoachIA'));
const Statistics = lazy(() => import('./pages/Statistics'));

// ── Fallback de chargement ─────────────────────────────────
const LazyFallback = () => (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0f' }}>
        <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-transparent border-t-green-400 border-r-cyan-400 animate-spin" />
            <span className="text-xs text-gray-500 tracking-wider">Chargement...</span>
        </div>
    </div>
);

const PageRenderer: React.FC = () => {
    const { page, setPage, program, hasOnboarded, isAuthenticated, isLoading } = useAppContext();
    const [showSplash, setShowSplash] = useState(true);
    const [minTimePassed, setMinTimePassed] = useState(false);

    // Durée minimale du splash : 3 secondes
    useEffect(() => {
        const timer = setTimeout(() => setMinTimePassed(true), 3000);
        return () => clearTimeout(timer);
    }, []);

    // Ferme le splash quand le temps min est écoulé ET le chargement terminé
    useEffect(() => {
        if (minTimePassed && !isLoading) {
            setShowSplash(false);
        }
    }, [minTimePassed, isLoading]);

    // Fallback absolu : force la fermeture du splash après 6 secondes max
    useEffect(() => {
        const fallback = setTimeout(() => setShowSplash(false), 6000);
        return () => clearTimeout(fallback);
    }, []);

    if (showSplash) {
        return (
            <AnimatePresence mode="wait">
                <SplashScreen onComplete={() => setShowSplash(false)} />
            </AnimatePresence>
        );
    }

    // Pas connecté → Auth
    if (!isAuthenticated) return <Auth />;

    const getComponent = () => {
        if (!hasOnboarded) return <EditProfile isOnboarding={true} />;
        if (page === 'new-program') return <Questionnaire />;

        if (!program) {
            switch (page) {
                case 'home':            return <Home />;
                case 'profile':         return <Profile />;
                case 'edit-profile':    return <EditProfile />;
                case 'calendar':        return <CalendarExport />;
                case 'vma-calculator':  return <VMACalculator />;
                case 'program-view':    return <ProgramView />;
                case 'my-programs':     return <MyPrograms />;
                case 'coach-ia':        return <CoachIA />;
                case 'statistics':      return <Statistics />;
                default:                return <Welcome />;
            }
        }

        switch (page) {
            case 'home':            return <Home />;
            case 'my-programs':     return <MyPrograms />;
            case 'profile':         return <Profile />;
            case 'edit-profile':    return <EditProfile />;
            case 'payment':         return <Payment />;
            case 'calendar':        return <CalendarExport />;
            case 'vma-calculator':  return <VMACalculator />;
            case 'program-view':    return <ProgramView />;
            case 'coach-ia':        return <CoachIA />;
            case 'statistics':      return <Statistics />;
            default:
                if (page.startsWith('week-')) {
                    const weekIndex = parseInt(page.split('-')[1], 10);
                    return <WeekDetail weekIndex={weekIndex} />;
                }
                return <Home />;
        }
    };

    return (
        <ErrorBoundary fallbackPage={() => setPage('home')}>
            <Suspense fallback={<LazyFallback />}>
                <AnimatePresence mode="wait">
                    <PageTransition key={hasOnboarded ? page : 'onboarding'}>
                        {getComponent()}
                    </PageTransition>
                </AnimatePresence>
            </Suspense>
        </ErrorBoundary>
    );
};

const App: React.FC = () => (
    <ErrorBoundary>
        <AppProvider>
            <PageRenderer />
            <InstallBanner />
        </AppProvider>
    </ErrorBoundary>
);

export default App;
