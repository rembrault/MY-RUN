
import React, { useState } from 'react';
import { ArrowLeft, LoaderCircle, Check } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import { Distance, Level, Program } from '../../types';
import Step1Distance from './Step1Distance';
import Step2Level from './Step2Level';
import Step3Personalize from './Step3Personalize';

const Questionnaire: React.FC = () => {
    const { createProgram, setPage, user } = useAppContext();
    const [step, setStep] = useState(1);
    const [isCreating, setIsCreating] = useState(false);
    
    const [formData, setFormData] = useState({
        distance: Distance.TenK,
        level: Level.Beginner,
        raceName: '',
        raceDate: new Date(),
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
    
    const handleSubmit = () => {
        setIsCreating(true);
        // Simulate network delay for a better UX
        setTimeout(() => {
            createProgram(formData);
            setIsCreating(false);
        }, 2000);
    };

    if (isCreating) {
        return (
            <div className="futuristic-grid min-h-screen w-full max-w-md mx-auto flex flex-col items-center justify-center">
                <div className="bg-black/80 p-8 rounded-2xl text-center backdrop-blur-sm border border-white/10">
                    <LoaderCircle className="mx-auto h-12 w-12 text-cyan-400 animate-spin mb-4" />
                    <h2 className="text-2xl font-bold mb-2 text-white">Création de votre programme</h2>
                    <p className="text-gray-300">Nous préparons votre plan sur mesure...</p>
                </div>
            </div>
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
