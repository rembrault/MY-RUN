import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AppContextType, Page, Program, User, Level } from '../types';
import { generatePlan } from '../services/planGenerator';

// ── Firebase Auth (connexion uniquement) ─────────────────────
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

// ── Supabase (toutes les données) ────────────────────────────
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    'https://exvprizxhiaplsrzpbci.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4dnByaXp4aGlhcGxzcnpwYmNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxMzMzNDYsImV4cCI6MjA4ODcwOTM0Nn0.a_tBO2KX9vHG-m8Z6bEWzM-7Fb4AQiVzJ6aKgaExgr4'
);

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

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPERS SÉRIALISATION — Program ↔ Supabase
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const serializeProgramForDB = (p: Program, userId: string) => ({
    id:                       p.id,
    user_id:                  userId,
    distance:                 p.distance,
    race_name:                p.raceName || null,
    race_date:                p.raceDate instanceof Date ? p.raceDate.toISOString() : p.raceDate,
    start_date:               p.startDate instanceof Date ? p.startDate.toISOString() : (p.startDate || null),
    time_objective:           p.timeObjective || null,
    level:                    p.level,
    sessions_per_week:        p.sessionsPerWeek,
    training_days:            p.trainingDays || [],
    vma:                      p.vma || null,
    total_weeks:              p.totalWeeks,
    plan_focus:               (p as any).planFocus || null,
    is_conditioning_program:  !!(p as any).isConditioningProgram,
    is_intensive_program:     !!(p as any).isIntensiveProgram,
    is_beginner_absolute:     !!(p as any).isBeginnerAbsoluteProgram,
    is_vma_program:           !!(p as any).isVMAProgram,
    is_endurance_plan:        !!(p as any).isEndurancePlan,
    is_performance_plan:      !!(p as any).isPerformancePlan,
    total_price:              (p as any).totalPrice || null,
    presentation_shown:       !!(p as any).presentationShown,
    is_paid:                  false,
    archived_date:            p.archivedDate ? new Date(p.archivedDate).toISOString() : null,
    race_info:                p.raceInfo || null,
    weeks:                    p.weeks,
});

const deserializeProgramFromDB = (row: any): Program => ({
    id:              row.id,
    distance:        row.distance,
    raceName:        row.race_name || '',
    raceDate:        new Date(row.race_date),
    startDate:       row.start_date ? new Date(row.start_date) : undefined,
    timeObjective:   row.time_objective || 'Finir',
    level:           row.level,
    sessionsPerWeek: row.sessions_per_week,
    trainingDays:    row.training_days || [],
    vma:             row.vma || undefined,
    totalWeeks:      row.total_weeks,
    weeks:           row.weeks,
    archivedDate:    row.archived_date || undefined,
    raceInfo:        row.race_info || undefined,
    ...(row.plan_focus              && { planFocus: row.plan_focus }),
    ...(row.is_conditioning_program && { isConditioningProgram: true }),
    ...(row.is_intensive_program    && { isIntensiveProgram: true }),
    ...(row.is_beginner_absolute    && { isBeginnerAbsoluteProgram: true }),
    ...(row.is_vma_program          && { isVMAProgram: true }),
    ...(row.is_endurance_plan       && { isEndurancePlan: true }),
    ...(row.is_performance_plan     && { isPerformancePlan: true }),
    ...(row.total_price             && { totalPrice: row.total_price }),
    ...(row.presentation_shown      && { presentationShown: true }),
});

