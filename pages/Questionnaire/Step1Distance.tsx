
import React from 'react';
import { Timer, MapPin, Trophy } from 'lucide-react';
import { Distance } from '../../types';

interface Step1Props {
    formData: { distance: Distance };
    onSelect: (field: string, value: any) => void;
    nextStep: () => void;
}

const distances = [
    { value: Distance.TenK, label: '10 KM', description: "Idéal pour débuter ou exploser son chrono.", objectives: "Objectifs de 'Finir' à < 35min.", icon: Timer, color: 'text-cyan-400' },
    { value: Distance.HalfMarathon, label: 'Semi-Marathon', description: 'Le défi intermédiaire parfait.', objectives: "Objectifs de 'Finir' à < 1h20.", icon: MapPin, color: 'text-green-400' },
    { value: Distance.Marathon, label: 'Marathon', description: "L'ultime test d'endurance.", objectives: "Objectifs de 'Finir' à < 3h15.", icon: Trophy, color: 'text-red-400' },
];

const Step1Distance: React.FC<Step1Props> = ({ formData, onSelect, nextStep }) => {
    return (
        <div className="flex flex-col">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Choisis ta distance</h2>
                <p className="text-gray-400">Quelle course veux-tu conquérir ?</p>
            </div>
            <div className="space-y-4">
                {distances.map(d => {
                    const isSelected = formData.distance === d.value;
                    return (
                        <div
                            key={d.value}
                            onClick={() => onSelect('distance', d.value)}
                            className={`bg-white/5 p-4 rounded-2xl border-2 transition-all duration-300 cursor-pointer flex items-center ${isSelected ? 'border-green-400' : 'border-white/10'}`}
                        >
                            <div className={`p-3 bg-black/20 rounded-lg mr-4 ${d.color}`}>
                                <d.icon size={24} />
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-bold text-lg">{d.label}</h3>
                                <p className="text-sm text-gray-400">{d.description}</p>
                                <p className="text-xs text-gray-500 mt-1">{d.objectives}</p>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ml-4 ${isSelected ? 'border-green-400' : 'border-gray-600'}`}>
                                {isSelected && <div className="w-4 h-4 bg-green-400 rounded-full"></div>}
                            </div>
                        </div>
                    );
                })}
            </div>
            <button onClick={nextStep} className="w-full bg-[#00ff87] text-[#0a0a0f] font-bold py-4 px-6 rounded-full mt-8 transition-all duration-300 transform hover:scale-105 neon-green-box">
                Continuer
            </button>
        </div>
    );
};

export default Step1Distance;
    