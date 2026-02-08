
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AppContextType, Page, Program, User, Level } from '../types';
import { generatePlan } from '../services/planGenerator';

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialUser: User = {
    name: '', // Vide par défaut pour forcer la saisie
    email: '',
    avatar: 'https://picsum.photos/200',
    weight: 0,
    height: 0,
    birthDate: '',
    level: Level.Beginner,
    vma: 0,
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User>(() => {
        const savedUser = localStorage.getItem('myrun_user');
        return savedUser ? JSON.parse(savedUser) : initialUser;
    });
    
    const [program, setProgram] = useState<Program | null>(() => {
        const savedProgram = localStorage.getItem('myrun_program');
        if (savedProgram) {
            const parsed = JSON.parse(savedProgram);
            if (parsed) {
                parsed.raceDate = new Date(parsed.raceDate);
                return parsed;
            }
        }
        return null;
    });

    const [hasOnboarded, setHasOnboarded] = useState<boolean>(() => {
        const savedOnboarded = localStorage.getItem('myrun_hasOnboarded');
        return savedOnboarded ? JSON.parse(savedOnboarded) : false;
    });

    const [programHistory, setProgramHistory] = useState<Program[]>(() => {
        const savedHistory = localStorage.getItem('myrun_program_history');
        if (savedHistory) {
            const parsed = JSON.parse(savedHistory);
            return parsed.map((p: Program) => ({ ...p, raceDate: new Date(p.raceDate)}));
        }
        return [];
    });

    const [isPaid, setIsPaid] = useState<boolean>(() => {
         const savedIsPaid = localStorage.getItem('myrun_isPaid');
         return savedIsPaid ? JSON.parse(savedIsPaid) : false;
    });

    const [page, setPage] = useState<Page>(program ? 'home' : 'welcome');
    const [viewedProgram, setViewedProgram] = useState<Program | null>(null);
    
    useEffect(() => {
        localStorage.setItem('myrun_user', JSON.stringify(user));
    }, [user]);

    useEffect(() => {
        localStorage.setItem('myrun_program', JSON.stringify(program));
         if (program && page === 'welcome') {
            setPage('home');
        } else if (!program && page.startsWith('week-')) {
            setPage('welcome');
        }
    }, [program, page]);
    
    useEffect(() => {
        localStorage.setItem('myrun_program_history', JSON.stringify(programHistory));
    }, [programHistory]);

    useEffect(() => {
        localStorage.setItem('myrun_isPaid', JSON.stringify(isPaid));
    }, [isPaid]);

    useEffect(() => {
        localStorage.setItem('myrun_hasOnboarded', JSON.stringify(hasOnboarded));
    }, [hasOnboarded]);

    const updateUser = (userData: Partial<User>) => {
        setUser(prevUser => ({ ...prevUser, ...userData }));
    };

    const completeOnboarding = () => {
        setHasOnboarded(true);
        setPage('welcome');
    };

    const createProgram = (settings: Omit<Program, 'id' | 'weeks' | 'totalWeeks'> & { vma?: number, raceInfo?: Program['raceInfo'] }) => {
        const newProgram = generatePlan(settings);
        setProgram(newProgram);
        setIsPaid(false); // Reset payment status for new program
        setPage('home');
    };

    const deleteProgram = () => {
        if (program) {
            const archivedProgram: Program = {
                ...program,
                archivedDate: new Date().toISOString()
            };
            setProgramHistory(prevHistory => [archivedProgram, ...prevHistory]);
        }
        setProgram(null);
        setIsPaid(false);
        localStorage.removeItem('myrun_program');
        localStorage.removeItem('myrun_isPaid');
    };

    const clearHistory = () => {
        setProgramHistory([]);
        localStorage.removeItem('myrun_program_history');
    };

    const completePayment = () => {
        setIsPaid(true);
        setPage('home');
    };

    const updateProgram = (updatedProgram: Program) => {
        setProgram(updatedProgram);
    };
    
    const adaptProgramIntensity = (reductionPercentage: number) => {
        if (!program || !program.vma) return;
        
        const currentVMA = program.vma;
        const newVMA = parseFloat((currentVMA * (1 - reductionPercentage / 100)).toFixed(1));
        
        // Update user VMA
        updateUser({ vma: newVMA });
        
        // Update program VMA reference (Note: In a real app, we would regenerate future sessions here)
        setProgram({
            ...program,
            vma: newVMA
        });
    };

    const value: AppContextType = {
        user,
        program,
        isPaid,
        page,
        hasOnboarded,
        programHistory,
        viewedProgram,
        setPage,
        updateUser,
        createProgram,
        deleteProgram,
        clearHistory,
        completePayment,
        updateProgram,
        setViewedProgram,
        completeOnboarding,
        adaptProgramIntensity,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};
