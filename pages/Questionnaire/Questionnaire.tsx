import React, { useState } from 'react';
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
    const { createProgram, setPage, user } = useAppContext();
    const [step, setStep] = useState(1);
    const [isCreating, setIsCreating] = useState(false);
    const [showTimingAdvisor, setShowTimingAdvisor] = useState(false);
const [timingRec, setTimingRec] = useState<ProgramRecommendation | null>(null);
const [savedFormData, setSavedFormData] = useState<typeof formData | null>(null);
const [showPresentation, setShowPresentation] = useState(false);
const [generatedProgram, setGeneratedProgram] = useState<Program | null>(null);

    const [formData, setFormData] = useState({
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
    });

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);
    
    const handleChange = (input: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement> | { value: any }) => {
        const value = 'target' in e ? e.target.value : e.value;
        setFormData(prev => ({ ...prev, [input]: value }));
    };

    const handleSelect = (field: keyof typeof formData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    
const launchWithPresentation = (program: Program) => {
    setGeneratedProgram(program);
    setIsCreating(false);
    setShowPresentation(true);
};

const handleSubmit = () => {
    setIsCreating(true);
    const raceDate = new Date(formData.raceDate);
    const rec = analyzeProgramTiming(formData.distance, formData.level, raceDate);

    setTimeout(() => {
        if (rec.scenario === 'optimal') {
            const program = generatePlan({ ...formData, vma: formData.vma });
            createProgram(formData);
            launchWithPresentation(program);
        } else {
            setSavedFormData({ ...formData });
            setTimingRec(rec);
            setIsCreating(false);
            setShowTimingAdvisor(true);
        }
    }, 1500);
};

const handleAcceptConditioning = () => {
    if (!savedFormData || !timingRec) return;
    setIsCreating(true);
    setTimeout(() => {
        const conditioningProgram = generateConditioningPlan({
            ...savedFormData,
            conditioningWeeks: timingRec.conditioningWeeks!,
        });
        createProgram(savedFormData);
        setShowTimingAdvisor(false);
        launchWithPresentation(conditioningProgram);
    }, 1000);
};

const handleAcceptIntensive = () => {
    if (!savedFormData) return;
    setIsCreating(true);
    setTimeout(() => {
        const intensivePlan = generateIntensivePlan({ ...savedFormData });
        createProgram(savedFormData);
        setShowTimingAdvisor(false);
        launchWithPresentation(intensivePlan);
    }, 1000);
};

const handleAcceptOptimal = () => {
    if (!savedFormData) return;
    setIsCreating(true);
    setTimeout(() => {
        const program = generatePlan({ ...savedFormData });
        createProgram(savedFormData);
        setShowTimingAdvisor(false);
        launchWithPresentation(program);
    }, 1000);
};

    if (isCreating) {
        return (
            <div className="futuristic-grid min-h-screen w-full max-w-md mx-auto flex flex-col items-center justify-center">
                <div className="bg-black/80 p-8 rounded-2xl text-center backdrop-blur-sm border border-white/10">
                    <LoaderCircle className="mx-auto h-12 w-12 text-cyan-400 animate-spin mb-4" />
                    <h2 className="text-2xl font-bold mb-2 text-white">Création de votre programme</h2>
                    <p className="text-white text-opacity-80">Nous préparons votre plan sur mesure...</p>
                </div>
            </div>
        );
    }

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

if (showPresentation && generatedProgram) {
    return (
        <ProgramPresentationScreen
            program={generatedProgram}
            onComplete={() => {
                setShowPresentation(false);
                setGeneratedProgram(null);
                setPage('home');
            }}
        />
    );
}
    const steps = [1, 2, 3];

    return (
        <div className="futuristic-grid min-h-screen w-full flex items-center justify-center p-2">
            <div className="relative w-full max-w-md h-[95vh] flex flex-col overflow-hidden">
                <header className="flex items-center p-4 z-10">
                    <button onClick={step === 1 ? () => setPage('welcome') : prevStep} className="p-2 text-gray-400 hover:text-white">
                        <ArrowLeft size={24} />
                    </button>
                     <div className="flex-1 flex justify-center items-center">
                        {steps.map((s, index) => (
                            <React.Fragment key={s}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${step > s ? 'bg-orange-500 text-white' : step === s ? 'bg-orange-500 text-white' : 'bg-gray-700 text-gray-400'}`}>
                                    {step > s ? <Check size={20} /> : s}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`w-10 h-0.5 transition-colors ${step > s ? 'bg-orange-500' : 'bg-gray-700'}`}></div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                    <div className="w-10"></div>
                </header>
                
                <div className="flex-grow overflow-y-auto px-4 pb-4 scrollbar-hide">
                    {step === 1 && <Step1Distance formData={formData} onSelect={handleSelect} nextStep={nextStep} />}
                    {step === 2 && <Step2Level formData={formData} onSelect={handleSelect} nextStep={nextStep} />}
                    {step === 3 && <Step3Personalize formData={formData} onChange={handleChange} onSelect={handleSelect} onSubmit={handleSubmit} setPage={setPage} />}
                </div>
            </div>
        </div>
    );
};

export default Questionnaire;
