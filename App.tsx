
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
    const { page, program } = useAppContext();

    if (!program) {
        switch (page) {
            case 'home':
                return <Home />;
            case 'new-program':
                return <Questionnaire />;
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
        case 'new-program': // Redirect to home if a program exists
             return <Home />;
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