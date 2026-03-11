import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { AppProvider, useAppContext } from './context/AppContext';
import Auth from './pages/Auth';               // ← NOUVEAU
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
import PageTransition from './components/PageTransition';

const PageRenderer: React.FC = () => {
    const { page, program, hasOnboarded, isAuthenticated, isLoading } = useAppContext();

    // ── Écran de chargement pendant la vérification Firebase ──
    // Explication : Firebase met une seconde à vérifier si l'utilisateur
    // est connecté. On affiche un spinner pendant ce temps.
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

    // ── NOUVEAU : Si l'utilisateur n'est PAS connecté → Page Auth ──
    // Explication : C'est le "garde" de l'app. Si pas connecté,
    // peu importe où l'utilisateur veut aller, on lui montre la page de connexion.
    if (!isAuthenticated) {
        return <Auth />;
    }

    // ── À partir d'ici, l'utilisateur EST connecté ──

    const getComponent = () => {
        // 1. Onboarding Check (première visite)
        if (!hasOnboarded) {
            return <EditProfile isOnboarding={true} />;
        }

        // 2. Questionnaire
        if (page === 'new-program') {
            return <Questionnaire />;
        }

        // 3. Routing Restreint (Pas de programme)
        if (!program) {
            switch (page) {
                case 'home': return <Home />;
                case 'profile': return <Profile />;
                case 'edit-profile': return <EditProfile />;
                case 'calendar': return <CalendarExport />;
                case 'vma-calculator': return <VMACalculator />;
                case 'program-view': return <ProgramView />;
                case 'my-programs': return <MyPrograms />;
                default: return <Welcome />;
            }
        }

        // 4. Routing Complet
        switch (page) {
            case 'home': return <Home />;
            case 'my-programs': return <MyPrograms />;
            case 'profile': return <Profile />;
            case 'edit-profile': return <EditProfile />;
            case 'payment': return <Payment />;
            case 'calendar': return <CalendarExport />;
            case 'vma-calculator': return <VMACalculator />;
            case 'program-view': return <ProgramView />;
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

const App: React.FC = () => {
    return (
        <AppProvider>
            <PageRenderer />
        </AppProvider>
    );
};

export default App;
