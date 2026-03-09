
import { Program, Week, Session, Distance, Level, WorkoutBlock } from '../types';

const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

// --- Helpers de calcul d'allure ---
const getPace = (vma: number, percentage: number): string => {
    if (!vma || vma <= 0) return 'N/A';
    const speed = vma * (percentage / 100); // km/h
    const paceDec = 60 / speed; // min/km
    const min = Math.floor(paceDec);
    const sec = Math.round((paceDec - min) * 60);
    return `${min}min ${sec.toString().padStart(2, '0')}s`;
};

const getDistanceForTime = (vma: number, percentage: number, seconds: number): number => {
    const speedMs = (vma * (percentage / 100)) / 3.6;
    return Math.round(speedMs * seconds);
};

const getPaceRange = (vma: number, minP: number, maxP: number): string => {
    return `${getPace(vma, maxP)} - ${getPace(vma, minP)}/km`;
};

// --- Helpers HR Zones ---
const getHRZone = (percentage: number): string => {
    if (percentage < 70) return "Zone 1 (Endurance fondamentale)";
    if (percentage < 80) return "Zone 2 (Endurance active)";
    if (percentage < 88) return "Zone 3 (Seuil anaérobie)";
    if (percentage < 95) return "Zone 4 (Résistance dure)";
    return "Zone 5 (VMA / Sprint)";
};

// --- GÉNÉRATEURS DE SÉANCES INTELLIGENTS ---

