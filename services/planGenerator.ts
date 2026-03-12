// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MY RUN — Plan Generator v3.0
// Coach niveau : Entraîneur FFA certifié (simulation)
// Auteur : MY RUN AI Coach
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { Program, Week, Session, Distance, Level, WorkoutBlock } from '../types';

const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UTILITAIRES DE CALCUL D'ALLURE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Convertit une vitesse (% VMA) en allure affichable "Xmin Ys/km" */
const getPace = (vma: number, percentage: number): string => {
    if (!vma || vma <= 0) return 'N/A';
    const speed = vma * (percentage / 100);
    const paceDec = 60 / speed;
    const min = Math.floor(paceDec);
    const sec = Math.round((paceDec - min) * 60);
    return `${min}'${sec.toString().padStart(2, '0')}/km`;
};

/** Retourne une plage d'allure "Xmin - Ymin/km" */
const getPaceRange = (vma: number, minP: number, maxP: number): string => {
    return `${getPace(vma, maxP)} à ${getPace(vma, minP)}/km`;
};

/** Calcule la distance en mètres pour un temps donné à un % de VMA */
const getDistanceForDuration = (vma: number, percentage: number, seconds: number): number => {
    const speedMs = (vma * (percentage / 100)) / 3.6;
    return Math.round(speedMs * seconds);
};

