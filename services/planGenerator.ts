
import { Program, Week, Session, Distance, Level, WorkoutBlock } from '../types';

const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

// --- Pace Calculation Helpers ---

const getPaceFromVMA = (vma: number, percentage: number): string => {
    if (!vma || vma <= 0) return 'N/A';
    const speed = vma * (percentage / 100);
    const paceInMinutes = 60 / speed;
    const minutes = Math.floor(paceInMinutes);
    const seconds = Math.round((paceInMinutes - minutes) * 60);
    return `${minutes}'${seconds.toString().padStart(2, '0')}"`;
};

const getPaceRange = (vma: number, minPercent: number, maxPercent: number): string => {
    if (!vma || vma <= 0) return '';
    const paceSlower = getPaceFromVMA(vma, minPercent);
    const paceFaster = getPaceFromVMA(vma, maxPercent);
    return `(Allure: ${paceFaster} - ${paceSlower} /km)`;
};


// --- Detailed Session Generators ---

const getHillSession = (week: number, level: Level, vma: number): WorkoutBlock[] => {
    const warmup = { type: 'Échauffement' as const, duration: 20, details: 'Footing lent sur terrain plat.' };
    const cooldown = { type: 'Retour au calme' as const, duration: 15, details: 'Footing très lent et étirements.'};
    let core: WorkoutBlock;

    const reps = 4 + week;
    if (level === Level.Beginner) {
        core = { type: 'Corps de séance' as const, details: `${reps}x 45 secondes en côte (pente 5-7%). Récupération en descendant.` };
    } else if (level === Level.Intermediate) {
        core = { type: 'Corps de séance' as const, details: `${reps}x 1 minute en côte (pente 5-7%). Récupération en descendant.` };
    } else { // Advanced
        core = { type: 'Corps de séance' as const, details: `${reps}x 90 secondes en côte (pente 5-7%). Récupération en descendant.` };
    }
    return [warmup, core, cooldown];
};

const getIntervalSession = (week: number, level: Level, vma: number): WorkoutBlock[] => {
    const warmup = { type: 'Échauffement' as const, duration: 20, details: 'Footing lent + éducatifs (montées de genoux, talons-fesses).' };
    const cooldown = { type: 'Retour au calme' as const, duration: 10, details: 'Footing très lent + étirements légers.'};
    
    let core: WorkoutBlock;
    let recovery: WorkoutBlock;

    if (level === Level.Beginner) {
        const reps = 4 + Math.floor(week / 3);
        core = { type: 'Corps de séance' as const, details: `${reps}x 400m ${getPaceRange(vma, 95, 100)}.` };
        recovery = { type: 'Info' as const, details: `Récupération: 1'30" à 2'00" marchée entre chaque effort.` };
    } else if (level === Level.Intermediate) {
        const reps = 6 + Math.floor(week / 2);
        core = { type: 'Corps de séance' as const, details: `${reps}x 500m ${getPaceRange(vma, 92, 98)}.` };
        recovery = { type: 'Info' as const, details: `Récupération: 1'15" footing lent entre chaque effort.` };
    } else { // Advanced
        if (week % 2 === 0) {
            const reps = 8 + Math.floor(week / 2);
            core = { type: 'Corps de séance' as const, details: `${reps}x 400m ${getPaceRange(vma, 100, 105)}.` };
            recovery = { type: 'Info' as const, details: `Récupération: 1'00" sur place entre chaque effort.` };
        } else {
            core = { type: 'Corps de séance' as const, details: `Pyramide: 200-400-600-800-600-400-200m ${getPaceRange(vma, 98, 102)}.` };
            recovery = { type: 'Info' as const, details: `Récupération: moitié du temps d'effort en footing.` };
        }
    }

    return [warmup, core, recovery, cooldown];
};

