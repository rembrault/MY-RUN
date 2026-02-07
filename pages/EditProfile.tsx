
import React, { useState } from 'react';
import { ArrowLeft, Scale, Ruler, Calendar, Activity, Gauge } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { User, Level } from '../types';
import Layout from '../components/Layout';
import NeonButton from '../components/NeonButton';

const EditProfile: React.FC = () => {
    const { user, updateUser, setPage } = useAppContext();
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
        updateUser(formData);
        alert('Profil mis à jour !');
        setPage('profile');
    };

    return (
        <Layout showBottomNav={true}>
            <header className="flex items-center mb-6">
                <button onClick={() => setPage('profile')} className="p-2 text-gray-400 hover:text-white">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-center flex-1">Modifier mon profil</h1>
                <div className="w-10"></div>
            </header>

            <div className="space-y-6">
                <InputCard icon={<Scale className="text-red-400" />} label="Poids (kg)">
                    <input type="number" name="weight" value={formData.weight} onChange={handleNumberChange} className="w-full bg-black/20 rounded-lg p-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                </InputCard>
                <InputCard icon={<Ruler className="text-blue-400" />} label="Taille (cm)">
                    <input type="number" name="height" value={formData.height} onChange={handleNumberChange} className="w-full bg-black/20 rounded-lg p-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                </InputCard>
                <InputCard icon={<Calendar className="text-purple-400" />} label="Date de naissance">
                    <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full bg-black/20 rounded-lg p-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400" style={{ colorScheme: 'dark' }}/>
                </InputCard>
                 <InputCard icon={<Gauge className="text-orange-400" />} label="VMA (km/h)">
                    <input type="number" step="0.1" name="vma" value={formData.vma || ''} onChange={handleNumberChange} className="w-full bg-black/20 rounded-lg p-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400" />
                </InputCard>
                <InputCard icon={<Activity className="text-green-400" />} label="Niveau de course">
                     <select name="level" value={formData.level} onChange={handleChange} className="w-full bg-black/20 rounded-lg p-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                        {Object.values(Level).map(level => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </select>
                </InputCard>
            </div>
            
            <div className="mt-10">
                <NeonButton onClick={handleSave}>
                    Enregistrer les modifications
                </NeonButton>
            </div>
        </Layout>
    );
};

const InputCard: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode }> = ({ icon, label, children }) => (
    <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
        <div className="flex items-center mb-3">
            <div className="p-2 bg-black/20 rounded-lg mr-3">{icon}</div>
            <label className="font-semibold">{label}</label>
        </div>
        {children}
    </div>
);

export default EditProfile;
    