const generateIntervalSession = (weekNum: number, level: Level, vma: number, distance: Distance, isRecovery: boolean): WorkoutBlock[] => {
    const warmupDuration = isRecovery ? 15 : 20;
    const warmup = { 
        type: 'Échauffement' as const, 
        duration: warmupDuration, 
        details: `Commencez par ${warmupDuration} minutes de footing progressif pour faire monter le cardio. Terminez par quelques gammes (talons-fesses, montées de genoux).`,
        hrZone: "Zone 1-2 (< 75% FCM)"
    };
    const cooldown = { 
        type: 'Retour au calme' as const, 
        duration: 10, 
        details: 'Terminez par 10 minutes de footing très lent pour faire redescendre le rythme cardiaque et relâcher les muscles.',
        hrZone: "Zone 1 (< 70% FCM)"
    };
    
    let core: WorkoutBlock;
    let recoveryInfos: WorkoutBlock = { type: 'Info', details: 'Récupération active en trottinant entre chaque répétition.' };

    if (isRecovery) {
        // Semaine d'assimilation : VMA allégée
        const fastDist = getDistanceForTime(vma, 95, 30);
        const slowDist = getDistanceForTime(vma, 60, 30);
        core = { 
            type: 'Corps de séance', 
            details: `Réalisez 10 répétitions de 30s/30s.\n` +
                     `- 30s rapides à 95% VMA (${getPace(vma, 95)}/km) soit ~${fastDist}m\n` +
                     `- 30s lentes à 60% VMA (${getPace(vma, 60)}/km) soit ~${slowDist}m\n` +
                     `Restez fluide et relâché, ne forcez pas à 100%.`,
            hrZone: "Zone 4 (90-95% FCM)"
        };
        return [warmup, core, cooldown];
    }

    // Cycle de variation (1: Court, 2: Moyen/Pyramide, 3: Long/Spécifique, 0: Récup)
    const cycleType = weekNum % 4; 

    if (distance === Distance.FiveK || distance === Distance.TenK) {
        if (cycleType === 1) { // VMA Courte
            const sets = level === Level.Beginner ? '2 séries de 6x' : '2 séries de 10x';
            const fastDist = getDistanceForTime(vma, 105, 30);
            const slowDist = getDistanceForTime(vma, 60, 30);
            core = { 
                type: 'Corps de séance', 
                details: `Effectuez ${sets} 30s/30s.\n` +
                         `- 30s à 105% VMA (${getPace(vma, 105)}/km) soit ~${fastDist}m\n` +
                         `- 30s récup à 60% VMA (${getPace(vma, 60)}/km) soit ~${slowDist}m\n` +
                         `Prenez 2 minutes de récupération passive (marche) entre les deux séries.`,
                hrZone: "Zone 5 (> 95% FCM)"
            };
        } else if (cycleType === 2) { // VMA Moyenne / 400m
             const reps = level === Level.Beginner ? 6 : level === Level.Advanced ? 10 : 8;
             const pace400 = getPace(vma, 95);
             // Calculate time for 400m at 95% VMA
             const speedMs = (vma * 0.95) / 3.6;
             const time400 = Math.round(400 / speedMs);
             const min400 = Math.floor(time400 / 60);
             const sec400 = time400 % 60;
             const timeStr = `${min400}'${sec400.toString().padStart(2, '0')}"`;

             core = { 
                 type: 'Corps de séance', 
                 details: `Enchaînez ${reps} fois 400m.\n` +
                          `Objectif : ${timeStr} par 400m (allure ${pace400}/km).\n` +
                          `Récupérez 1min 15s trottiné entre chaque.`,
                 hrZone: "Zone 4-5 (90-95% FCM)"
             };
        } else { // Pyramide ou 1000m
             core = { 
                 type: 'Corps de séance', 
                 details: `Pyramide : 200m - 400m - 600m - 400m - 200m.\n` +
                          `- 200m à 105% VMA (${getPace(vma, 105)}/km)\n` +
                          `- 400m à 100% VMA (${getPace(vma, 100)}/km)\n` +
                          `- 600m à 95% VMA (${getPace(vma, 95)}/km)\n` +
                          `La récupération est égale au temps d'effort trottiné.`,
                 hrZone: "Zone 4-5 (90-98% FCM)"
             };
        }
    } else {
        // Semi et Marathon : Focus Seuil et Côtes
        if (cycleType === 1) { // Côtes
             const reps = level === Level.Beginner ? '6' : '10';
             // Estimate distance for 45s uphill (slower than flat VMA, maybe 90% effort but uphill slows you down)
             // Let's assume uphill pace is roughly equivalent to flat VMA effort but slower speed.
             // We'll just give time and effort indication.
             core = { 
                 type: 'Corps de séance', 
                 details: `Trouvez une côte et faites ${reps} montées de 45 secondes dynamiques.\n` +
                          `Effort : 95% VMA (très soutenu).\n` +
                          `Redescendez en trottinant pour récupérer.`,
                 hrZone: "Zone 4 (Musculaire)"
             };
        } else if (cycleType === 2) { // Seuil long
             const reps = level === Level.Beginner ? 3 : 5;
             const pace1000 = getPace(vma, 90);
             const speedMs = (vma * 0.90) / 3.6;
             const time1000 = Math.round(1000 / speedMs);
             const min1000 = Math.floor(time1000 / 60);
             const sec1000 = time1000 % 60;
             const timeStr = `${min1000}'${sec1000.toString().padStart(2, '0')}"`;

             core = { 
                 type: 'Corps de séance', 
                 details: `Courez ${reps} fois 1000m à votre allure 10km.\n` +
                          `Objectif : ${timeStr} par 1000m (allure ${pace1000}/km).\n` +
                          `Récupérez 2 minutes entre chaque répétition.`,
                 hrZone: "Zone 4 (88-92% FCM)"
             };
        } else { // Pyramide inversée ou Fartlek
             const fastPace = getPace(vma, 90);
             core = { 
                 type: 'Corps de séance', 
                 details: `Fartlek : 3min - 2min - 1min - 3min - 2min - 1min rapide.\n` +
                          `Allure cible : ${fastPace}/km (90% VMA).\n` +
                          `Récupérez 1 minute en trottinant entre chaque accélération.`,
                 hrZone: "Zone 3-4 (85-90% FCM)"
             };
        }
    }

    return [warmup, core, recoveryInfos, cooldown];
};

const generateTempoSession = (weekNum: number, level: Level, vma: number, distance: Distance, isRecovery: boolean): WorkoutBlock[] => {
    // Allure cible
    let targetPacePercent = 80;
    if (distance === Distance.Marathon) targetPacePercent = 78; // Allure marathon approx
    if (distance === Distance.HalfMarathon) targetPacePercent = 82; // Allure semi
    if (distance === Distance.TenK) targetPacePercent = 88; // Allure 10k
    if (distance === Distance.FiveK) targetPacePercent = 92; // Allure 5k

    const pace = getPace(vma, targetPacePercent);
    
    if (isRecovery) {
         return [{ 
             type: 'Corps de séance', 
             duration: 40, 
             details: `Footing en endurance fondamentale uniquement. Profitez-en pour travailler votre foulée sans forcer. Allure : ${getPaceRange(vma, 65, 70)}.`,
             hrZone: "Zone 1-2 (65-75% FCM)"
         }];
    }

    const warmup = { 
        type: 'Échauffement' as const, 
        duration: 15, 
        details: '15 minutes de footing d\'échauffement suivies de 3 accélérations progressives sur 80m.',
        hrZone: "Zone 1-2"
    };
    const cooldown = { 
        type: 'Retour au calme' as const, 
        duration: 10, 
        details: '10 minutes de retour au calme pour faire baisser la température corporelle.',
        hrZone: "Zone 1"
    };

    let core: WorkoutBlock;

    // Progression du volume d'allure
    if (weekNum % 2 !== 0) {
        // Blocs longs fractionnés
        const blocTime = Math.min(20, 10 + Math.floor(weekNum/2));
        core = { 
            type: 'Corps de séance', 
            details: `Réalisez 2 blocs de ${blocTime} minutes à votre allure spécifique cible (${pace}). Prenez 2 minutes de récupération entre les blocs.`,
            hrZone: "Zone 3-4 (Seuil)"
        };
    } else {
        // Continu
        const duration = Math.min(40, 15 + weekNum);
        core = { 
            type: 'Corps de séance', 
            details: `Courez ${duration} minutes en continu à votre allure spécifique cible (${pace}). C'est un test de tenue d'allure.`,
            hrZone: "Zone 3-4 (Seuil)"
        };
    }

    return [warmup, core, cooldown];
};

