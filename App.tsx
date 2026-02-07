
import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
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

const PageRenderer: React.FC = () => {
    const { page, program, hasOnboarded } = useAppContext();

    // 1. Onboarding Check : Si l'utilisateur n'a pas fini l'onboarding, on force la page profil
    if (!hasOnboarded) {
        return <EditProfile isOnboarding={true} />;
    }

    // 2. Si la page demandée est le questionnaire, on l'affiche TOUJOURS
    if (page === 'new-program') {
        return <Questionnaire />;
    }

    // 3. Si aucun programme n'existe, routing restreint
    if (!program) {
        switch (page) {
            case 'home':
                return <Home />;
            case 'profile':
                return <Profile />;
            case 'edit-profile':
                return <EditProfile />;
            case 'calendar':
                return <CalendarExport />;
            case 'vma-calculator':
                return <VMACalculator />;
            case 'program-view':
                return <ProgramView />;
            default:
                return <Welcome />;
        }
    }
    
    // 4. Si un programme existe, routing complet
    switch (page) {
        case 'home':
            return <Home />;
        case 'profile':
            return <Profile />;
        case 'edit-profile':
            return <EditProfile />;
        case 'payment':
            return <Payment />;
        case 'calendar':
            return <CalendarExport />;
        case 'vma-calculator':
            return <VMACalculator />;
        case 'program-view':
            return <ProgramView />;
        default:
            if (page.startsWith('week-')) {
                const weekIndex = parseInt(page.split('-')[1], 10);
                return <WeekDetail weekIndex={weekIndex} />;
            }
            return <Home />;
    }
};


const App: React.FC = () => {
  return (
    <AppProvider>
      <PageRenderer />
    </AppProvider>
  );
};

export default App;