const getTempoSession = (week: number, level: Level, vma: number): WorkoutBlock[] => {
    const warmup = { type: 'Échauffement' as const, duration: 15, details: 'Footing très facile.' };
    const cooldown = { type: 'Retour au calme' as const, duration: 10, details: 'Footing très lent.'};
    let core: WorkoutBlock;

    if (level === Level.Beginner) {
        const tempoDuration = 15 + Math.floor(week / 2) * 5;
        core = { type: 'Corps de séance' as const, duration: tempoDuration, details: `Allure semi-marathon ${getPaceRange(vma, 80, 85)}.` };
    } else if (level === Level.Intermediate) {
        const tempoBlocks = week < 5 ? `2x ${10 + week}min` : `3x ${10 + week - 5}min`;
        core = { type: 'Corps de séance' as const, details: `${tempoBlocks} ${getPaceRange(vma, 82, 88)}, avec 3min de footing lent entre les blocs.` };
    } else { // Advanced
        const tempoDuration = 30 + week * 2;
        core = { type: 'Corps de séance' as const, details: `Intégrer ${tempoDuration}min à allure marathon ${getPaceRange(vma, 75, 82)} dans votre sortie.` };
    }
    return [warmup, core, cooldown];
};

const getLongRunSession = (week: number, level: Level, totalWeeks: number, vma: number): WorkoutBlock[] => {
    let duration = 0;
    if (level === Level.Beginner) duration = 50 + week * 5;
    if (level === Level.Intermediate) duration = 60 + week * 7;
    if (level === Level.Advanced) duration = 75 + week * 8;
    
    // Tapering
    if(week >= totalWeeks - 1) duration = Math.round(duration * 0.6);
    if(week >= totalWeeks) duration = Math.round(duration * 0.4);

    const baseDetails = `Courir à allure très lente ${getPaceRange(vma, 65, 75)}. Ne vous souciez pas de la vitesse, juste de la durée.`;
    
    if (level === Level.Advanced && week > 3 && week < totalWeeks - 2) {
        const marathonPaceDuration = 10 + week * 2;
        return [
            { type: 'Échauffement', duration: 20, details: `Footing lent ${getPaceRange(vma, 60, 70)}.` },
            { type: 'Corps de séance', details: `2x ${marathonPaceDuration}min allure marathon ${getPaceRange(vma, 78, 83)} avec 5min de footing entre les blocs.` },
            { type: 'Retour au calme', duration: 15, details: `Terminer le reste de la sortie en footing très lent.` }
        ];
    }

    return [{ type: 'Corps de séance' as const, duration: Math.min(180, duration), details: baseDetails }];
};

const getEasyRunSession = (week: number, level: Level, vma: number): WorkoutBlock[] => {
    let duration = 0;
    if (level === Level.Beginner) duration = 30 + week;
    if (level === Level.Intermediate) duration = 40 + week;
    if (level === Level.Advanced) duration = 45 + week;
    
    return [{ type: 'Corps de séance' as const, duration, details: `Footing de récupération. ${getPaceRange(vma, 60, 70)}` }];
};

const createDetailedSession = (day: string, type: Session['type'], week: number, level: Level, totalWeeks: number, vma: number): Session => {
    const sessionTitles = {
        'Endurance': 'Endurance Fondamentale',
        'Course à rythme': 'Séance de Seuil',
        'Fractionné': 'Fractionné Court (VMA)',
        'Sortie longue': 'Sortie Longue',
        'Repos': 'Jour de Repos',
        'Côtes': 'Séance de Côtes',
    };

    let structure: WorkoutBlock[] = [];
    switch (type) {
        case 'Fractionné':
            structure = getIntervalSession(week, level, vma);
            break;
        case 'Course à rythme':
            structure = getTempoSession(week, level, vma);
            break;
        case 'Sortie longue':
            structure = getLongRunSession(week, level, totalWeeks, vma);
            break;
        case 'Endurance':
            structure = getEasyRunSession(week, level, vma);
            break;
        case 'Repos':
            structure = [{ type: 'Info', details: 'Le repos est crucial pour la récupération et la progression. Profitez-en !'}];
            break;
        case 'Côtes':
            structure = getHillSession(week, level, vma);
            break;
    }
    
    const totalDuration = structure.reduce((sum, block) => sum + (block.duration || 0), 0);
    // This is a very rough estimation, VMA paces make it more complex
    const estimatedDistance = vma > 0 ? Math.round((totalDuration / 60) * (vma * 0.7)) : Math.round(totalDuration / 7);

    return {
        id: `${day}-${type}-${week}`,
        day,
        type,
        title: sessionTitles[type],
        structure,
        duration: totalDuration > 0 ? totalDuration : undefined,
        distance: estimatedDistance > 0 ? estimatedDistance : undefined,
        completed: false,
    };
};

