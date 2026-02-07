
import { Program, Week, Session, Distance, Level, WorkoutBlock } from '../types';

const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

// --- Helpers de calcul d'allure ---
const getPace = (vma: number, percentage: number): string => {
    if (!vma || vma <= 0) return 'N/A';
    const speed = vma * (percentage / 100); // km/h
    const paceDec = 60 / speed; // min/km
    const min = Math.floor(paceDec);
    const sec = Math.round((paceDec - min) * 60);
    return `${min}'${sec.toString().padStart(2, '0')}"`;
};

const getPaceRange = (vma: number, minP: number, maxP: number): string => {
    return `${getPace(vma, maxP)} - ${getPace(vma, minP)}/km`;
};

// --- GÉNÉRATEURS DE SÉANCES INTELLIGENTS ---

const generateIntervalSession = (weekNum: number, level: Level, vma: number, distance: Distance, isRecovery: boolean): WorkoutBlock[] => {
    const warmupDuration = isRecovery ? 15 : 20;
    const warmup = { type: 'Échauffement' as const, duration: warmupDuration, details: `${warmupDuration}' Footing progressif + Gammes` };
    const cooldown = { type: 'Retour au calme' as const, duration: 10, details: '10\' Retour au calme très souple' };
    
    let core: WorkoutBlock;
    let recoveryInfos: WorkoutBlock = { type: 'Info', details: 'Récupération active en trottinant.' };

    if (isRecovery) {
        // Semaine d'assimilation : VMA allégée
        core = { type: 'Corps de séance', details: `10x 30"/30" à 95% VMA. Restez fluide.` };
        return [warmup, core, cooldown];
    }

    // Cycle de variation (1: Court, 2: Moyen/Pyramide, 3: Long/Spécifique, 0: Récup)
    const cycleType = weekNum % 4; 

    if (distance === Distance.TenK) {
        if (cycleType === 1) { // VMA Courte
            const sets = level === Level.Beginner ? '2x(6x 30"/30")' : '2x(10x 30"/30")';
            core = { type: 'Corps de séance', details: `${sets} à 105% VMA. R=2' entre blocs.` };
        } else if (cycleType === 2) { // VMA Moyenne / 400m
             const reps = level === Level.Beginner ? 6 : level === Level.Advanced ? 10 : 8;
             core = { type: 'Corps de séance', details: `${reps}x 400m en ${getPace(vma, 95)}. R=1'15.` };
        } else { // Pyramide ou 1000m
             core = { type: 'Corps de séance', details: `Pyramide: 200-400-600-400-200m. Vite ! R=temps d'effort.` };
        }
    } else {
        // Semi et Marathon : Focus Seuil et Côtes
        if (cycleType === 1) { // Côtes
             const reps = level === Level.Beginner ? '6' : '10';
             core = { type: 'Corps de séance', details: `${reps}x 45" vite en côte. Récup descente cool.` };
        } else if (cycleType === 2) { // Seuil long
             const reps = level === Level.Beginner ? 3 : 5;
             core = { type: 'Corps de séance', details: `${reps}x 1000m à allure 10km. R=2'.` };
        } else { // Pyramide inversée ou Fartlek
             core = { type: 'Corps de séance', details: `Fartlek : 3'-2'-1'-3'-2'-1' rapide. R=1' trot.` };
        }
    }

    return [warmup, core, recoveryInfos, cooldown];
};

const generateTempoSession = (weekNum: number, level: Level, vma: number, distance: Distance, isRecovery: boolean): WorkoutBlock[] => {
    // Allure cible
    const pace = distance === Distance.Marathon ? getPaceRange(vma, 75, 80) : getPaceRange(vma, 80, 85);
    
    if (isRecovery) {
         return [{ type: 'Corps de séance', duration: 40, details: `Footing en endurance fondamentale uniquement (${getPaceRange(vma, 65, 70)}).` }];
    }

    const warmup = { type: 'Échauffement' as const, duration: 15, details: '15\' Footing + 3 accélérations' };
    const cooldown = { type: 'Retour au calme' as const, duration: 10, details: '10\' RAC' };

    let core: WorkoutBlock;

    // Progression du volume d'allure
    if (weekNum % 2 !== 0) {
        // Blocs longs
        const blocTime = Math.min(20, 10 + Math.floor(weekNum/2));
        core = { type: 'Corps de séance', details: `2x ${blocTime}' allure spécifique cible (${pace}). R=2'.` };
    } else {
        // Continu
        const duration = Math.min(40, 20 + weekNum);
        core = { type: 'Corps de séance', details: `${duration}' allure spécifique cible (${pace}) d'une traite.` };
    }

    return [warmup, core, cooldown];
};