/** Convertit des secondes en format "Xmin Ys" */
const formatTime = (totalSeconds: number): string => {
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return sec > 0 ? `${min}min${sec.toString().padStart(2, '0')}s` : `${min}min`;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONFIGURATION PAR NIVEAU
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const LEVEL_CONFIG = {
    [Level.Beginner]: {
        // Volume de base footing en minutes
        footingBase: 30,
        footingMax: 50,
        // Fractionné : nombre de répétitions
        fracRepsShort: 6,   // 30/30s
        fracRepsMedium: 4,  // 400m
        fracRepsLong: 3,    // 1000m
        // Tempo : durée des blocs
        tempoBlockMin: 8,
        tempoBlockMax: 15,
        // Sortie longue
        longRunBase: 40,
        longRunMax: 90,
        // % VMA pour les footings (endurance fondamentale)
        footingPct: [65, 72],
        label: 'Débutant',
        conseil: "Priorité : finir la séance sans douleur. Ne cherchez pas la performance, cherchez la régularité."
    },
    [Level.Intermediate]: {
        footingBase: 40,
        footingMax: 60,
        fracRepsShort: 10,
        fracRepsMedium: 6,
        fracRepsLong: 4,
        tempoBlockMin: 12,
        tempoBlockMax: 20,
        longRunBase: 55,
        longRunMax: 120,
        footingPct: [68, 75],
        label: 'Intermédiaire',
        conseil: "Travaillez la qualité de votre foulée et maintenez un rythme conversationnel en endurance."
    },
    [Level.Advanced]: {
        footingBase: 50,
        footingMax: 75,
        fracRepsShort: 12,
        fracRepsMedium: 8,
        fracRepsLong: 5,
        tempoBlockMin: 15,
        tempoBlockMax: 25,
        longRunBase: 70,
        longRunMax: 150,
        footingPct: [70, 78],
        label: 'Avancé',
        conseil: "Poussez sur la qualité. Votre endurance est acquise, c'est la vitesse spécifique qui fera la différence."
    }
};

// Allures cibles selon la distance de course
const RACE_PACE_PCT: Record<string, number> = {
    [Distance.FiveK]: 97,
    [Distance.TenK]: 90,
    [Distance.HalfMarathon]: 84,
    [Distance.Marathon]: 78,
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. FOOTING — Varié et progressif
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const generateFooting = (
    weekNum: number,
    level: Level,
    vma: number,
    distance: Distance,
    isRecovery: boolean
): WorkoutBlock[] => {
    const cfg = LEVEL_CONFIG[level];
    const [minPct, maxPct] = cfg.footingPct;
    const efPace = getPaceRange(vma, minPct, maxPct);

    // Durée progressive semaine par semaine (avec palier toutes les 3 semaines)
    const base = cfg.footingBase;
    const progression = isRecovery ? 0 : Math.min(Math.floor(weekNum / 3) * 5, 20);
    const duration = Math.min(base + progression, cfg.footingMax);

    // Distance estimée
    const distKm = ((duration / 60) * vma * 0.68).toFixed(1);

    // Variantes pour éviter la monotonie (rotation sur 4 types)
    const variant = weekNum % 4;

    if (isRecovery) {
        return [{
            type: 'Corps de séance',
            duration,
            details: `🔄 RÉCUPÉRATION ACTIVE\n\n${duration} minutes en endurance fondamentale très légère (${getPaceRange(vma, 60, 68)}).\nDistance estimée : ~${distKm} km.\n\n💡 Conseil coach : Cette semaine, on recharge les batteries. Courez au feeling, encore plus lentement que d'habitude. Si vos jambes sont lourdes, marchez 1 minute toutes les 10 minutes.`,
            hrZone: "Zone 1 — < 70% FCmax"
        }];
    }

    switch (variant) {
        case 0:
            // Footing classique progressif
            return [{
                type: 'Corps de séance',
                duration,
                details: `🏃 FOOTING PROGRESSIF\n\n${duration} minutes en endurance fondamentale.\nDistance estimée : ~${distKm} km.\nAllure cible : ${efPace}.\n\nDéroulé :\n• 10 premières minutes : allure très lente (${getPace(vma, minPct - 5)}/km), laissez votre corps se réveiller\n• Suite de la séance : montez progressivement à ${getPace(vma, maxPct)}/km\n\n💡 Conseil coach : Vous devez pouvoir tenir une conversation complète. Si vous soufflez trop fort pour parler, ralentissez immédiatement.`,
                hrZone: `Zone 1-2 — ${minPct}-${maxPct}% VMA`
            }];

        case 1:
            // Footing avec striders (accélérations finales)
            const striderPace = getPace(vma, 90);
            return [{
                type: 'Corps de séance',
                duration,
                details: `🏃 FOOTING + STRIDERS\n\n${duration - 10} minutes en endurance fondamentale (${efPace}).\nDistance estimée : ~${distKm} km.\n\nEnsuite, 5 × 20 secondes d'accélération progressive :\n• Démarrez à votre allure normale\n• Montez à ~${striderPace}/km en 10 secondes\n• Tenez 10 secondes puis ralentissez doucement\n• Récupération : 40 secondes de marche entre chaque\n\n💡 Conseil coach : Les striders ne sont pas des sprints. C'est une accélération fluide et détendue qui améliore votre technique de foulée sans fatiguer.`,
                hrZone: "Zone 1-2 + pointes Zone 3"
            }];

        case 2:
            // Footing négatif (2ème moitié plus rapide)
            const slowPace = getPace(vma, minPct);
            const fastPace = getPace(vma, maxPct + 3);
            const halfDuration = Math.floor(duration / 2);
            return [{
                type: 'Corps de séance',
                duration,
                details: `🏃 FOOTING EN SPLIT NÉGATIF\n\nObjectif : courir la 2ème moitié plus vite que la 1ère.\nDurée totale : ${duration} minutes. Distance estimée : ~${distKm} km.\n\n• 1ère moitié (${halfDuration} min) : ${slowPace}/km — c'est lent, c'est voulu\n• 2ème moitié (${halfDuration} min) : montez à ${fastPace}/km\n\n💡 Conseil coach : Cette séance apprend à vos muscles à courir en état de fatigue légère, comme en fin de course. C'est excellent pour la gestion d'allure en compétition.`,
                hrZone: "Zone 1 → Zone 2"
            }];

        case 3:
        default:
            // Footing technique avec focus foulée
            return [{
                type: 'Corps de séance',
                duration,
                details: `🏃 FOOTING TECHNIQUE\n\n${duration} minutes à allure libre et confortable.\nAllure cible : ${efPace}. Distance estimée : ~${distKm} km.\n\nConcentrez-vous sur votre technique :\n• Attaque médio-pied (ni talon ni avant-pied)\n• Cadence cible : 170-180 pas/minute\n• Bras fléchis à 90°, épaules relâchées\n• Regard fixé à 10-15 mètres devant vous\n• Poings légèrement serrés (imaginez tenir des chips sans les écraser)\n\n💡 Conseil coach : Comptez vos pas sur 20 secondes et multipliez par 3. Si vous êtes sous 55, raccourcissez la foulée.`,
                hrZone: "Zone 1-2 — Endurance fondamentale"
            }];
    }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. SÉANCE FRACTIONNÉE — Distances et temps précis
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const generateIntervalSession = (
    weekNum: number,
    level: Level,
    vma: number,
    distance: Distance,
    isRecovery: boolean
): WorkoutBlock[] => {
    const cfg = LEVEL_CONFIG[level];

    const warmup: WorkoutBlock = {
        type: 'Échauffement',
        duration: level === Level.Beginner ? 15 : 20,
        details: `${level === Level.Beginner ? 15 : 20} minutes de footing très progressif.\n• Minutes 1-5 : allure très lente (${getPace(vma, 60)}/km)\n• Minutes 5-${level === Level.Beginner ? 12 : 17} : montée progressive à ${getPace(vma, 72)}/km\n• ${level === Level.Beginner ? 3 : 3} dernières minutes : 3 × 30 mètres de gammes (montées de genoux, talons-fesses)\n\n⚠️ Ne sautez jamais l'échauffement avant une séance de fractionné. Votre tendon d'Achille et vos mollets vous remercieront.`,
        hrZone: "Zone 1-2 → 75% FCmax"
    };

    const cooldown: WorkoutBlock = {
        type: 'Retour au calme',
        duration: 10,
        details: `10 minutes de trot très lent (${getPace(vma, 58)}/km).\nÉtirements recommandés après :\n• Quadriceps : 30 sec chaque jambe\n• Mollets : 30 sec chaque jambe\n• Fléchisseurs de hanche : 30 sec chaque côté\n\n💡 Ne vous arrêtez pas brusquement après un fractionné. Le retour au calme évite les courbatures et aide à éliminer l'acide lactique.`,
        hrZone: "Zone 1 — < 65% FCmax"
    };

    if (isRecovery) {
        const fastDist = getDistanceForDuration(vma, 95, 30);
        const slowDist = getDistanceForDuration(vma, 58, 30);
        const reps = Math.max(6, cfg.fracRepsShort - 2);
        const core: WorkoutBlock = {
            type: 'Corps de séance',
            details: `⚡ FRACTIONNÉ ALLÉGÉ — Semaine d'assimilation\n\n${reps} × 30 secondes / 30 secondes\n\nFormat :\n• 30s RAPIDE à 95% VMA → Allure ${getPace(vma, 95)}/km → Distance ~${fastDist}m\n• 30s LENT à 58% VMA → Trot ${getPace(vma, 58)}/km → Distance ~${slowDist}m\n\nTemps total d'effort : ${formatTime(reps * 30)}\nDistance totale fractions rapides : ~${(fastDist * reps / 1000).toFixed(2)} km\n\n💡 Conseil coach : C'est une semaine de récupération. Ne cherchez pas la performance. Si vous forcez maintenant, vous risquez de vous blesser ou d'arriver fatigué aux semaines clés.`,
            hrZone: "Zone 4 — 90-95% FCmax"
        };
        return [warmup, core, cooldown];
    }

    // Rotation sur 4 types de fractionnés selon la semaine et la distance cible
    const cycleType = weekNum % 4;

    let core: WorkoutBlock;

    // ── COURTS (30/30s) — Développement VMA pure ──
    if (cycleType === 0 || (distance === Distance.FiveK && cycleType <= 1)) {
        const fastPct = distance === Distance.FiveK ? 105 : 100;
        const fastDist = getDistanceForDuration(vma, fastPct, 30);
        const slowDist = getDistanceForDuration(vma, 60, 30);
        const reps = cfg.fracRepsShort;
        const totalFastKm = (fastDist * reps / 1000).toFixed(2);

        core = {
            type: 'Corps de séance',
            details: `⚡ VMA COURTE — 30s/30s\n\n${reps} répétitions de 30 secondes / 30 secondes\n\nFormat détaillé :\n• 30s RAPIDE à ${fastPct}% VMA → ${getPace(vma, fastPct)}/km → Distance ~${fastDist}m par rep\n• 30s RÉCUP en trottinant → ${getPace(vma, 60)}/km → ~${slowDist}m\n\n📊 Résumé de l'effort :\n• Temps total d'effort intense : ${formatTime(reps * 30)}\n• Distance cumulée en fractions rapides : ~${totalFastKm} km\n• Distance totale séance (avec écha. et retour) : ~${((reps * (fastDist + slowDist)) / 1000 + (level === Level.Beginner ? 2.5 : 3.5)).toFixed(1)} km\n\n💡 Conseil coach : Si vous ne pouvez plus maintenir l'allure après la 6ème rep, arrêtez. Il vaut mieux 6 répétitions de qualité que 10 bâclées. La VMA se développe à l'effort, pas à la souffrance.`,
            hrZone: "Zone 5 — > 95% FCmax"
        };
    }
    // ── MOYENS (400m) — Puissance aérobie ──
    else if (cycleType === 1) {
        const reps = cfg.fracRepsMedium;
        const targetPace400 = getPace(vma, distance === Distance.FiveK ? 100 : 95);
        const speed400 = vma * (distance === Distance.FiveK ? 1.00 : 0.95) / 3.6;
        const time400 = Math.round(400 / speed400);
        const recovPace = getPace(vma, 58);
        const totalFastKm = (reps * 0.4).toFixed(1);

        core = {
            type: 'Corps de séance',
            details: `⚡ SÉANCE 400m — Puissance aérobie\n\n${reps} × 400 mètres avec récupération\n\nFormat détaillé :\n• EFFORT : 400m à ${distance === Distance.FiveK ? 100 : 95}% VMA → Allure ${targetPace400}/km → Temps cible : ${formatTime(time400)}\n• RÉCUP : 200m en marchant ou trottinant (~2 minutes)\n\n📊 Résumé :\n• Distance totale d'effort : ${totalFastKm} km\n• Durée totale des efforts : ~${formatTime(reps * time400)}\n• Distance totale séance : ~${(reps * 0.6 + (level === Level.Beginner ? 2.5 : 3.5)).toFixed(1)} km\n\n💡 Conseil coach : Le chrono sur chaque 400m doit être régulier. Si votre dernier 400m est 10 secondes plus lent que le premier, c'est que l'allure était trop rapide. Mieux vaut partir 5% plus lentement et finir fort.`,
            hrZone: "Zone 4-5 — 92-98% FCmax"
        };
    }
    // ── LONGS (1000m) — Seuil et endurance de vitesse ──
    else if (cycleType === 2) {
        const reps = cfg.fracRepsLong;
        const pctFor1000 = distance === Distance.Marathon ? 85 : distance === Distance.HalfMarathon ? 88 : 92;
        const targetPace1000 = getPace(vma, pctFor1000);
        const speed1000 = vma * (pctFor1000 / 100) / 3.6;
        const time1000 = Math.round(1000 / speed1000);
        const totalFastKm = reps;

        core = {
            type: 'Corps de séance',
            details: `⚡ SÉANCE 1000m — Seuil anaérobie\n\n${reps} × 1000 mètres avec récupération\n\nFormat détaillé :\n• EFFORT : 1000m à ${pctFor1000}% VMA → Allure ${targetPace1000}/km → Temps cible : ${formatTime(time1000)} par km\n• RÉCUP : 400m en trottinant (environ ${Math.round(time1000 * 0.6)} secondes de repos actif)\n\n📊 Résumé :\n• Distance totale d'effort : ${totalFastKm} km\n• Durée totale des efforts : ~${formatTime(reps * time1000)}\n• Distance totale séance : ~${(reps * 1.4 + (level === Level.Beginner ? 2.5 : 3.5)).toFixed(1)} km\n\n💡 Conseil coach : Le seuil anaérobie est la vitesse la plus haute que vous pouvez tenir 30 à 60 minutes. C'est votre moteur principal pour le ${distance}. Soyez régulier : chaque 1000m doit prendre le même temps, à ±5 secondes près.`,
            hrZone: "Zone 3-4 — 85-92% FCmax"
        };
    }
    // ── FARTLEK — Variabilité et plaisir ──
    else {
        const fastPace = getPace(vma, 90);
        const medPace = getPace(vma, 78);
        const schema = level === Level.Beginner
            ? '2min rapide / 3min lent × 5 fois'
            : level === Level.Intermediate
            ? '3min rapide / 2min lent × 5 fois'
            : '4min rapide / 1min30 lent × 5 fois';
        const fastMins = level === Level.Beginner ? 2 : level === Level.Intermediate ? 3 : 4;
        const slowMins = level === Level.Beginner ? 3 : level === Level.Intermediate ? 2 : 1.5;
        const totalMin = (fastMins + slowMins) * 5;
        const totalKm = ((totalMin / 60) * vma * 0.83).toFixed(1);

        core = {
            type: 'Corps de séance',
            details: `⚡ FARTLEK — Jeu de vitesse\n\nSchéma : ${schema}\n\nFormat détaillé :\n• RAPIDE : ${fastMins} minutes à ${fastPace}/km → Effort soutenu mais contrôlé\n• LENT : ${slowMins} minutes à ${medPace}/km → Récupération active, ne marchez pas\n\n📊 Résumé :\n• Durée totale du fartlek : ${totalMin} minutes\n• Distance estimée : ~${totalKm} km\n• Temps cumulé en phase rapide : ${fastMins * 5} minutes\n\n💡 Conseil coach : Contrairement au fractionné sur piste, le fartlek s'adapte au terrain. Accélérez jusqu'au prochain arbre, au prochain lampadaire. Ça rend la séance plus ludique et développe votre sens de l'allure.`,
            hrZone: "Zone 3-4 alternée"
        };
    }

    return [warmup, core, cooldown];
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. SÉANCE TEMPO / ALLURE SPÉCIFIQUE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const generateTempoSession = (
    weekNum: number,
    level: Level,
    vma: number,
    distance: Distance,
    isRecovery: boolean
): WorkoutBlock[] => {
    const cfg = LEVEL_CONFIG[level];
    const racePct = RACE_PACE_PCT[distance];
    const racePace = getPace(vma, racePct);
    const efPace = getPaceRange(vma, cfg.footingPct[0], cfg.footingPct[1]);

    const warmup: WorkoutBlock = {
        type: 'Échauffement',
        duration: 15,
        details: `15 minutes de footing progressif (${efPace}).\n3 accélérations sur 60m avant la séance principale pour activer le système neuromusculaire.`,
        hrZone: "Zone 1-2"
    };

    const cooldown: WorkoutBlock = {
        type: 'Retour au calme',
        duration: 10,
        details: `10 minutes de trot très léger (${getPace(vma, 58)}/km).\n💡 Profitez de ces 10 minutes pour relâcher mentalement et analyser votre séance.`,
        hrZone: "Zone 1"
    };

    if (isRecovery) {
        const duration = Math.max(30, cfg.footingBase - 5);
        const distKm = ((duration / 60) * vma * 0.68).toFixed(1);
        return [{
            type: 'Corps de séance',
            duration,
            details: `🎯 FOOTING DE RÉCUPÉRATION\n\n${duration} minutes en endurance fondamentale (${efPace}).\nDistance estimée : ~${distKm} km.\n\n💡 Semaine d'assimilation : pas d'allure spécifique aujourd'hui. Courez relâché et observez vos sensations. Si vos jambes sont encore lourdes de la semaine dernière, c'est normal.`,
            hrZone: "Zone 1-2"
        }];
    }

    // Progression : les blocs d'allure augmentent au fil des semaines
    const blockDuration = Math.min(
        cfg.tempoBlockMin + Math.floor(weekNum / 2),
        cfg.tempoBlockMax
    );
    const totalTempoKm = ((blockDuration / 60) * vma * (racePct / 100)).toFixed(1);
    const totalSessionKm = ((blockDuration + 25) / 60 * vma * 0.80).toFixed(1);

    // Alterner entre 1 bloc long et 2 blocs courts selon la semaine
    if (weekNum % 2 === 0) {
        // Bloc continu
        return [
            warmup,
            {
                type: 'Corps de séance',
                details: `🎯 TEMPO CONTINU — Allure ${distance}\n\n${blockDuration} minutes en continu à votre allure ${distance} cible.\n\nAllure cible : ${racePace}/km (${racePct}% VMA)\nDistance estimée en tempo : ~${totalTempoKm} km\nDistance totale séance : ~${totalSessionKm} km\n\n💡 Conseil coach : Cette séance simule les conditions de course. Votre allure doit être "inconfortablement confortable" : vous sentez l'effort, mais vous contrôlez. Si vous devez parler, vous pouvez sortir des phrases courtes. C'est exactement ça le bon seuil.`,
                hrZone: `Zone 3-4 — ${racePct}% VMA`
            },
            cooldown
        ];
    } else {
        // 2 blocs avec récupération courte
        const singleBlock = Math.round(blockDuration * 0.55);
        const singleKm = ((singleBlock / 60) * vma * (racePct / 100)).toFixed(1);
        return [
            warmup,
            {
                type: 'Corps de séance',
                details: `🎯 TEMPO EN 2 BLOCS — Allure ${distance}\n\n2 × ${singleBlock} minutes à allure ${distance} avec 2 minutes de récupération.\n\nAllure cible : ${racePace}/km (${racePct}% VMA)\nDistance par bloc : ~${singleKm} km\nDistance totale séance : ~${totalSessionKm} km\n\nDéroulé :\n• Bloc 1 : ${singleBlock} minutes à ${racePace}/km\n• Récupération : 2 minutes de trot (${getPace(vma, 65)}/km)\n• Bloc 2 : ${singleBlock} minutes à ${racePace}/km\n\n💡 Conseil coach : Le 2ème bloc doit être aussi bon que le premier. Si vous ralentissez de plus de 5s/km sur le 2ème bloc, c'est que vous êtes parti trop vite sur le 1er. Retour au calme ensuite.`,
                hrZone: `Zone 3-4 — ${racePct}% VMA`
            },
            cooldown
        ];
    }
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. SORTIE LONGUE — Le pilier de l'endurance
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const generateLongRun = (
    weekNum: number,
    level: Level,
    totalWeeks: number,
    vma: number,
    distance: Distance,
    isRecovery: boolean
): WorkoutBlock[] => {
    const cfg = LEVEL_CONFIG[level];
    const efPace = getPaceRange(vma, cfg.footingPct[0], cfg.footingPct[1]);

    // Durée progressive avec plafonds spécifiques par distance
    const maxDurations: Record<string, number> = {
        [Distance.FiveK]: 75,
        [Distance.TenK]: 100,
        [Distance.HalfMarathon]: 135,
        [Distance.Marathon]: cfg.longRunMax,
    };

    const progressionRate = isRecovery ? 0 : Math.min(weekNum * 4, 40);
    const duration = Math.min(cfg.longRunBase + progressionRate, maxDurations[distance]);
    const distKm = ((duration / 60) * vma * 0.67).toFixed(1);

    if (isRecovery) {
        const reducedDuration = Math.max(40, duration - 20);
        const reducedKm = ((reducedDuration / 60) * vma * 0.67).toFixed(1);
        return [{
            type: 'Corps de séance',
            duration: reducedDuration,
            details: `🌿 SORTIE LONGUE ALLÉGÉE — Semaine d'assimilation\n\n${reducedDuration} minutes en endurance fondamentale tranquille.\nAllure : ${efPace}. Distance estimée : ~${reducedKm} km.\n\n💡 Conseil coach : Cette sortie longue réduite est aussi importante que les grandes. Votre corps consolide les adaptations des 3 dernières semaines. Profitez-en pour tester votre nutrition de course si vous préparez un semi ou un marathon.`,
            hrZone: "Zone 1-2 — Endurance fondamentale"
        }];
    }

    // Semaine de tapering (2 dernières semaines)
    if (weekNum >= totalWeeks - 1) {
        const taperDuration = weekNum === totalWeeks ? 25 : 45;
        return [{
            type: 'Corps de séance',
            duration: taperDuration,
            details: `🏁 SORTIE D'AFFÛTAGE — J-${weekNum === totalWeeks ? 7 : 14}\n\n${taperDuration} minutes à allure endurance très légère (${efPace}).\n\n💡 Conseil coach : N'essayez surtout pas de "rattraper" l'entraînement manqué. Votre forme est faite. L'objectif maintenant c'est d'arriver reposé et frais au départ. Dormez bien, hydratez-vous, ne changez pas vos chaussures.`,
            hrZone: "Zone 1 — Récupération active"
        }];
    }

    // Sortie longue avec blocs d'allure alternés (1 semaine sur 2)
    if (weekNum % 2 === 0 && weekNum >= 3 && distance !== Distance.FiveK) {
        const racePct = RACE_PACE_PCT[distance];
        const specificPace = getPace(vma, racePct);
        const activeBlock = Math.min(15 + weekNum * 2, 40);
        const warmupBlock = 20;
        const cooldownBlock = Math.max(10, duration - warmupBlock - activeBlock);
        const activeKm = ((activeBlock / 60) * vma * (racePct / 100)).toFixed(1);
        const totalKm = ((duration / 60) * vma * 0.72).toFixed(1);

        return [
            {
                type: 'Échauffement',
                duration: warmupBlock,
                details: `${warmupBlock} minutes en endurance fondamentale très légère pour chauffer les muscles (${getPace(vma, cfg.footingPct[0])}/km).`,
                hrZone: "Zone 1"
            },
            {
                type: 'Corps de séance',
                details: `🏃 BLOC D'ALLURE SPÉCIFIQUE\n\n${activeBlock} minutes à votre allure ${distance} au cœur de la sortie longue.\nAllure cible : ${specificPace}/km (${racePct}% VMA)\nDistance en allure cible : ~${activeKm} km\n\n💡 C'est la partie la plus importante de votre sortie longue. Vos jambes sont déjà fatiguées par les 20 premières minutes : courir à allure course dans cet état, c'est exactement ce que vous ferez en compétition.`,
                hrZone: `Zone 3-4 — ${racePct}% VMA`
            },
            {
                type: 'Retour au calme',
                duration: cooldownBlock,
                details: `${cooldownBlock} minutes de récupération en endurance fondamentale (${efPace}).\nDistance totale estimée : ~${totalKm} km.\n\n💡 Alimentation pendant la sortie : si durée > 60 min, prenez un gel ou une datte toutes les 30-40 minutes. Commencez à manger avant d'avoir faim.`,
                hrZone: "Zone 1-2"
            }
        ];
    }

    // Sortie longue classique
    return [{
        type: 'Corps de séance',
        duration,
        details: `🌿 SORTIE LONGUE\n\n${duration} minutes en endurance fondamentale continue.\nAllure : ${efPace}.\nDistance estimée : ~${distKm} km.\n\nConseils pour cette sortie :\n• Partez LENTEMENT. Encore plus lentement que vous ne le pensez nécessaire.\n• Emportez de l'eau si durée > 60 min\n• Si jambes lourdes après 30 min : réduisez l'allure de 15-20 sec/km\n\n💡 Conseil coach : La sortie longue développe votre économie de course, la résistance mentale et les adaptations cardiovasculaires profondes. C'est la séance qu'on ne négocie jamais, même si on la fait plus lentement que prévu.`,
        hrZone: "Zone 1-2 — 65-75% FCmax"
    }];
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. JOURS DE REPOS — Conseils actifs
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const REST_DAY_TIPS = [
    "🛌 REPOS COMPLET\n\nPas de course aujourd'hui. Votre corps construit ses adaptations pendant le repos, pas pendant l'entraînement.\n\n✅ Ce que vous pouvez faire :\n• Marche légère (20-30 min)\n• Stretching doux (10 min)\n• Rouleau de massage (foam roller) sur les mollets et cuisses\n• Bain froid ou douche contrastée pour accélérer la récupération\n\n💡 Conseil coach : Le sommeil est votre meilleur allié. 8h de sommeil valent mieux que 2h de stretching.",
    "🔋 RÉCUPÉRATION ACTIVE\n\nJour de repos running, mais restez en mouvement.\n\n✅ Activités recommandées :\n• Vélo ou natation (30 min max, allure confortable)\n• Yoga ou pilates (excellent pour la stabilité)\n• Marche (non comptée comme entraînement)\n\n💡 Conseil coach : La récupération active augmente la circulation sanguine et élimine les toxines musculaires sans créer de fatigue supplémentaire.",
    "🥗 JOUR NUTRITION\n\nPas de course, mais profitez-en pour optimiser votre récupération par l'alimentation.\n\n✅ Focus nutritionnel :\n• Protéines : poulet, œufs, légumineuses (réparation musculaire)\n• Glucides complexes : patate douce, riz complet (recharge des réserves)\n• Hydratation : 2L d'eau minimum\n• Évitez l'alcool : il perturbe la synthèse protéique pendant 48h\n\n💡 Conseil coach : Ce que vous mangez le jour de repos est aussi important que ce que vous mangez avant l'entraînement.",
    "🧘 RÉCUPÉRATION MENTALE\n\nLe running c'est aussi 50% mental. Profitez de ce jour pour recharger.\n\n✅ Rituels recommandés :\n• 10 min de respiration profonde ou méditation\n• Visualisation de votre course (imaginez-vous franchir la ligne)\n• Relisez vos progrès : séances complétées, KMs parcourus\n\n💡 Conseil coach : Les athlètes d'élite considèrent la récupération mentale aussi sérieusement que physique. Notez comment vous vous sentez pour identifier vos pics de forme.",
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GÉNÉRATEUR PRINCIPAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LOGIQUE INTELLIGENTE DE DURÉE DE PROGRAMME v4.0
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/** Durée optimale de programme selon niveau + distance (en semaines) */
export const OPTIMAL_WEEKS: Record<string, Record<string, { min: number; max: number }>> = {
    [Distance.Marathon]: {
        [Level.Beginner]:     { min: 18, max: 22 },
        [Level.Intermediate]: { min: 16, max: 20 },
        [Level.Advanced]:     { min: 14, max: 18 },
    },
    [Distance.HalfMarathon]: {
        [Level.Beginner]:     { min: 14, max: 18 },
        [Level.Intermediate]: { min: 12, max: 16 },
        [Level.Advanced]:     { min: 10, max: 14 },
    },
    [Distance.TenK]: {
        [Level.Beginner]:     { min: 10, max: 14 },
        [Level.Intermediate]: { min: 8, max: 12 },
        [Level.Advanced]:     { min: 6, max: 10 },
    },
    [Distance.FiveK]: {
        [Level.Beginner]:     { min: 6, max: 10 },
        [Level.Intermediate]: { min: 5, max: 8 },
        [Level.Advanced]:     { min: 4, max: 6 },
    },
};

export type ProgramScenario = 'optimal' | 'tooFar' | 'tooClose';

export interface ProgramRecommendation {
    scenario: ProgramScenario;
    weeksUntilRace: number;
    optimalMin: number;
    optimalMax: number;
    /** Semaines de mise en forme suggérées (si tooFar) */
    conditioningWeeks?: number;
    /** Semaines du vrai programme (si tooFar) */
    mainProgramWeeks?: number;
    /** Date de début recommandée du vrai programme (si tooFar) */
    recommendedStartDate?: Date;
    /** Semaines pour le programme intensif (si tooClose) */
    intensiveWeeks?: number;
    message: string;
    detail: string;
}

/** Analyse la situation de l'utilisateur et retourne une recommandation */
export const analyzeProgramTiming = (
    distance: Distance,
    level: Level,
    raceDate: Date
): ProgramRecommendation => {
    const today = new Date();
    const totalDays = Math.ceil((raceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const weeksUntilRace = Math.floor(totalDays / 7);

    const optimal = OPTIMAL_WEEKS[distance]?.[level] ?? { min: 12, max: 22 };
    const optimalIdeal = optimal.max; // On vise le max pour le meilleur résultat

    // ── CAS 1 : Course trop loin (plus de semaines que l'optimal max + 2) ──
    if (weeksUntilRace > optimal.max + 2) {
        const conditioningWeeks = weeksUntilRace - optimalIdeal;
        const recommendedStart = new Date(today.getTime() + conditioningWeeks * 7 * 24 * 60 * 60 * 1000);

        return {
            scenario: 'tooFar',
            weeksUntilRace,
            optimalMin: optimal.min,
            optimalMax: optimal.max,
            conditioningWeeks,
            mainProgramWeeks: optimalIdeal,
            recommendedStartDate: recommendedStart,
            message: `Ta course est dans ${weeksUntilRace} semaines 📅`,
            detail: `Pour un ${distance}, le programme idéal dure ${optimalIdeal} semaines pour ton niveau ${LEVEL_CONFIG[level].label}. Commencer maintenant serait contre-productif : tu arriverais en forme maximale ${conditioningWeeks} semaines trop tôt !\n\nNOTRE SOLUTION : Un programme de mise en forme de ${conditioningWeeks} semaine${conditioningWeeks > 1 ? 's' : ''} pour te conditionner et préparer ton corps, puis ton vrai programme de ${optimalIdeal} semaines commencera le ${recommendedStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}.\n\n✅ La 1ère semaine de mise en forme est OFFERTE avec accès complet aux séances.`,
        };
    }

    // ── CAS 2 : Course trop proche (moins que l'optimal min - 2) ──
    if (weeksUntilRace < optimal.min - 2) {
        const intensiveWeeks = Math.max(weeksUntilRace, 4);

        return {
            scenario: 'tooClose',
            weeksUntilRace,
            optimalMin: optimal.min,
            optimalMax: optimal.max,
            intensiveWeeks,
            message: `Ta course est dans seulement ${weeksUntilRace} semaines ⚡`,
            detail: `Le programme idéal pour un ${distance} à ton niveau nécessite ${optimal.min} à ${optimal.max} semaines. Tu as ${weeksUntilRace} semaines — c'est court, mais on va maximiser ta préparation !\n\nNOTRE SOLUTION : Un programme INTENSIF de ${intensiveWeeks} semaines, conçu spécifiquement pour optimiser ta progression sur une courte période. Chaque séance compte.\n\n⚡ Attention : Ce programme demande un engagement total et une bonne récupération entre les séances.`,
        };
    }

    // ── CAS 3 : Timing optimal ──
    const actualWeeks = Math.min(weeksUntilRace, optimal.max);
    return {
        scenario: 'optimal',
        weeksUntilRace,
        optimalMin: optimal.min,
        optimalMax: optimal.max,
        message: `Timing parfait pour un ${distance} ! 🎯`,
        detail: `${weeksUntilRace} semaines avant ta course — c'est exactement la fenêtre idéale pour ton niveau ${LEVEL_CONFIG[level].label}. Ton programme de ${actualWeeks} semaines va te préparer de manière optimale.`,
    };
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GÉNÉRATION DU PROGRAMME DE MISE EN FORME (tooFar)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const generateConditioningPlan = (
    settings: Omit<Program, 'id' | 'weeks' | 'totalWeeks'> & { vma?: number; conditioningWeeks: number }
): Program => {
    const { level, sessionsPerWeek, trainingDays, vma = 14, conditioningWeeks } = settings;
    const cfg = LEVEL_CONFIG[level];

    let selectedDays = trainingDays && trainingDays.length === sessionsPerWeek
        ? trainingDays
        : (sessionsPerWeek === 2 ? ['Mercredi', 'Dimanche']
            : sessionsPerWeek === 3 ? ['Mardi', 'Jeudi', 'Dimanche']
            : ['Mardi', 'Mercredi', 'Vendredi', 'Dimanche']);
    selectedDays.sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b));

    const start = new Date();
    const weeks: Week[] = [];

    for (let i = 1; i <= conditioningWeeks; i++) {
        const sessions: Session[] = [];
        const isFree = i === 1; // Semaine 1 gratuite

        selectedDays.forEach(day => {
            // Programme doux : uniquement footings et sorties progressives
            const isLongDay = day === selectedDays[selectedDays.length - 1];
            const duration = isLongDay
                ? Math.min(cfg.longRunBase + (i - 1) * 5, cfg.longRunBase + 20)
                : Math.min(cfg.footingBase + (i - 1) * 3, cfg.footingMax);

            const efPace = getPaceRange(vma, cfg.footingPct[0], cfg.footingPct[1]);
            const distKm = ((duration / 60) * vma * 0.68).toFixed(1);

            const blocks: WorkoutBlock[] = [{
                type: 'Corps de séance',
                duration,
                details: isLongDay
                    ? `🌿 SORTIE PROGRESSIVE — Mise en forme\n\n${duration} minutes en endurance fondamentale très douce (${efPace}).\nDistance estimée : ~${distKm} km.\n\n💡 Objectif : Habituer ton corps à courir régulièrement. Aucune performance attendue — profite du mouvement et écoute tes sensations. C'est la base sur laquelle ton vrai programme sera construit.`
                    : `🏃 FOOTING SANTÉ — Mise en forme\n\n${duration} minutes à allure très légère (${getPaceRange(vma, cfg.footingPct[0] - 5, cfg.footingPct[1] - 3)}).\nDistance estimée : ~${distKm} km.\n\n💡 Ces séances de mise en forme construisent ta base aérobie et renforcent tes tendons et articulations. C'est l'investissement le plus important pour éviter les blessures lors de ton vrai programme.`,
                hrZone: 'Zone 1 — < 70% FCmax'
            }];

            const weekStart = new Date(start.getTime() + (i - 1) * 7 * 24 * 60 * 60 * 1000);
            const dayIndex = weekStart.getDay() || 7;
            const mondayOffset = weekStart.getDate() - dayIndex + 1;
            const mondayDate = new Date(weekStart.setDate(mondayOffset));
            const targetDayIndex = daysOfWeek.indexOf(day) + 1;
            const sessionDate = new Date(mondayDate.getTime() + (targetDayIndex - 1) * 24 * 60 * 60 * 1000);

            sessions.push({
                id: `c-${i}-${day}`,
                day,
                date: sessionDate,
                type: 'Endurance',
                title: isLongDay ? 'Sortie Progressive' : 'Footing Santé',
                structure: blocks,
                completed: false,
                duration,
                distance: parseFloat(distKm),
            });
        });

        // Repos
        let restIdx = 0;
        daysOfWeek.forEach(d => {
            if (!selectedDays.includes(d)) {
                sessions.push({
                    id: `cr-${i}-${d}`,
                    day: d,
                    type: 'Repos',
                    title: 'Récupération',
                    structure: [{ type: 'Info', details: REST_DAY_TIPS[restIdx % REST_DAY_TIPS.length] }],
                    completed: false,
                });
                restIdx++;
            }
        });

        sessions.sort((a, b) => daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day));

        weeks.push({
            weekNumber: i,
            title: i === 1
                ? '🎁 Mise en Forme — Semaine Offerte !'
                : `Mise en Forme — Semaine ${i}`,
            sessions,
            totalKm: parseFloat(sessions.reduce((sum, s) => sum + (s.distance || 0), 0).toFixed(1)),
            sessionsCount: sessionsPerWeek,
            isFree,
            isConditioningWeek: true,
        });
    }

    return {
        id: `conditioning-${new Date().toISOString()}`,
        ...settings,
        startDate: start,
        trainingDays: selectedDays,
        weeks,
        totalWeeks: conditioningWeeks,
        isConditioningProgram: true,
    };
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PROGRAMME INTENSIF (tooClose)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const generateIntensivePlan = (
    settings: Omit<Program, 'id' | 'weeks' | 'totalWeeks'> & { vma?: number }
): Program => {
    const { distance, level, sessionsPerWeek, raceDate, trainingDays, vma = 14 } = settings;

    const today = new Date();
    const race = new Date(raceDate);
    const weeksUntilRace = Math.max(4, Math.floor((race.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 7)));

    let selectedDays = trainingDays && trainingDays.length === sessionsPerWeek
        ? trainingDays
        : (sessionsPerWeek === 2 ? ['Mercredi', 'Dimanche']
            : sessionsPerWeek === 3 ? ['Mardi', 'Jeudi', 'Dimanche']
            : ['Mardi', 'Mercredi', 'Vendredi', 'Dimanche']);
    selectedDays.sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b));

    const weeks: Week[] = [];
    const cfg = LEVEL_CONFIG[level];

    for (let i = 1; i <= weeksUntilRace; i++) {
        const isTaper = i >= weeksUntilRace - 1;
        const sessions: Session[] = [];

        selectedDays.forEach(day => {
            const isLongDay = day === selectedDays[selectedDays.length - 1];
            const isIntervalDay = day === selectedDays[0];
            let type: Session['type'] = 'Endurance';
            let title = 'Footing';
            let blocks: WorkoutBlock[] = [];

            if (isLongDay) {
                type = 'Sortie longue';
                title = isTaper ? "Sortie d'Affûtage" : 'Sortie Longue Intensive';
                blocks = generateLongRun(i, level, weeksUntilRace, vma, distance, false);
            } else if (isIntervalDay && !isTaper) {
                // Fractionné 2x par semaine en mode intensif
                type = 'Fractionné';
                title = 'Fractionné Intensif';
                blocks = generateIntervalSession(i, level, vma, distance, false);
            } else if (isTaper) {
                type = 'Course à rythme';
                title = "Rappel d'Allure";
                blocks = [{
                    type: 'Corps de séance',
                    details: `🏁 RAPPEL D'ALLURE\n\n20 minutes footing léger + 2×1km à allure course (${getPace(vma, RACE_PACE_PCT[distance])}/km) + 10 min retour calme\n\n💡 Tu y es presque ! Conserve tes jambes pour le jour J.`,
                    hrZone: 'Zone 2-3'
                }];
            } else {
                type = 'Course à rythme';
                title = 'Tempo Intensif';
                blocks = generateTempoSession(i, level, vma, distance, false);
            }

            let totalMins = 0;
            blocks.forEach(b => { totalMins += b.duration || 20; });
            const pctForDist = type === 'Fractionné' ? vma * 0.85 : type === 'Course à rythme' ? vma * 0.82 : vma * 0.68;
            const dist = parseFloat(((totalMins / 60) * pctForDist).toFixed(1));

            const weekStart = new Date(today.getTime() + (i - 1) * 7 * 24 * 60 * 60 * 1000);
            const dayIndex = weekStart.getDay() || 7;
            const mondayOffset = weekStart.getDate() - dayIndex + 1;
            const mondayDate = new Date(weekStart.setDate(mondayOffset));
            const targetDayIndex = daysOfWeek.indexOf(day) + 1;
            const sessionDate = new Date(mondayDate.getTime() + (targetDayIndex - 1) * 24 * 60 * 60 * 1000);

            sessions.push({
                id: `int-${i}-${day}`,
                day,
                date: sessionDate,
                type,
                title,
                structure: blocks,
                completed: false,
                duration: totalMins,
                distance: dist,
            });
        });

        let restIdx = 0;
        daysOfWeek.forEach(d => {
            if (!selectedDays.includes(d)) {
                sessions.push({
                    id: `ir-${i}-${d}`,
                    day: d,
                    type: 'Repos',
                    title: 'Récupération',
                    structure: [{ type: 'Info', details: REST_DAY_TIPS[restIdx % REST_DAY_TIPS.length] }],
                    completed: false,
                });
                restIdx++;
            }
        });

        sessions.sort((a, b) => daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day));

        weeks.push({
            weekNumber: i,
            title: i === 1 ? '⚡ Démarrage Intensif — Semaine 1'
                : isTaper ? '🏁 Affûtage Final'
                : `⚡ Programme Intensif — Semaine ${i}`,
            sessions,
            totalKm: parseFloat(sessions.reduce((sum, s) => sum + (s.distance || 0), 0).toFixed(1)),
            sessionsCount: sessionsPerWeek,
        });
    }

    return {
        id: `intensive-${new Date().toISOString()}`,
        ...settings,
        startDate: today,
        trainingDays: selectedDays,
        weeks,
        totalWeeks: weeksUntilRace,
        isIntensiveProgram: true,
    };
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DONNÉES POUR LA PRÉSENTATION DU PROGRAMME
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ProgramPresentation {
    title: string;
    subtitle: string;
    highlights: { icon: string; label: string; value: string }[];
    phases: { name: string; weeks: string; description: string; color: string }[];
    philosophy: string;
    weeklyStructure: string;
    keyPrinciple: string;
}

export const buildProgramPresentation = (program: Program): ProgramPresentation => {
    const { distance, level, totalWeeks, sessionsPerWeek } = program;
    const cfg = LEVEL_CONFIG[level];
    const isConditioning = (program as any).isConditioningProgram;
    const isIntensive = (program as any).isIntensiveProgram;

    const distanceLabels: Record<string, string> = {
        [Distance.FiveK]: '5 km',
        [Distance.TenK]: '10 km',
        [Distance.HalfMarathon]: 'Semi-Marathon',
        [Distance.Marathon]: 'Marathon',
    };

    if (isConditioning) {
        return {
            title: '🌿 Programme de Mise en Forme',
            subtitle: `${totalWeeks} semaines pour préparer ton corps avant le grand départ`,
            highlights: [
                { icon: '📅', label: 'Durée', value: `${totalWeeks} semaines` },
                { icon: '🎁', label: 'Semaine 1', value: '100% offerte' },
                { icon: '🏃', label: 'Séances/semaine', value: `${sessionsPerWeek} séances` },
                { icon: '💚', label: 'Intensité', value: 'Douce & Progressive' },
            ],
            phases: [
                { name: 'Conditionnement', weeks: `Semaines 1-${Math.ceil(totalWeeks / 2)}`, description: 'Réveiller tes muscles, habitudes de course', color: '#22c55e' },
                { name: 'Base aérobie', weeks: `Semaines ${Math.ceil(totalWeeks / 2) + 1}-${totalWeeks}`, description: 'Construire l\'endurance de base', color: '#10b981' },
            ],
            philosophy: `Ce programme te prépare doucement pour que ton corps soit prêt lorsque ton vrai programme commencera. L'objectif n'est pas la performance, mais la régularité et le plaisir de courir.`,
            weeklyStructure: `${sessionsPerWeek} séances par semaine, toutes en endurance fondamentale. Pas de fractionné, pas de tempo — juste du volume doux et progressif.`,
            keyPrinciple: '💡 La base fait le champion. Ces semaines de mise en forme sont l\'investissement le plus important de ta préparation.',
        };
    }

    if (isIntensive) {
        return {
            title: `⚡ Programme Intensif ${distanceLabels[distance]}`,
            subtitle: `${totalWeeks} semaines pour maximiser ta préparation`,
            highlights: [
                { icon: '📅', label: 'Durée', value: `${totalWeeks} semaines` },
                { icon: '⚡', label: 'Intensité', value: 'Élevée' },
                { icon: '🏃', label: 'Séances/semaine', value: `${sessionsPerWeek} séances` },
                { icon: '🎯', label: 'Objectif', value: distanceLabels[distance] },
            ],
            phases: [
                { name: 'Choc & Adaptation', weeks: `Semaines 1-${Math.ceil(totalWeeks * 0.6)}`, description: 'Volume maximal, qualité intensive', color: '#f59e0b' },
                { name: 'Affûtage', weeks: `Semaines ${Math.ceil(totalWeeks * 0.6) + 1}-${totalWeeks}`, description: 'Réduction de volume, fraîcheur musculaire', color: '#10b981' },
            ],
            philosophy: `Avec peu de temps, chaque séance compte double. Ce programme condense l'essentiel de la préparation en maximisant les séances de qualité tout en préservant ta récupération.`,
            weeklyStructure: `${sessionsPerWeek} séances par semaine avec priorité aux séances de qualité (fractionnés, tempo). La récupération entre séances est ESSENTIELLE.`,
            keyPrinciple: '⚡ La qualité prime sur la quantité. Chaque séance est une opportunité — ne la gâche pas avec de la fatigue accumulée.',
        };
    }

    // Programme normal
    const tapering = Math.min(2, Math.floor(totalWeeks * 0.15));
    const building = totalWeeks - tapering;

    return {
        title: `🏆 Programme ${distanceLabels[distance]}`,
        subtitle: `${totalWeeks} semaines de préparation — Niveau ${cfg.label}`,
        highlights: [
            { icon: '📅', label: 'Durée', value: `${totalWeeks} semaines` },
            { icon: '🏃', label: 'Séances/semaine', value: `${sessionsPerWeek} séances` },
            { icon: '📈', label: 'Niveau', value: cfg.label },
            { icon: '🎯', label: 'Distance', value: distanceLabels[distance] },
        ],
        phases: [
            { name: 'Développement', weeks: `Semaines 1-${Math.ceil(building * 0.6)}`, description: 'Construction de la base et du volume', color: '#3b82f6' },
            { name: 'Spécifique', weeks: `Semaines ${Math.ceil(building * 0.6) + 1}-${building}`, description: 'Travail à allure race, fractionnés ciblés', color: '#8b5cf6' },
            { name: 'Affûtage', weeks: `Semaines ${building + 1}-${totalWeeks}`, description: 'Réduction du volume, fraîcheur pour le jour J', color: '#10b981' },
        ],
        philosophy: `Programme conçu selon les principes d'entraînement FFA pour le niveau ${cfg.label}. La progression est calculée à partir de ta VMA pour des allures 100% personnalisées.`,
        weeklyStructure: sessionsPerWeek === 2
            ? `2 séances/semaine : 1 sortie longue le weekend + 1 fractionné en semaine. Idéal pour les emplois du temps chargés.`
            : sessionsPerWeek === 3
            ? `3 séances/semaine : Fractionné + Tempo/Allure spécifique + Sortie longue. Le trio gagnant pour progresser.`
            : `4 séances/semaine : Fractionné + Tempo + 2 footings variés + Sortie longue. Volume optimal pour performer.`,
        keyPrinciple: `💡 ${cfg.conseil}`,
    };
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EXPORT PRINCIPAL — generatePlan (inchangé + limité à 22 semaines)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const generatePlan = (
    settings: Omit<Program, 'id' | 'weeks' | 'totalWeeks'> & { vma?: number; raceInfo?: Program['raceInfo'] }
): Program => {
    const { distance, level, sessionsPerWeek, raceDate, startDate, trainingDays, vma = 14 } = settings;

    const start = startDate ? new Date(startDate) : new Date();
    const race = new Date(raceDate);
    const totalDays = Math.ceil((race.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    // ── LIMITE MAX 22 SEMAINES ──
    const rawWeeks = Math.floor(totalDays / 7);
    const totalWeeks = Math.min(22, Math.max(4, rawWeeks));

    // Jours d'entraînement
    let selectedDays = trainingDays && trainingDays.length === sessionsPerWeek
        ? trainingDays
        : (sessionsPerWeek === 2 ? ['Mercredi', 'Dimanche']
            : sessionsPerWeek === 3 ? ['Mardi', 'Jeudi', 'Dimanche']
            : ['Mardi', 'Mercredi', 'Vendredi', 'Dimanche']);

    selectedDays.sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b));

    const longRunDay = selectedDays[selectedDays.length - 1];
    const intervalDay = selectedDays[0];
    const otherDays = selectedDays.slice(1, selectedDays.length - 1);

    const weeks: Week[] = [];

    for (let i = 1; i <= totalWeeks; i++) {
        const isTaper = i >= totalWeeks - 1;
        const isRecovery = !isTaper && (i % 4 === 0);

        const sessions: Session[] = [];

        selectedDays.forEach(day => {
            let type: Session['type'] = 'Endurance';
            let blocks: WorkoutBlock[] = [];
            let title = 'Footing';

            if (day === longRunDay) {
                type = 'Sortie longue';
                title = isRecovery ? 'Sortie Longue Allégée' : isTaper ? "Sortie d'Affûtage" : 'Sortie Longue';
                blocks = generateLongRun(i, level, totalWeeks, vma, distance, isRecovery);

            } else if (day === intervalDay) {
                if (isTaper) {
                    type = 'Course à rythme';
                    title = "Rappel d'Allure";
                    blocks = [{
                        type: 'Corps de séance',
                        details: `🏁 RAPPEL D'ALLURE — Semaine d'affûtage\n\n20 minutes de footing léger (${getPaceRange(vma, 65, 70)})\n+ 2 × 1km à allure course (${getPace(vma, RACE_PACE_PCT[distance])}/km)\n+ 10 minutes retour au calme\n\n💡 Conseil coach : L'objectif n'est pas de vous fatiguer mais de rappeler à vos muscles l'allure cible. Vos jambes doivent se sentir légères et vives. Si ce n'est pas le cas, réduisez à 1 seul km d'allure course.`,
                        hrZone: "Zone 2-3"
                    }];
                } else {
                    type = 'Fractionné';
                    title = 'Fractionné VMA';
                    blocks = generateIntervalSession(i, level, vma, distance, isRecovery);
                }

            } else if (sessionsPerWeek >= 3 && day === otherDays[0]) {
                type = 'Course à rythme';
                title = isRecovery ? 'Footing Récupération' : 'Allure Spécifique';
                blocks = generateTempoSession(i, level, vma, distance, isRecovery);

            } else {
                type = 'Endurance';
                title = 'Footing';
                blocks = generateFooting(i, level, vma, distance, isRecovery);
            }

            let totalMins = 0;
            blocks.forEach(b => { totalMins += b.duration || 20; });
            const pctForDist = type === 'Fractionné' ? vma * 0.85 : type === 'Course à rythme' ? vma * 0.82 : vma * 0.68;
            const dist = parseFloat(((totalMins / 60) * pctForDist).toFixed(1));

            const weekStart = new Date(start.getTime() + (i - 1) * 7 * 24 * 60 * 60 * 1000);
            const dayIndex = weekStart.getDay() || 7;
            const mondayOffset = weekStart.getDate() - dayIndex + 1;
            const mondayDate = new Date(weekStart.setDate(mondayOffset));
            const targetDayIndex = daysOfWeek.indexOf(day) + 1;
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
                distance: dist,
            });
        });

        let restTipIndex = 0;
        daysOfWeek.forEach(d => {
            if (!selectedDays.includes(d)) {
                sessions.push({
                    id: `r-${i}-${d}`,
                    day: d,
                    type: 'Repos',
                    title: 'Récupération',
                    structure: [{
                        type: 'Info',
                        details: REST_DAY_TIPS[restTipIndex % REST_DAY_TIPS.length]
                    }],
                    completed: false,
                });
                restTipIndex++;
            }
        });

        sessions.sort((a, b) => daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day));

        let weekTitle = `Développement — Semaine ${i}`;
        if (i === 1) weekTitle = "Mise en Route — Semaine 1";
        if (isRecovery) weekTitle = "Semaine d'Assimilation 🔄";
        if (isTaper && i < totalWeeks) weekTitle = "Affûtage — Restez léger 🏁";
        if (i === totalWeeks) weekTitle = "Semaine de Course — Dernière ligne droite 🎯";

        weeks.push({
            weekNumber: i,
            title: weekTitle,
            sessions,
            totalKm: parseFloat(sessions.reduce((sum, s) => sum + (s.distance || 0), 0).toFixed(1)),
            sessionsCount: sessionsPerWeek,
        });
    }

    return {
        id: new Date().toISOString(),
        ...settings,
        startDate: start,
        trainingDays: selectedDays,
        weeks,
        totalWeeks,
    };
};
