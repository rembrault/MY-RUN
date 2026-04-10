import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { AppContextType, Page, Program, User, Level } from '../types';
import { generatePlan } from '../services/planGenerator';
import { supabase } from '../supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

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
    const [authUser, setAuthUser] = useState<SupabaseUser | null>(null);
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
    const [previousPage, setPreviousPage] = useState<Page | null>(null);
    const [questionnaireStep, setQuestionnaireStep] = useState<number>(1);
    const [viewedProgram, setViewedProgram] = useState<Program | null>(null);

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // LISTENER AUTH — Supabase détecte connexion → charge données
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const loadUserData = async (supabaseUser: SupabaseUser) => {
        try {
            // 1. Charger profil utilisateur
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', supabaseUser.id)
                .single();

            if (userError?.code === 'PGRST116') {
                // Nouvel utilisateur → créer dans Supabase
                await supabase.from('users').insert({
                    id:            supabaseUser.id,
                    email:         supabaseUser.email || '',
                    name:          supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || '',
                    avatar:        supabaseUser.user_metadata?.avatar_url || 'https://picsum.photos/200',
                    has_onboarded: false,
                    is_paid:       false,
                    level:         'Débutant',
                    vma:           0,
                });
                setUser({
                    ...initialUser,
                    email:  supabaseUser.email || '',
                    name:   supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || '',
                    avatar: supabaseUser.user_metadata?.avatar_url || 'https://picsum.photos/200',
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
                    .eq('user_id', supabaseUser.id)
                    .not('archived_date', 'is', null)
                    .order('archived_date', { ascending: false });

                if (historyData) {
                    setProgramHistory(historyData.map(deserializeProgramFromDB));
                }

                // Rediriger vers home si l'utilisateur a un programme et a terminé l'onboarding
                if (userData.has_onboarded && userData.active_program_id) {
                    setPage('home');
                }
            }
        } catch (error) {
            console.error('Supabase load error:', error);
        }
    };

    useEffect(() => {
        let initialLoadDone = false;

        // Timeout de sécurité : si Supabase ne répond pas en 4s, on arrête le loading
        const safetyTimeout = setTimeout(() => {
            setIsLoading(false);
        }, 4000);

        // Vérifier la session existante au chargement
        supabase.auth.getSession().then(({ data: { session } }) => {
            clearTimeout(safetyTimeout);
            const currentUser = session?.user ?? null;
            setAuthUser(currentUser);
            if (currentUser) {
                loadUserData(currentUser).finally(() => {
                    initialLoadDone = true;
                    setIsLoading(false);
                });
            } else {
                initialLoadDone = true;
                setIsLoading(false);
            }
        }).catch(() => {
            clearTimeout(safetyTimeout);
            initialLoadDone = true;
            setIsLoading(false);
        });

        // Écouter les changements d'auth (connexion, déconnexion, refresh token)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                const currentUser = session?.user ?? null;
                setAuthUser(currentUser);

                if (event === 'SIGNED_IN' && currentUser) {
                    // Éviter le double chargement si getSession() a déjà chargé les données
                    if (initialLoadDone) return;
                    setIsLoading(true);
                    await loadUserData(currentUser);
                    initialLoadDone = true;
                    setIsLoading(false);
                }

                if (event === 'SIGNED_OUT') {
                    initialLoadDone = false;
                    setUser(initialUser);
                    setProgram(null);
                    setProgramHistory([]);
                    setHasOnboarded(false);
                    setIsPaid(false);
                    localStorage.clear();
                    setPage('welcome');
                }
            }
        );

        return () => {
            clearTimeout(safetyTimeout);
            subscription.unsubscribe();
        };
    }, []);

    // ── Détection retour Stripe Checkout ───────────────────────
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('payment') === 'success' && authUser) {
            // Marquer le programme comme payé dans Supabase
            const programId = params.get('program_id');
            if (programId) {
                supabase
                    .from('programs')
                    .update({ is_paid: true })
                    .eq('id', programId)
                    .eq('user_id', authUser.id)
                    .then(() => {
                        setIsPaid(true);
                        setPage('home');
                    });

                supabase
                    .from('payments')
                    .insert({
                        user_id: authUser.id,
                        program_id: programId,
                        amount: 0, // Le montant réel est dans Stripe
                        status: 'completed',
                        stripe_session_id: params.get('session_id') || 'checkout_redirect',
                    })
                    .then(() => {});
            }
            // Nettoyer l'URL
            window.history.replaceState({}, '', window.location.pathname);
        }
        if (params.get('payment') === 'cancelled') {
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, [authUser]);

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
        try {
            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: window.location.origin },
            });
        } catch (error) { console.error('Login failed:', error); }
    };

    const logout = async () => {
        try {
            await supabase.auth.signOut();
            // Le listener onAuthStateChange gère le nettoyage
        } catch (error) { console.error('Logout failed:', error); }
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // USER
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const updateUser = async (userData: Partial<User>) => {
        const newUser = { ...user, ...userData };
        setUser(newUser);
        if (!authUser) return;
        try {
            await supabase.from('users').upsert(serializeUserForDB(newUser, authUser.id), { onConflict: 'id' });
        } catch (error) { console.error('Error updating user:', error); }
    };

    const completeOnboarding = async () => {
        setHasOnboarded(true);
        setPage('welcome');
        if (!authUser) return;
        try {
            await supabase.from('users').update({ has_onboarded: true }).eq('id', authUser.id);
        } catch (error) { console.error('Error completing onboarding:', error); }
    };

    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // PROGRAMS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    const createProgram = async (
        settings: Omit<Program, 'id' | 'weeks' | 'totalWeeks'> & { vma?: number; raceInfo?: Program['raceInfo'] }
    ) => {
        const newProgram = generatePlan(settings);
        await saveProgram(newProgram);
    };

    const saveProgram = async (newProgram: Program) => {
        setProgram(newProgram);
        setIsPaid(false);
        if (!authUser) return;
        try {
            await supabase
                .from('programs')
                .upsert(serializeProgramForDB(newProgram, authUser.id), { onConflict: 'id' });
            await supabase
                .from('users')
                .update({ active_program_id: newProgram.id })
                .eq('id', authUser.id);
        } catch (error) { console.error('Error saving program:', error); }
    };

    const updateProgram = async (updatedProgram: Program) => {
        setProgram(updatedProgram);
        if (!authUser) return;
        try {
            await supabase
                .from('programs')
                .update({
                    weeks:              updatedProgram.weeks,
                    presentation_shown: !!(updatedProgram as any).presentationShown,
                })
                .eq('id', updatedProgram.id)
                .eq('user_id', authUser.id);
        } catch (error) { console.error('Error updating program:', error); }
    };

    const deleteProgram = async () => {
        if (!program) return;
        const archivedDate = new Date().toISOString();
        const archivedProgram: Program = { ...program, archivedDate };
        setProgramHistory(prev => [archivedProgram, ...prev]);

        if (authUser) {
            try {
                await supabase
                    .from('programs')
                    .update({ archived_date: archivedDate })
                    .eq('id', program.id)
                    .eq('user_id', authUser.id);
                await supabase
                    .from('users')
                    .update({ active_program_id: null })
                    .eq('id', authUser.id);
            } catch (error) { console.error('Error archiving program:', error); }
        }

        setProgram(null);
        setIsPaid(false);
        localStorage.removeItem('myrun_program');
        localStorage.removeItem('myrun_isPaid');
    };

    const clearHistory = async () => {
        setProgramHistory([]);
        localStorage.removeItem('myrun_program_history');
        if (!authUser) return;
        try {
            await supabase
                .from('programs')
                .delete()
                .eq('user_id', authUser.id)
                .not('archived_date', 'is', null);
        } catch (error) { console.error('Error clearing history:', error); }
    };

    const completePayment = async () => {
        setIsPaid(true);
        setPage('home');
        if (!authUser || !program) return;
        try {
            await supabase
                .from('programs')
                .update({ is_paid: true })
                .eq('id', program.id)
                .eq('user_id', authUser.id);
            await supabase
                .from('users')
                .update({ is_paid: true })
                .eq('id', authUser.id);
        } catch (error) { console.error('Error completing payment:', error); }
    };

    const adaptProgramIntensity = async (reductionPercentage: number) => {
        if (!program || !program.vma) return;
        const newVMA = parseFloat((program.vma * (1 - reductionPercentage / 100)).toFixed(1));
        const updatedProgram = { ...program, vma: newVMA };
        setProgram(updatedProgram);
        await updateUser({ vma: newVMA });
        if (!authUser) return;
        try {
            await supabase
                .from('programs')
                .update({ vma: newVMA, weeks: updatedProgram.weeks })
                .eq('id', program.id)
                .eq('user_id', authUser.id);
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
        previousPage,
        setPreviousPage,
        questionnaireStep,
        setQuestionnaireStep,
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
        isAuthenticated: !!authUser,
        authUser,
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
