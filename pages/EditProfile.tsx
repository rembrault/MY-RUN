
import React, { useState } from 'react';
import { ArrowLeft, Scale, Ruler, Calendar, Activity, Gauge, User as UserIcon, Mail } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { User, Level } from '../types';
import Layout from '../components/Layout';
import NeonButton from '../components/NeonButton';

interface EditProfileProps {
    isOnboarding?: boolean;
}

const EditProfile: React.FC<EditProfileProps> = ({ isOnboarding = false }) => {
    const { user, updateUser, setPage, completeOnboarding } = useAppContext();
    const [formData, setFormData] = useState<User>(user);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const handleSave = () => {
        if (!formData.name) {
            alert("Merci d'indiquer votre prénom.");
            return;
        }
        updateUser(formData);
        
        if (isOnboarding) {
            completeOnboarding();
        } else {
            alert('Profil mis à jour !');
            setPage('profile');
        }
    };

    return (
        <Layout showBottomNav={!isOnboarding}>
            <header className="flex items-center mb-6">
                {!isOnboarding && (
                    <button onClick={() => setPage('profile')} className="p-2 text-gray-400 hover:text-white">
                        <ArrowLeft size={24} />
                    </button>
                )}
                <h1 className="text-xl font-bold text-center flex-1 text-white">
                    {isOnboarding ? "Bienvenue ! Créez votre profil" : "Modifier mon profil"}
                </h1>
                {!isOnboarding && <div className="w-10"></div>}
            </header>

            <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                    <InputCard icon={<UserIcon size={18} className="text-cyan-400" />} label="Prénom">
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Votre prénom" className="w-full bg-black/20 rounded-lg p-2.5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-600 font-medium" />
                    </InputCard>
                </div>
                
                <InputCard icon={<Scale size={18} className="text-red-400" />} label="Poids (kg)">
                    <input type="number" name="weight" value={formData.weight || ''} onChange={handleNumberChange} className="w-full bg-black/20 rounded-lg p-2.5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-600 font-medium" />
                </InputCard>

                <InputCard icon={<Ruler size={18} className="text-blue-400" />} label="Taille (cm)">
                    <input type="number" name="height" value={formData.height || ''} onChange={handleNumberChange} className="w-full bg-black/20 rounded-lg p-2.5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-600 font-medium" />
                </InputCard>
                
                <InputCard icon={<Calendar size={18} className="text-purple-400" />} label="Naissance">
                    <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full bg-black/20 rounded-lg p-2.5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm font-medium" style={{ colorScheme: 'dark' }}/>
                </InputCard>

                 <InputCard icon={<Gauge size={18} className="text-orange-400" />} label="VMA (km/h)">
                    <input type="number" step="0.1" name="vma" value={formData.vma || ''} onChange={handleNumberChange} placeholder="Ex: 12.5" className="w-full bg-black/20 rounded-lg p-2.5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-600 font-medium" />
                </InputCard>

                <div className="col-span-2">
                    <InputCard icon={<Activity size={18} className="text-green-400" />} label="Niveau de course">
                        <select name="level" value={formData.level} onChange={handleChange} className="w-full bg-black/20 rounded-lg p-2.5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 font-medium">
                            {Object.values(Level).map(level => (
                                <option key={level} value={level} className="bg-[#111] text-white">{level}</option>
                            ))}
                        </select>
                    </InputCard>
                </div>

                <div className="col-span-2">
                     <InputCard icon={<Mail size={18} className="text-gray-400" />} label="Email (optionnel)">
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@exemple.com" className="w-full bg-black/20 rounded-lg p-2.5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-600 font-medium" />
                    </InputCard>
                </div>
            </div>
            
            <div className="mt-8 mb-6">
                <NeonButton onClick={handleSave}>
                    {isOnboarding ? "Commencer l'aventure" : "Enregistrer les modifications"}
                </NeonButton>
            </div>
        </Layout>
    );
};

const InputCard: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode }> = ({ icon, label, children }) => (
    <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10 h-full flex flex-col justify-center transition-all hover:bg-white/10">
        <div className="flex items-center mb-2">
            <div className="p-1.5 bg-black/20 rounded-md mr-2">{icon}</div>
            <label className="font-bold text-xs text-gray-300 uppercase tracking-wider">{label}</label>
        </div>
        {children}
    </div>
);

export default EditProfile;