const generateLongRun = (weekNum: number, level: Level, totalWeeks: number, vma: number, distance: Distance, isRecovery: boolean): WorkoutBlock[] => {
    // Durée progressive
    let baseMin = level === Level.Beginner ? 45 : 60;
    if (distance === Distance.FiveK) baseMin = 40;
    if (isRecovery) baseMin -= 15;
    
    // Augmentation progressive : +5 min par cycle de charge, reset léger en récup
    const increase = isRecovery ? 0 : (weekNum * 5);
    let currentDuration = baseMin + increase;

    // Plafonds (1h15 pour 5k, 1h30 pour 10k, 2h pour Semi, 3h pour Marathon)
    let maxDuration = 90;
    if (distance === Distance.FiveK) maxDuration = 75;
    if (distance === Distance.HalfMarathon) maxDuration = 130;
    if (distance === Distance.Marathon) maxDuration = 180;

    currentDuration = Math.min(currentDuration, maxDuration);

    const efPace = getPaceRange(vma, 65, 70);
    
    let specificPacePercent = 85;
    if (distance === Distance.Marathon) specificPacePercent = 80;
    if (distance === Distance.FiveK) specificPacePercent = 90;

    const specificPace = getPace(vma, specificPacePercent);

    const blocks: WorkoutBlock[] = [];

    // Intégration de blocs d'allure dans la sortie longue (1 semaine sur 2, sauf récup)
    if (!isRecovery && weekNum % 2 === 0 && weekNum < totalWeeks - 1 && distance !== Distance.FiveK) {
        const activeBlockTime = Math.min(40, weekNum * 3);
        blocks.push({ 
            type: 'Échauffement', 
            duration: 20, 
            details: `Commencez par 20 minutes en endurance fondamentale (${efPace}).`,
            hrZone: "Zone 1-2"
        });
        blocks.push({ 
            type: 'Corps de séance', 
            details: `Intégrez ${activeBlockTime} minutes à allure course (${specificPace}) au milieu de votre sortie.`,
            hrZone: "Zone 3-4"
        });
        blocks.push({ 
            type: 'Retour au calme', 
            duration: Math.max(10, currentDuration - 20 - activeBlockTime), 
            details: 'Finissez votre sortie en endurance douce pour récupérer.',
            hrZone: "Zone 1"
        });
    } else {
        blocks.push({ 
            type: 'Corps de séance', 
            duration: currentDuration, 
            details: `Sortie longue classique en aisance respiratoire totale. Vous devez pouvoir parler sans être essoufflé. Allure : ${efPace}.`,
            hrZone: "Zone 1-2 (65-75% FCM)"
        });
    }

    return blocks;
};

