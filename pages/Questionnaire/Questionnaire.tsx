import React, { useState, useEffect } from 'react';
import { ArrowLeft, LoaderCircle, Check } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Distance, Level, Program } from '../../types';
import Step1Distance from './Step1Distance';
import Step2Level from './Step2Level';
import Step3Personalize from './Step3Personalize';
import ProgramTimingAdvisor from '../../components/ProgramTimingAdvisor';
import ProgramPresentationScreen from '../../components/ProgramPresentation';
import {
    analyzeProgramTiming,
    generateConditioningPlan,
    generateIntensivePlan,
    generatePlan,
    ProgramRecommendation,
} from '../../services/planGenerator';

const Questionnaire: React.FC = () => {
    const { saveProgram, setPage, setPreviousPage, questionnaireStep, setQuestionnaireStep, user } = useAppContext();
    const [step, setStep] = useState(questionnaireStep);
    const [isCreating, setIsCreating] = useState(false);

    // ── États pour le conseiller de timing ──────────────────────
    const [showTimingAdvisor, setShowTimingAdvisor] = useState(false);
    const [timingRec, setTimingRec] = useState<ProgramRecommendation | null>(null);
    const [savedFormData, setSavedFormData] = useState<typeof formData | null>(null);

    // ── États pour la présentation animée ───────────────────────
    const [showPresentation, setShowPresentation] = useState(false);
    const [generatedProgram, setGeneratedProgram] = useState<Program | null>(null);

    const [formData, setFormData] = useState(() => {
        // Restaurer les données du formulaire si on revient du calculateur VMA
        const saved = sessionStorage.getItem('myrun_questionnaire_data');
        if (saved && questionnaireStep > 1) {
            try {
                const parsed = JSON.parse(saved);
                return {
                    ...parsed,
                    raceDate: new Date(parsed.raceDate),
                    startDate: new Date(parsed.startDate),
                    vma: user.vma || parsed.vma || 15,
                };
            } catch { /* ignore */ }
        }
        return {
            distance: Distance.FiveK,
            level: Level.Beginner,
            raceName: '',
            raceDate: new Date(),
            startDate: new Date(),
            trainingDays: [] as string[],
            sessionsPerWeek: 3,
            timeObjective: 'Finir',
            currentMileage: 20,
            vma: user.vma || 15,
            raceInfo: undefined as Program['raceInfo'] | undefined,
        };
    });

    // Sauvegarder le formulaire dans sessionStorage à chaque changement
    useEffect(() => {
        sessionStorage.setItem('myrun_questionnaire_data', JSON.stringify(formData));
    }, [formData]);

    const nextStep = () => setStep(prev => { const next = prev + 1; setQuestionnaireStep(next); return next; });
    const prevStep = () => setStep(prev => { const next = prev - 1; setQuestionnaireStep(next); return next; });

    const handleChange = (input: keyof typeof formData) => (
        e: React.ChangeEvent<HTMLInputElement> | { value: any }
    ) => {
        const value = 'target' in e ? e.target.value : e.value;
        setFormData(prev => ({ ...prev, [input]: value }));
    };

    const handleSelect = (field: keyof typeof formData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // ── Lance la présentation animée puis redirige ───────────────
    const launchWithPresentation = async (program: Program) => {
        await saveProgram(program);
        setGeneratedProgram(program);
        setIsCreating(false);
        setShowPresentation(true);
    };

    // ── Soumission du formulaire — analyse le timing ─────────────
    const handleSubmit = () => {
        setIsCreating(true);
        const raceDate = new Date(formData.raceDate);
        const rec = analyzeProgramTiming(formData.distance, formData.level, raceDate);

        setTimeout(() => {
            if (rec.scenario === 'optimal') {
                const program = generatePlan({ ...formData });
                launchWithPresentation(program);
            } else {
                setSavedFormData({ ...formData });
                setTimingRec(rec);
                setIsCreating(false);
                setShowTimingAdvisor(true);
            }
        }, 1500);
    };

    // ── Handlers pour les choix du TimingAdvisor ─────────────────

    const handleAcceptConditioning = () => {
        if (!savedFormData || !timingRec) return;
        setIsCreating(true);
        setTimeout(() => {
            const conditioningProgram = generateConditioningPlan({
                ...savedFormData,
                conditioningWeeks: timingRec.conditioningWeeks!,
            });
            setShowTimingAdvisor(false);
            launchWithPresentation(conditioningProgram);
        }, 1000);
    };

    const handleAcceptIntensive = () => {
        if (!savedFormData) return;
        setIsCreating(true);
        setTimeout(() => {
            const intensivePlan = generateIntensivePlan({ ...savedFormData });
            setShowTimingAdvisor(false);
            launchWithPresentation(intensivePlan);
        }, 1000);
    };

    const handleAcceptOptimal = () => {
        if (!savedFormData) return;
        setIsCreating(true);
        setTimeout(() => {
            const program = generatePlan({ ...savedFormData });
            setShowTimingAdvisor(false);
            launchWithPresentation(program);
        }, 1000);
    };

    // ── Écran de chargement ──────────────────────────────────────
    if (isCreating) {
        return (
            <div className="futuristic-grid min-h-screen w-full flex items-center justify-center p-4">
                <div className="relative w-full max-w-sm">
                    {/* Glow ambiant */}
                    <div className="absolute inset-0 rounded-3xl blur-2xl opacity-30" style={{ background: 'radial-gradient(circle, rgba(0,255,135,0.3), rgba(0,212,255,0.2))' }} />
                    <div className="relative p-10 rounded-3xl text-center" style={{ background: 'rgba(10,10,18,0.95)', border: '1px solid rgba(0,255,135,0.15)', backdropFilter: 'blur(20px)' }}>
                        {/* Ligne top */}
                        <div className="absolute top-0 left-0 right-0 h-px rounded-t-3xl" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,255,135,0.5), transparent)' }} />
                        {/* Spinner */}
                        <div className="relative w-16 h-16 mx-auto mb-6">
                            <div className="absolute inset-0 rounded-full animate-spin" style={{ border: '2px solid transparent', borderTopColor: '#00ff87', borderRightColor: '#00d4ff' }} />
                            <div className="absolute inset-2 rounded-full animate-ping opacity-20" style={{ background: 'radial-gradient(circle, #00ff87, #00d4ff)' }} />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <LoaderCircle className="h-6 w-6 text-cyan-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }} />
                            </div>
                        </div>
                        <h2 className="text-xl font-black text-white mb-2 tracking-tight">Création de votre programme</h2>
                        <p className="text-gray-500 text-sm">Nous préparons votre plan sur mesure...</p>
                        {/* Barre de progression fictive */}
                        <div className="mt-6 h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full animate-pulse" style={{ background: 'linear-gradient(90deg, #00ff87, #00d4ff)', width: '70%', animation: 'progressFill 1.5s ease-in-out infinite alternate' }} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── Conseiller de timing ─────────────────────────────────────
    if (showTimingAdvisor && timingRec && savedFormData) {
        return (
            <div className="futuristic-grid min-h-screen p-4 flex flex-col justify-center">
                <div className="max-w-lg mx-auto w-full">
                    <ProgramTimingAdvisor
                        distance={savedFormData.distance}
                        level={savedFormData.level}
                        raceDate={new Date(savedFormData.raceDate)}
                        onAcceptOptimal={handleAcceptOptimal}
                        onAcceptConditioning={handleAcceptConditioning}
                        onAcceptIntensive={handleAcceptIntensive}
                    />
                </div>
            </div>
        );
    }

    // ── Présentation animée du programme ─────────────────────────
    if (showPresentation && generatedProgram) {
        return (
            <ProgramPresentationScreen
                program={generatedProgram}
                onComplete={() => {
                    setShowPresentation(false);
                    setGeneratedProgram(null);
                    setQuestionnaireStep(1);
                    sessionStorage.removeItem('myrun_questionnaire_data');
                    setPage('home');
                }}
            />
        );
    }

    // ── Questionnaire principal ──────────────────────────────────
    const steps = [1, 2, 3];

    return (
        <div className="futuristic-grid min-h-screen w-full flex items-center justify-center p-4 md:p-8">
            <div className="relative w-full max-w-lg md:max-w-2xl min-h-[85vh] md:min-h-0 flex flex-col" style={{ background: "rgba(10,10,18,0.6)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "1.5rem", backdropFilter: "blur(12px)", padding: "0" }}>
                <header className="flex items-center p-4 z-10">
                    <button
                        onClick={step === 1 ? () => { setQuestionnaireStep(1); sessionStorage.removeItem('myrun_questionnaire_data'); setPage('welcome'); } : prevStep}
                        className="p-2 text-gray-400 hover:text-white"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div className="flex-1 flex justify-center items-center">
                        {steps.map((s, index) => (
                            <React.Fragment key={s}>
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${
                                        step > s
                                            ? 'bg-orange-500 text-white'
                                            : step === s
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-700 text-gray-400'
                                    }`}
                                >
                                    {step > s ? <Check size={20} /> : s}
                                </div>
                                {index < steps.length - 1 && (
                                    <div
                                        className={`w-10 h-0.5 transition-colors ${
                                            step > s ? 'bg-orange-500' : 'bg-gray-700'
                                        }`}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="w-10" />
                </header>

                <div className="flex-grow overflow-y-auto px-4 pb-4 scrollbar-hide">
                    {step === 1 && (
                        <Step1Distance
                            formData={formData}
                            onSelect={handleSelect}
                            nextStep={nextStep}
                        />
                    )}
                    {step === 2 && (
                        <Step2Level
                            formData={formData}
                            onSelect={handleSelect}
                            nextStep={nextStep}
                        />
                    )}
                    {step === 3 && (
                        <Step3Personalize
                            formData={formData}
                            onChange={handleChange}
                            onSelect={handleSelect}
                            onSubmit={handleSubmit}
                            setPage={setPage}
                            setPreviousPage={setPreviousPage}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Questionnaire;
