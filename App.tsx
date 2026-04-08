import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AppProvider, useAppContext } from './context/AppContext';
import Auth from './pages/Auth';
import Welcome from './pages/Welcome';
import Questionnaire from './pages/Questionnaire/Questionnaire';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Payment from './pages/Payment';
import WeekDetail from './pages/WeekDetail';
import EditProfile from './pages/EditProfile';
import CalendarExport from './pages/CalendarExport';
import VMACalculator from './pages/VMACalculator';
import ProgramView from './pages/ProgramView';
import MyPrograms from './pages/MyPrograms';
import CoachIA from './pages/CoachIA';
import Statistics from './pages/Statistics';
import PageTransition from './components/PageTransition';
import SplashScreen from './components/SplashScreen';

const PageRenderer: React.FC = () => {
    const { page, program, hasOnboarded, isAuthenticated, isLoading } = useAppContext();
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
        <AnimatePresence mode="wait">
            <PageTransition key={hasOnboarded ? page : 'onboarding'}>
                {getComponent()}
            </PageTransition>
        </AnimatePresence>
    );
};

const App: React.FC = () => (
    <AppProvider>
        <PageRenderer />
    </AppProvider>
);

export default App;
