
import React from 'react';
import { Footprints, Zap, Flame } from 'lucide-react';
import { Level } from '../../types';

interface Step2Props {
    formData: { level: Level };
    onSelect: (field: string, value: any) => void;
    nextStep: () => void;
}

const levels = [
    { value: Level.Beginner, label: 'Débutant', description: "Moins d'un an de course ou < 20km/semaine.", icon: Footprints, color: 'text-green-400' },
    { value: Level.Intermediate, label: 'Intermédiaire', description: "Plus d'un an de course, 20-40km/semaine.", icon: Zap, color: 'text-cyan-400' },
    { value: Level.Advanced, label: 'Avancé', description: "Plus de 40km/semaine, recherche de performance.", icon: Flame, color: 'text-orange-400' },
];

const Step2Level: React.FC<Step2Props> = ({ formData, onSelect, nextStep }) => {
    return (
        <div className="flex flex-col h-full">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Quel est votre niveau ?</h2>
                <p className="text-gray-400">Soyez honnête pour un programme adapté.</p>
            </div>
            <div className="space-y-4 flex-grow">
                {levels.map(l => {
                    const isSelected = formData.level === l.value;
                    return (
                        <div
                            key={l.value}
                            onClick={() => onSelect('level', l.value)}
                            className={`bg-white/5 p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-center ${isSelected ? 'border-green-400 bg-white/10' : 'border-white/10 hover:bg-white/10'}`}
                        >
                            <div className={`p-3 bg-black/20 rounded-lg mr-4 ${l.color}`}>
                                <l.icon size={24} />
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-bold text-lg text-white">{l.label}</h3>
                                <p className="text-sm text-gray-300">{l.description}</p>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ml-4 flex-shrink-0 ${isSelected ? 'border-green-400' : 'border-gray-600'}`}>
                                {isSelected && <div className="w-4 h-4 bg-green-400 rounded-full"></div>}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-4 mb-2">
                <button onClick={nextStep} className="w-full bg-[#00ff87] text-[#0a0a0f] font-bold py-4 px-6 rounded-full transition-all duration-300 transform hover:scale-105 neon-green-box">
                    Continuer
                </button>
            </div>
        </div>
    );
};

export default Step2Level;