const serializeUserForDB = (u: User, uid: string) => ({
    id:            uid,
    email:         u.email,
    name:          u.name || null,
    avatar:        u.avatar || null,
    weight:        u.weight || null,
    height:        u.height || null,
    birth_date:    u.birthDate || null,
    level:         u.level || null,
    vma:           u.vma || null,
    has_onboarded: !!(u as any).hasOnboarded,
    is_paid:       !!(u as any).isPaid,
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// APP PROVIDER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [user, setUser] = useState<User>(() => {
        try {
            const saved = localStorage.getItem('myrun_user');
            return saved ? JSON.parse(saved) : initialUser;
        } catch { return initialUser; }
    });

    const [program, setProgram] = useState<Program | null>(() => {
        try {
            const saved = localStorage.getItem('myrun_program');
            if (!saved) return null;
            const parsed = JSON.parse(saved);
            parsed.raceDate = new Date(parsed.raceDate);
            if (parsed.startDate) parsed.startDate = new Date(parsed.startDate);
            return parsed;
        } catch { return null; }
    });

    const [hasOnboarded, setHasOnboarded] = useState<boolean>(() => {
        try { return JSON.parse(localStorage.getItem('myrun_hasOnboarded') || 'false'); }
        catch { return false; }
    });

    const [programHistory, setProgramHistory] = useState<Program[]>(() => {
        try {
            const saved = localStorage.getItem('myrun_program_history');
            if (!saved) return [];
            return JSON.parse(saved).map((p: Program) => ({
                ...p,
                raceDate: new Date(p.raceDate),
                startDate: p.startDate ? new Date(p.startDate) : undefined,
            }));
        } catch { return []; }
    });

    const [isPaid, setIsPaid] = useState<boolean>(() => {
        try { return JSON.parse(localStorage.getItem('myrun_isPaid') || 'false'); }
        catch { return false; }
    });

    const [page, setPage] = useState<Page>(program ? 'home' : 'welcome');
    const [viewedProgram, setViewedProgram] = useState<Program | null>(null);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // LISTENER AUTH — Firebase détecte connexion → charge Supabase
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setFirebaseUser(currentUser);
            setIsLoading(true);

            if (currentUser) {
                try {
                    // 1. Charger profil utilisateur
                    const { data: userData, error: userError } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', currentUser.uid)
                        .single();

                    if (userError?.code === 'PGRST116') {
                        // Nouvel utilisateur → créer dans Supabase
                        await supabase.from('users').insert({
                            id:            currentUser.uid,
                            email:         currentUser.email || '',
                            name:          currentUser.displayName || '',
                            avatar:        currentUser.photoURL || 'https://picsum.photos/200',
                            has_onboarded: false,
                            is_paid:       false,
                            level:         'Débutant',
                            vma:           0,
                        });
                        setUser({
                            ...initialUser,
                            email:  currentUser.email || '',
                            name:   currentUser.displayName || '',
                            avatar: currentUser.photoURL || 'https://picsum.photos/200',
                        });
                        setHasOnboarded(false);

                    } else if (userData) {
                        // Utilisateur existant → hydrater
                        setUser({
                            name:      userData.name || '',
                            email:     userData.email || '',
                            avatar:    userData.avatar || 'https://picsum.photos/200',
                            weight:    userData.weight || 0,
                            height:    userData.height || 0,
                            birthDate: userData.birth_date || '',
                            level:     userData.level || Level.Beginner,
                            vma:       userData.vma || 0,
                        });
                        setHasOnboarded(userData.has_onboarded || false);
                        setIsPaid(userData.is_paid || false);

                        // 2. Programme actif
                        if (userData.active_program_id) {
                            const { data: progData } = await supabase
                                .from('programs')
                                .select('*')
                                .eq('id', userData.active_program_id)
                                .single();
                            if (progData) {
                                const prog = deserializeProgramFromDB(progData);
                                setProgram(prog);
                                setIsPaid(progData.is_paid || false);
                            }
                        } else {
                            setProgram(null);
                        }

                        // 3. Historique programmes archivés
                        const { data: historyData } = await supabase
                            .from('programs')
                            .select('*')
                            .eq('user_id', currentUser.uid)
                            .not('archived_date', 'is', null)
                            .order('archived_date', { ascending: false });

                        if (historyData) {
                            setProgramHistory(historyData.map(deserializeProgramFromDB));
                        }
                    }
                } catch (error) {
                    console.error('Supabase load error:', error);
                }
            } else {
                setProgram(null);
                setProgramHistory([]);
                setHasOnboarded(false);
                setIsPaid(false);
            }

            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // ── Sync localStorage (cache offline) ─────────────────────
    useEffect(() => { localStorage.setItem('myrun_user', JSON.stringify(user)); }, [user]);
    useEffect(() => {
        localStorage.setItem('myrun_program', JSON.stringify(program));
        if (program && page === 'welcome') setPage('home');
        else if (!program && page.startsWith('week-')) setPage('welcome');
    }, [program, page]);
    useEffect(() => { localStorage.setItem('myrun_program_history', JSON.stringify(programHistory)); }, [programHistory]);
    useEffect(() => { localStorage.setItem('myrun_isPaid', JSON.stringify(isPaid)); }, [isPaid]);
    useEffect(() => { localStorage.setItem('myrun_hasOnboarded', JSON.stringify(hasOnboarded)); }, [hasOnboarded]);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // AUTH
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const login = async () => {
        try { await signInWithPopup(auth, googleProvider); }
        catch (error) { console.error('Login failed:', error); }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            setFirebaseUser(null);
            setUser(initialUser);
            setProgram(null);
            setProgramHistory([]);
            setHasOnboarded(false);
            setIsPaid(false);
            localStorage.clear();
            setPage('welcome');
        } catch (error) { console.error('Logout failed:', error); }
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // USER
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const updateUser = async (userData: Partial<User>) => {
        const newUser = { ...user, ...userData };
        setUser(newUser);
        if (!firebaseUser) return;
        try {
            await supabase.from('users').upsert(serializeUserForDB(newUser, firebaseUser.uid));
        } catch (error) { console.error('Error updating user:', error); }
    };

    const completeOnboarding = async () => {
        setHasOnboarded(true);
        setPage('welcome');
        if (!firebaseUser) return;
        try {
            await supabase.from('users').update({ has_onboarded: true }).eq('id', firebaseUser.uid);
        } catch (error) { console.error('Error completing onboarding:', error); }
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PROGRAMS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    // createProgram — génère + sauvegarde (rétrocompat)
    const createProgram = async (
        settings: Omit<Program, 'id' | 'weeks' | 'totalWeeks'> & { vma?: number; raceInfo?: Program['raceInfo'] }
    ) => {
        const newProgram = generatePlan(settings);
        await saveProgram(newProgram);
    };

    // saveProgram — sauvegarde un programme déjà généré
    const saveProgram = async (newProgram: Program) => {
        setProgram(newProgram);
        setIsPaid(false);
        if (!firebaseUser) return;
        try {
            await supabase
                .from('programs')
                .upsert(serializeProgramForDB(newProgram, firebaseUser.uid));
            await supabase
                .from('users')
                .update({ active_program_id: newProgram.id })
                .eq('id', firebaseUser.uid);
        } catch (error) { console.error('Error saving program:', error); }
    };

    // updateProgram — met à jour les séances (feedback, completion)
    const updateProgram = async (updatedProgram: Program) => {
        setProgram(updatedProgram);
        if (!firebaseUser) return;
        try {
            await supabase
                .from('programs')
                .update({
                    weeks:              updatedProgram.weeks,
                    presentation_shown: !!(updatedProgram as any).presentationShown,
                })
                .eq('id', updatedProgram.id)
                .eq('user_id', firebaseUser.uid);
        } catch (error) { console.error('Error updating program:', error); }
    };

    // deleteProgram — archive le programme actif
    const deleteProgram = async () => {
        if (!program) return;
        const archivedDate = new Date().toISOString();
        const archivedProgram: Program = { ...program, archivedDate };
        setProgramHistory(prev => [archivedProgram, ...prev]);

        if (firebaseUser) {
            try {
                await supabase
                    .from('programs')
                    .update({ archived_date: archivedDate })
                    .eq('id', program.id)
                    .eq('user_id', firebaseUser.uid);
                await supabase
                    .from('users')
                    .update({ active_program_id: null })
                    .eq('id', firebaseUser.uid);
            } catch (error) { console.error('Error archiving program:', error); }
        }

        setProgram(null);
        setIsPaid(false);
        localStorage.removeItem('myrun_program');
        localStorage.removeItem('myrun_isPaid');
    };

    // clearHistory — supprime tous les programmes archivés
    const clearHistory = async () => {
        setProgramHistory([]);
        localStorage.removeItem('myrun_program_history');
        if (!firebaseUser) return;
        try {
            await supabase
                .from('programs')
                .delete()
                .eq('user_id', firebaseUser.uid)
                .not('archived_date', 'is', null);
        } catch (error) { console.error('Error clearing history:', error); }
    };

    // completePayment — marque le programme et l'utilisateur comme payés
    const completePayment = async () => {
        setIsPaid(true);
        setPage('home');
        if (!firebaseUser || !program) return;
        try {
            await supabase
                .from('programs')
                .update({ is_paid: true })
                .eq('id', program.id)
                .eq('user_id', firebaseUser.uid);
            await supabase
                .from('users')
                .update({ is_paid: true })
                .eq('id', firebaseUser.uid);
        } catch (error) { console.error('Error completing payment:', error); }
    };

    // adaptProgramIntensity — réduit la VMA suite à un feedback "difficile"
    const adaptProgramIntensity = async (reductionPercentage: number) => {
        if (!program || !program.vma) return;
        const newVMA = parseFloat((program.vma * (1 - reductionPercentage / 100)).toFixed(1));
        const updatedProgram = { ...program, vma: newVMA };
        setProgram(updatedProgram);
        await updateUser({ vma: newVMA });
        if (!firebaseUser) return;
        try {
            await supabase
                .from('programs')
                .update({ vma: newVMA, weeks: updatedProgram.weeks })
                .eq('id', program.id)
                .eq('user_id', firebaseUser.uid);
        } catch (error) { console.error('Error adapting intensity:', error); }
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // CONTEXT VALUE
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

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
        saveProgram,
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
        isAuthenticated: !!firebaseUser,
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
