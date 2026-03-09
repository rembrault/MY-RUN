
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AppContextType, Page, Program, User, Level } from '../types';
import { generatePlan } from '../services/planGenerator';
import { auth, db, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialUser: User = {
    name: '',
    email: '',
    avatar: 'https://picsum.photos/200',
    weight: 0,
    height: 0,
    birthDate: '',
    level: Level.Beginner,
    vma: 0,
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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
                if (parsed.startDate) parsed.startDate = new Date(parsed.startDate);
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
            return parsed.map((p: Program) => ({ 
                ...p, 
                raceDate: new Date(p.raceDate),
                startDate: p.startDate ? new Date(p.startDate) : undefined
            }));
        }
        return [];
    });

    const [isPaid, setIsPaid] = useState<boolean>(() => {
         const savedIsPaid = localStorage.getItem('myrun_isPaid');
         return savedIsPaid ? JSON.parse(savedIsPaid) : false;
    });

    const [page, setPage] = useState<Page>(program ? 'home' : 'welcome');
    const [viewedProgram, setViewedProgram] = useState<Program | null>(null);
    
    // Helper to serialize program for Firestore
    const serializeProgram = (p: Program) => ({
        ...p,
        weeks: JSON.stringify(p.weeks),
        raceInfo: p.raceInfo ? JSON.stringify(p.raceInfo) : undefined,
        raceDate: p.raceDate.toISOString(),
        startDate: p.startDate ? p.startDate.toISOString() : undefined,
    });

    // Helper to deserialize program from Firestore
    const deserializeProgram = (data: any): Program => ({
        ...data,
        weeks: JSON.parse(data.weeks),
        raceInfo: data.raceInfo ? JSON.parse(data.raceInfo) : undefined,
        raceDate: new Date(data.raceDate),
        startDate: data.startDate ? new Date(data.startDate) : undefined,
    });

    // Auth State Listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setFirebaseUser(currentUser);
            setIsLoading(true);

            if (currentUser) {
                try {
                    // Fetch User Data
                    const userDocRef = doc(db, 'users', currentUser.uid);
                    const userDoc = await getDoc(userDocRef);

                    if (userDoc.exists()) {
                        const userData = userDoc.data() as User;
                        setUser(userData);
                        setHasOnboarded(userData.hasOnboarded || false); // Assuming hasOnboarded is stored in user profile
                        
                        // Fetch Active Program
                        if (userData.activeProgramId) {
                            const programDocRef = doc(db, 'users', currentUser.uid, 'programs', userData.activeProgramId);
                            const programDoc = await getDoc(programDocRef);
                            if (programDoc.exists()) {
                                setProgram(deserializeProgram(programDoc.data()));
                            }
                        } else {
                            setProgram(null);
                        }

                        // Fetch History
                        const programsRef = collection(db, 'users', currentUser.uid, 'programs');
                        const q = query(programsRef); // You might want to filter by archivedDate or something
                        const querySnapshot = await getDocs(q);
                        const history: Program[] = [];
                        querySnapshot.forEach((doc) => {
                            const p = deserializeProgram(doc.data());
                            if (p.id !== userData.activeProgramId) { // Exclude active program from history list if needed, or just separate them
                                history.push(p);
                            }
                        });
                        // Filter history to only include archived programs if that's the logic
                        setProgramHistory(history.filter(p => p.archivedDate));
                    } else {
                        // New Firestore User: Initialize with current local state or defaults
                        // If we have local data, we might want to upload it?
                        // For now, let's just save the current 'user' state to Firestore
                        await setDoc(userDocRef, { ...user, email: currentUser.email });
                        setUser(prev => ({ ...prev, email: currentUser.email || '' }));
                    }
                } catch (error) {
                    console.error("Error fetching Firestore data:", error);
                }
            } else {
                // Fallback to localStorage is handled by initial state, but if we logout, we might want to reset?
                // The logout function handles reset.
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Persistence Effects (Local Storage - kept for offline/fallback or just sync)
    // If logged in, we also save to Firestore in the specific actions (updateUser, etc.)
    
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

    const login = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Login failed", error);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setFirebaseUser(null);
            // Reset to initial state
            setUser(initialUser);
            setProgram(null);
            setProgramHistory([]);
            setHasOnboarded(false);
            localStorage.clear(); 
            setPage('welcome');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const updateUser = async (userData: Partial<User>) => {
        const newUser = { ...user, ...userData };
        setUser(newUser);
        
        if (firebaseUser) {
            try {
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                await setDoc(userDocRef, newUser, { merge: true });
            } catch (error) {
                console.error("Error updating user in Firestore:", error);
            }
        }
    };

    const completeOnboarding = async () => {
        setHasOnboarded(true);
        setPage('welcome');
        
        if (firebaseUser) {
            try {
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                await updateDoc(userDocRef, { hasOnboarded: true });
            } catch (error) {
                console.error("Error updating onboarding status:", error);
            }
        }
    };

    const createProgram = async (settings: Omit<Program, 'id' | 'weeks' | 'totalWeeks'> & { vma?: number, raceInfo?: Program['raceInfo'] }) => {
        const newProgram = generatePlan(settings);
        setProgram(newProgram);
        setIsPaid(false);
        setPage('my-programs');

        if (firebaseUser) {
            try {
                // Save program to subcollection
                const programDocRef = doc(db, 'users', firebaseUser.uid, 'programs', newProgram.id);
                await setDoc(programDocRef, serializeProgram(newProgram));
                
                // Update active program ID in user doc
                const userDocRef = doc(db, 'users', firebaseUser.uid);
                await updateDoc(userDocRef, { activeProgramId: newProgram.id });
            } catch (error) {
                console.error("Error creating program in Firestore:", error);
            }
        }
    };

    const deleteProgram = async () => {
        if (program) {
            const archivedProgram: Program = {
                ...program,
                archivedDate: new Date().toISOString()
            };
            setProgramHistory(prevHistory => [archivedProgram, ...prevHistory]);
            
            if (firebaseUser) {
                try {
                    // Update the program in subcollection to be archived
                    const programDocRef = doc(db, 'users', firebaseUser.uid, 'programs', program.id);
                    await updateDoc(programDocRef, { archivedDate: archivedProgram.archivedDate });
                    
                    // Remove active program ID from user doc
                    const userDocRef = doc(db, 'users', firebaseUser.uid);
                    await updateDoc(userDocRef, { activeProgramId: null }); // Or delete field
                } catch (error) {
                    console.error("Error archiving program:", error);
                }
            }
        }
        setProgram(null);
        setIsPaid(false);
        localStorage.removeItem('myrun_program');
        localStorage.removeItem('myrun_isPaid');
    };

    const clearHistory = async () => {
        setProgramHistory([]);
        localStorage.removeItem('myrun_program_history');
        
        if (firebaseUser) {
            try {
                // Delete all programs in subcollection that are archived?
                // Or just delete all programs except active?
                // For simplicity, let's just delete the history from local state.
                // Deleting from Firestore might require iterating.
                const programsRef = collection(db, 'users', firebaseUser.uid, 'programs');
                const q = query(programsRef);
                const snapshot = await getDocs(q);
                const batchPromises = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    if (data.archivedDate) {
                        batchPromises.push(deleteDoc(doc.ref));
                    }
                });
                await Promise.all(batchPromises);
            } catch (error) {
                console.error("Error clearing history:", error);
            }
        }
    };

    const completePayment = async () => {
        setIsPaid(true);
        setPage('home');
        // Update Firestore if needed (e.g. isPaid field in user or program)
        if (firebaseUser) {
             const userDocRef = doc(db, 'users', firebaseUser.uid);
             await updateDoc(userDocRef, { isPaid: true });
        }
    };

    const updateProgram = async (updatedProgram: Program) => {
        setProgram(updatedProgram);
        if (firebaseUser) {
            try {
                const programDocRef = doc(db, 'users', firebaseUser.uid, 'programs', updatedProgram.id);
                await setDoc(programDocRef, serializeProgram(updatedProgram), { merge: true });
            } catch (error) {
                console.error("Error updating program:", error);
            }
        }
    };
    
    const adaptProgramIntensity = async (reductionPercentage: number) => {
        if (!program || !program.vma) return;
        
        const currentVMA = program.vma;
        const newVMA = parseFloat((currentVMA * (1 - reductionPercentage / 100)).toFixed(1));
        
        // Update user VMA
        updateUser({ vma: newVMA });
        
        // Update program VMA reference
        const updatedProgram = {
            ...program,
            vma: newVMA
        };
        setProgram(updatedProgram);
        
        if (firebaseUser) {
             try {
                const programDocRef = doc(db, 'users', firebaseUser.uid, 'programs', program.id);
                await setDoc(programDocRef, serializeProgram(updatedProgram), { merge: true });
            } catch (error) {
                console.error("Error updating program intensity:", error);
            }
        }
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
        login,
        logout,
        isLoading,
        isAuthenticated: !!firebaseUser
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
