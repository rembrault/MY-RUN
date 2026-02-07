
import React from 'react';
import { Zap, Footprints, Trophy } from 'lucide-react';
import { Distance } from '../../types';

interface Step1Props {
    formData: { distance: Distance };
    onSelect: (field: string, value: any) => void;
    nextStep: () => void;
}

const distances = [
    { 
        value: Distance.TenK, 
        label: '10 KM', 
        description: 'Vitesse & Intensité.',
        icon: Zap,
        color: 'text-cyan-400',
        borderColor: 'border-cyan-500/50'
    },
    { 
        value: Distance.HalfMarathon, 
        label: 'Semi-Marathon', 
        description: 'Endurance & Vitesse.',
        icon: Footprints,
        color: 'text-green-400',
        borderColor: 'border-green-500/50'
    },
    { 
        value: Distance.Marathon, 
        label: 'Marathon', 
        description: 'Le défi ultime.',
        icon: Trophy,
        color: 'text-orange-400',
        borderColor: 'border-orange-500/50'
    },
];

const Step1Distance: React.FC<Step1Props> = ({ formData, onSelect, nextStep }) => {
    return (
        <div className="flex flex-col h-full">
            <div className="text-center mb-4">
                <h2 className="text-2xl font-bold text-white mb-1">Votre Objectif</h2>
                <p className="text-sm text-gray-400">Quelle distance préparez-vous ?</p>
            </div>
            
            <div className="space-y-3 px-1 flex-grow">
                {distances.map((d) => {
                    const isSelected = formData.distance === d.value;
                    return (
                        <div
                            key={d.value}
                            onClick={() => onSelect('distance', d.value)}
                            className={`p-3 rounded-xl border-2 transition-all duration-300 cursor-pointer flex items-center group ${isSelected ? `${d.borderColor} bg-white/10` : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
                        >
                            <div className={`p-2 bg-black/30 rounded-lg mr-3 ${d.color} transition-transform group-hover:scale-110`}>
                                <d.icon size={20} />
                            </div>
                            <div className="flex-grow">
                                <h3 className="font-bold text-md text-white">{d.label}</h3>
                                <p className="text-xs text-gray-400">{d.description}</p>
                            </div>
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ml-2 flex-shrink-0 ${isSelected ? 'border-green-400' : 'border-gray-600'}`}>
                                {isSelected && <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_8px_rgba(74,222,128,0.8)]"></div>}
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

export default Step1Distance;
