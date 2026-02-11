
import React from 'react';
import { AnimatePresence } from 'framer-motion';
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
import MyPrograms from './pages/MyPrograms';
import PageTransition from './components/PageTransition';

const PageRenderer: React.FC = () => {
    const { page, program, hasOnboarded } = useAppContext();

    // Helper function to determine which component to render
    const getComponent = () => {
        // 1. Onboarding Check
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