export const generatePlan = (settings: Omit<Program, 'id' | 'weeks' | 'totalWeeks'> & { vma?: number, raceInfo?: Program['raceInfo'] }): Program => {
    const { distance, level, sessionsPerWeek, raceDate, vma = 15, raceInfo } = settings;

    const today = new Date();
    const totalDays = Math.ceil((raceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.max(8, Math.floor(totalDays / 7));
    
    const elevationThresholds = {
        [Distance.TenK]: 150,
        [Distance.HalfMarathon]: 300,
        [Distance.Marathon]: 500,
    };

    const isHillyRace = raceInfo && raceInfo.elevation > (elevationThresholds[distance] || 300);

    const weeks: Week[] = [];

    for (let i = 1; i <= totalWeeks; i++) {
        const sessions: Session[] = [];
        
        const sessionTypes: Session['type'][] = ['Endurance', 'Course à rythme', 'Fractionné'];
        const dayAssignments: string[] = [];

        if (sessionsPerWeek === 2) dayAssignments.push('Mardi', 'Samedi');
        else if (sessionsPerWeek === 3) dayAssignments.push('Mardi', 'Jeudi', 'Dimanche');
        else if (sessionsPerWeek === 4) dayAssignments.push('Mardi', 'Mercredi', 'Vendredi', 'Dimanche');
        else if (sessionsPerWeek >= 5) dayAssignments.push('Mardi', 'Mercredi', 'Jeudi', 'Samedi', 'Dimanche');

        let typeIndex = 0;
        for (const day of dayAssignments) {
            let sessionType: Session['type'];
            if (day === 'Dimanche' && sessionsPerWeek > 1) {
                sessionType = 'Sortie longue';
            } else {
                // Introduce hill sessions for hilly races in the middle of the plan
                const isHillWeek = isHillyRace && i > 2 && i < totalWeeks - 2 && (i % 2 === 0);
                if (isHillWeek && day === 'Jeudi' && sessionsPerWeek >=3) {
                     sessionType = 'Côtes';
                } else {
                    sessionType = sessionTypes[typeIndex % sessionTypes.length];
                    typeIndex++;
                }
            }
            sessions.push(createDetailedSession(day, sessionType, i, level, totalWeeks, vma));
        }
        
        const workoutDays = sessions.map(s => s.day);
        for(const day of daysOfWeek) {
            if (!workoutDays.includes(day)) {
                sessions.push(createDetailedSession(day, 'Repos', i, level, totalWeeks, vma));
            }
        }

        sessions.sort((a, b) => daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day));
        
        const totalKm = sessions.reduce((sum, s) => sum + (s.distance || 0), 0);
        
        weeks.push({
            weekNumber: i,
            title: i < 4 ? 'Introduction au volume' : i < totalWeeks - 1 ? 'Augmentation progressive' : 'Affûtage',
            sessions,
            totalKm: Math.round(totalKm),
            sessionsCount: sessionsPerWeek,
        });
    }

    return {
        id: new Date().toISOString(),
        ...settings,
        weeks,
        totalWeeks,
    };
};
    