import React from 'react';
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
import CoachIA from './pages/CoachIA';          // ← NOUVEAU
import PageTransition from './components/PageTransition';

// rebuild

const PageRenderer: React.FC = () => {
    const { page, program, hasOnboarded, isAuthenticated, isLoading } = useAppContext();

    // Spinner pendant vérification auth
    if (isLoading) {
        return (
            <div className="futuristic-grid min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" />
                    <p className="text-gray-500 text-sm">Chargement...</p>
                </div>
            </div>
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
                case 'coach-ia':        return <CoachIA />;  // ← NOUVEAU
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
            case 'coach-ia':        return <CoachIA />;     // ← NOUVEAU
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