export const generatePlan = (settings: Omit<Program, 'id' | 'weeks' | 'totalWeeks'> & { vma?: number, raceInfo?: Program['raceInfo'] }): Program => {
    const { distance, level, sessionsPerWeek, raceDate, startDate, trainingDays, vma = 14 } = settings;

    // Use startDate if provided, otherwise today
    const start = startDate ? new Date(startDate) : new Date();
    const race = new Date(raceDate);

    const totalDays = Math.ceil((race.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.max(4, Math.floor(totalDays / 7)); 
    
    const weeks: Week[] = [];

    // Jours d'entraînement par défaut si non fournis
    let selectedDays = trainingDays && trainingDays.length === sessionsPerWeek 
        ? trainingDays 
        : (sessionsPerWeek === 2 ? ['Mercredi', 'Dimanche'] 
        : sessionsPerWeek === 3 ? ['Mardi', 'Jeudi', 'Dimanche']
        : ['Mardi', 'Mercredi', 'Vendredi', 'Dimanche']);

    // Sort days to ensure logical order in the week (Mon -> Sun)
    const dayOrder = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
    selectedDays.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));

    for (let i = 1; i <= totalWeeks; i++) {
        const sessions: Session[] = [];
        
        // Logique de Périodisation
        const isTaper = i >= totalWeeks - 1;
        const isRecovery = !isTaper && (i % 4 === 0);

        // Determine session types based on available days
        // We need to distribute: Long Run, Interval, Tempo/Endurance
        
        // Strategy:
        // 1. Long Run -> Always the last selected day (usually Sunday)
        // 2. Interval -> The first selected day (usually Tuesday)
        // 3. Tempo/Endurance -> The middle days

        const longRunDay = selectedDays[selectedDays.length - 1];
        const intervalDay = selectedDays[0];
        const otherDays = selectedDays.slice(1, selectedDays.length - 1);

        selectedDays.forEach(day => {
            let type: Session['type'] = 'Endurance';
            let blocks: WorkoutBlock[] = [];
            let title = "Footing";

            if (day === longRunDay) {
                type = 'Sortie longue';
                title = isRecovery ? "Sortie Longue Cool" : "La Sortie Longue";
                if (isTaper) {
                     blocks = [{ 
                         type: 'Corps de séance', 
                         duration: i === totalWeeks ? 30 : 50, 
                         details: "Footing léger pour garder du jus avant la course.",
                         hrZone: "Zone 1-2"
                     }];
                } else {
                    blocks = generateLongRun(i, level, totalWeeks, vma, distance, isRecovery);
                }
            } 
            else if (day === intervalDay) {
                // Qualité (VMA / Côtes)
                if (isTaper) {
                     type = 'Course à rythme';
                     title = "Rappel d'allure";
                     blocks = [{
                         type: 'Corps de séance', 
                         details: "20 min footing + 1km allure course + 10 min cool.",
                         hrZone: "Zone 3"
                     }];
                } else {
                    type = 'Fractionné';
                    title = "VMA & Intensité";
                    blocks = generateIntervalSession(i, level, vma, distance, isRecovery);
                }
            } 
            else {
                // Middle days (Tempo or Endurance)
                // If 3+ sessions, the second session is usually Tempo or Endurance
                if (sessionsPerWeek >= 3 && day === otherDays[0]) {
                     type = 'Course à rythme';
                     title = "Allure Spécifique";
                     blocks = generateTempoSession(i, level, vma, distance, isRecovery);
                } else {
                     type = 'Endurance';
                     title = "Footing";
                     blocks = [{ 
                         type: 'Corps de séance', 
                         duration: 45, 
                         details: "45 minutes en endurance fondamentale. Courez relâché.",
                         hrZone: "Zone 1-2"
                     }];
                }
            }

            // Estimation distance/durée pour l'affichage
            let totalMins = 0;
            blocks.forEach(b => totalMins += b.duration || 20); // Fallback
            const dist = Math.round((totalMins / 60) * (type === 'Fractionné' ? vma * 0.8 : vma * 0.7));

            // Calculate specific date for this session
            const weekStart = new Date(start.getTime() + (i - 1) * 7 * 24 * 60 * 60 * 1000);
            // Adjust to Monday of that week
            const dayIndex = weekStart.getDay() || 7; // 1 (Mon) to 7 (Sun)
            const mondayOffset = weekStart.getDate() - dayIndex + 1;
            const mondayDate = new Date(weekStart.setDate(mondayOffset));
            
            const targetDayIndex = dayOrder.indexOf(day) + 1; // 1 (Mon) to 7 (Sun)
            const sessionDate = new Date(mondayDate.getTime() + (targetDayIndex - 1) * 24 * 60 * 60 * 1000);

            sessions.push({
                id: `s-${i}-${day}`,
                day,
                date: sessionDate,
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
            if (!selectedDays.includes(d)) {
                sessions.push({
                    id: `r-${i}-${d}`,
                    day: d,
                    type: 'Repos',
                    title: 'Récupération',
                    structure: [{ type: 'Info', details: 'Profitez de cette journée pour vous reposer complètement ou faire des étirements légers.' }],
                    completed: false
                });
            }
        });

        sessions.sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));

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
        startDate: start,
        trainingDays: selectedDays,
        weeks,
        totalWeeks
    };
};