const generateLongRun = (weekNum: number, level: Level, totalWeeks: number, vma: number, distance: Distance, isRecovery: boolean): WorkoutBlock[] => {
    // Durée progressive
    let baseMin = level === Level.Beginner ? 50 : 70;
    if (isRecovery) baseMin -= 15;
    
    // Augmentation progressive : +5 min par cycle de charge, reset léger en récup
    const increase = isRecovery ? 0 : (weekNum * 5);
    let currentDuration = baseMin + increase;

    // Plafonds (1h30 pour 10k, 2h pour Semi, 3h pour Marathon)
    const maxDuration = distance === Distance.Marathon ? 180 : distance === Distance.HalfMarathon ? 130 : 90;
    currentDuration = Math.min(currentDuration, maxDuration);

    const efPace = getPaceRange(vma, 65, 70);
    const specificPace = distance === Distance.Marathon ? getPace(vma, 80) : getPace(vma, 85);

    const blocks: WorkoutBlock[] = [];

    // Intégration de blocs d'allure dans la sortie longue (1 semaine sur 2, sauf récup)
    if (!isRecovery && weekNum % 2 === 0 && weekNum < totalWeeks - 1) {
        const activeBlockTime = Math.min(40, weekNum * 3);
        blocks.push({ type: 'Échauffement', duration: 20, details: `20' Endurance fondamentale (${efPace}).` });
        blocks.push({ type: 'Corps de séance', details: `Corps de séance : ${activeBlockTime}' allure course (${specificPace}) inclus.` });
        blocks.push({ type: 'Retour au calme', duration: currentDuration - 20 - activeBlockTime, details: 'Finir en endurance douce.' });
    } else {
        blocks.push({ type: 'Corps de séance', duration: currentDuration, details: `Sortie longue classique en aisance respiratoire (${efPace}).` });
    }

    return blocks;
};

export const generatePlan = (settings: Omit<Program, 'id' | 'weeks' | 'totalWeeks'> & { vma?: number, raceInfo?: Program['raceInfo'] }): Program => {
    const { distance, level, sessionsPerWeek, raceDate, vma = 14 } = settings;

    const today = new Date();
    const totalDays = Math.ceil((raceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.max(4, Math.floor(totalDays / 7)); 
    
    const weeks: Week[] = [];

    // Jours d'entraînement
    const trainingDays = sessionsPerWeek === 2 ? ['Mercredi', 'Dimanche'] 
                       : sessionsPerWeek === 3 ? ['Mardi', 'Jeudi', 'Dimanche']
                       : ['Mardi', 'Mercredi', 'Vendredi', 'Dimanche'];

    for (let i = 1; i <= totalWeeks; i++) {
        const sessions: Session[] = [];
        
        // Logique de Périodisation
        // Semaine 4, 8, 12... sont des semaines de récupération (sauf si c'est la course)
        const isTaper = i >= totalWeeks - 1;
        const isRecovery = !isTaper && (i % 4 === 0);

        trainingDays.forEach(day => {
            let type: Session['type'] = 'Endurance';
            let blocks: WorkoutBlock[] = [];
            let title = "Footing";

            if (day === 'Dimanche') {
                type = 'Sortie longue';
                title = isRecovery ? "Sortie Longue Cool" : "La Sortie Longue";
                if (isTaper) {
                     blocks = [{ type: 'Corps de séance', duration: i === totalWeeks ? 30 : 50, details: "Footing léger. On fait du jus." }];
                } else {
                    blocks = generateLongRun(i, level, totalWeeks, vma, distance, isRecovery);
                }
            } 
            else if (day === 'Mardi' || (sessionsPerWeek === 2 && day === 'Mercredi')) {
                // Qualité (VMA / Côtes)
                if (isTaper) {
                     type = 'Course à rythme';
                     title = "Rappel d'allure";
                     blocks = [{type: 'Corps de séance', details: "20' footing + 1km allure course + 10' cool."}];
                } else {
                    type = 'Fractionné';
                    title = "VMA & Intensité";
                    blocks = generateIntervalSession(i, level, vma, distance, isRecovery);
                }
            } 
            else if (day === 'Jeudi' || day === 'Mercredi') {
                // Allure spécifique ou Endurance
                if (sessionsPerWeek >= 3 && day === 'Jeudi') {
                     type = 'Course à rythme';
                     title = "Allure Spécifique";
                     blocks = generateTempoSession(i, level, vma, distance, isRecovery);
                } else {
                     type = 'Endurance';
                     title = "Footing";
                     blocks = [{ type: 'Corps de séance', duration: 45, details: "45' en endurance fondamentale." }];
                }
            } 
            else {
                // Footing cool
                type = 'Endurance';
                title = "Footing de Récupération";
                blocks = [{ type: 'Corps de séance', duration: 40, details: `Footing très cool (${getPaceRange(vma, 60, 65)}).` }];
            }

            // Estimation distance/durée pour l'affichage
            let totalMins = 0;
            blocks.forEach(b => totalMins += b.duration || 20); // Fallback
            const dist = Math.round((totalMins / 60) * (type === 'Fractionné' ? vma * 0.8 : vma * 0.7));

            sessions.push({
                id: `s-${i}-${day}`,
                day,
                type,
                title,
                structure: blocks,
                completed: false,
                duration: totalMins,
                distance: dist
            });
        });

        // Remplissage jours de repos
        daysOfWeek.forEach(d => {
            if (!trainingDays.includes(d)) {
                sessions.push({
                    id: `r-${i}-${d}`,
                    day: d,
                    type: 'Repos',
                    title: 'Récupération',
                    structure: [{ type: 'Info', details: 'Repos complet.' }],
                    completed: false
                });
            }
        });

        sessions.sort((a, b) => daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day));

        // Nommage de la semaine
        let weekTitle = `Cycle de Développement - Semaine ${i}`;
        if (isRecovery) weekTitle = "Semaine d'Assimilation";
        if (isTaper) weekTitle = "Affûtage (Jusqu'au jour J)";

        weeks.push({
            weekNumber: i,
            title: weekTitle,
            sessions,
            totalKm: sessions.reduce((sum, s) => sum + (s.distance || 0), 0),
            sessionsCount: sessionsPerWeek
        });
    }

    return {
        id: new Date().toISOString(),
        ...settings,
        weeks,
        totalWeeks
    };
};
