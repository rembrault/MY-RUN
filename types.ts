
export enum Distance {
    TenK = '10km',
    HalfMarathon = 'Semi-Marathon',
    Marathon = 'Marathon',
}

export enum Level {
    Beginner = 'Débutant',
    Intermediate = 'Intermédiaire',
    Advanced = 'Avancé',
}

export interface WorkoutBlock {
    type: 'Échauffement' | 'Corps de séance' | 'Retour au calme' | 'Info';
    duration?: number; // in minutes
    distance?: number; // in km
    details: string;
}

export interface Session {
    id: string;
    day: string; // Lundi, Mardi, etc.
    type: 'Endurance' | 'Fractionné' | 'Sortie longue' | 'Repos' | 'Course à rythme' | 'Côtes';
    title: string;
    duration?: number; // in minutes
    distance?: number; // in km
    structure: WorkoutBlock[];
    completed: boolean;
}

export interface Week {
    weekNumber: number;
    title: string;
    sessions: Session[];
    totalKm: number;
    sessionsCount: number;
}

export interface Program {
    id: string;
    distance: Distance;
    level: Level;
    raceName: string;
    raceDate: Date;
    sessionsPerWeek: number;
    timeObjective: string;
    vma?: number;
    weeks: Week[];
    totalWeeks: number;
    archivedDate?: string;
    raceInfo?: {
        name: string;
        date: string;
        elevation: number;
    }
}

export interface User {
    name: string;
    email: string;
    avatar: string;
    weight: number;
    height: number;
    birthDate: string;
    level: Level;
    vma?: number;
}

export type Page = 'welcome' | 'new-program' | 'home' | 'profile' | 'edit-profile' | 'payment' | 'calendar' | 'vma-calculator' | `week-${number}` | 'program-view';

export interface AppContextType {
    user: User;
    program: Program | null;
    isPaid: boolean;
    page: Page;
    programHistory: Program[];
    viewedProgram: Program | null;
    setPage: (page: Page) => void;
    updateUser: (userData: Partial<User>) => void;
    createProgram: (settings: Omit<Program, 'id' | 'weeks' | 'totalWeeks'> & { vma?: number, raceInfo?: Program['raceInfo'] }) => void;
    deleteProgram: () => void;
    completePayment: () => void;
    updateProgram: (updatedProgram: Program) => void;
    setViewedProgram: (program: Program | null) => void;
}
    