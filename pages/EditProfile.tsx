
import React, { useState, useRef } from 'react';
import { ArrowLeft, Scale, Ruler, Calendar, Activity, Gauge, User as UserIcon, Mail, Camera, Minus, Plus } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { User, Level } from '../types';
import Layout from '../components/Layout';
import Modal from '../components/Modal';
import NeonButton from '../components/NeonButton';

interface EditProfileProps {
    isOnboarding?: boolean;
}

const EditProfile: React.FC<EditProfileProps> = ({ isOnboarding = false }) => {
    const { user, updateUser, setPage, completeOnboarding } = useAppContext();
    const [formData, setFormData] = useState<User>(user);
    const [modalInfo, setModalInfo] = useState<{ open: boolean; title: string; message: string; variant: 'success' | 'info' | 'danger' }>({ open: false, title: '', message: '', variant: 'info' });
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    };

    const increment = (field: keyof User, step: number = 1) => {
        setFormData(prev => ({ ...prev, [field]: parseFloat(((Number(prev[field]) || 0) + step).toFixed(1)) }));
    };

    const decrement = (field: keyof User, step: number = 1) => {
        setFormData(prev => ({ ...prev, [field]: Math.max(0, parseFloat(((Number(prev[field]) || 0) - step).toFixed(1))) }));
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.result) {
                    setFormData(prev => ({ ...prev, avatar: reader.result as string }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = () => {
        if (!formData.name) {
            setModalInfo({ open: true, title: 'Champ requis', message: "Merci d'indiquer votre prénom.", variant: 'info' });
            return;
        }
        updateUser(formData);

        if (isOnboarding) {
            completeOnboarding();
        } else {
            setModalInfo({ open: true, title: 'Profil mis à jour', message: 'Vos informations ont bien été enregistrées.', variant: 'success' });
        }
    };

    return (
        <>
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

            {/* Avatar Upload Section */}
            <div className="flex flex-col items-center mb-8">
                <div className="relative cursor-pointer group" onClick={handleAvatarClick}>
                    <img 
                        src={formData.avatar} 
                        alt="Avatar" 
                        className="w-28 h-28 rounded-full border-4 border-cyan-500 object-cover transition-transform group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera size={24} className="text-white" />
                    </div>
                    <div className="absolute bottom-0 right-0 bg-[#1a1a20] p-2 rounded-full text-cyan-400 border border-cyan-500/30 shadow-lg">
                        <Camera size={16} />
                    </div>
                </div>
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                />
                <p className="text-xs text-cyan-400 mt-3 font-medium cursor-pointer" onClick={handleAvatarClick}>
                    Modifier la photo
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                    <InputCard icon={<UserIcon size={18} className="text-cyan-400" />} label="Prénom">
                        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Votre prénom" className="w-full bg-white/5 rounded-lg p-2.5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-500 font-medium" />
                    </InputCard>
                </div>
                
                <InputCard icon={<Scale size={18} className="text-white" />} label="Poids (kg)">
                    <div className="flex items-center gap-1">
                        <button type="button" onClick={() => decrement('weight')} className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-black hover:bg-gray-200 transition-colors shrink-0">
                            <Minus size={14} />
                        </button>
                        <input type="number" name="weight" value={formData.weight || ''} onChange={handleNumberChange} className="flex-1 bg-white/5 rounded-lg p-1.5 text-white text-center border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-500 font-medium min-w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        <button type="button" onClick={() => increment('weight')} className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-black hover:bg-gray-200 transition-colors shrink-0">
                            <Plus size={14} />
                        </button>
                    </div>
                </InputCard>

                <InputCard icon={<Ruler size={18} className="text-white" />} label="Taille (cm)">
                    <div className="flex items-center gap-1">
                        <button type="button" onClick={() => decrement('height')} className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-black hover:bg-gray-200 transition-colors shrink-0">
                            <Minus size={14} />
                        </button>
                        <input type="number" name="height" value={formData.height || ''} onChange={handleNumberChange} className="flex-1 bg-white/5 rounded-lg p-1.5 text-white text-center border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-500 font-medium min-w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        <button type="button" onClick={() => increment('height')} className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-black hover:bg-gray-200 transition-colors shrink-0">
                            <Plus size={14} />
                        </button>
                    </div>
                </InputCard>
                
                <InputCard icon={<Calendar size={18} className="text-purple-400" />} label="Naissance">
                    <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full bg-white/5 rounded-lg p-2.5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-sm font-medium" style={{ colorScheme: 'dark' }}/>
                </InputCard>

                 <InputCard icon={<Gauge size={18} className="text-white" />} label="VMA (km/h)">
                    <div className="flex items-center gap-1">
                        <button type="button" onClick={() => decrement('vma', 0.5)} className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-black hover:bg-gray-200 transition-colors shrink-0">
                            <Minus size={14} />
                        </button>
                        <input type="number" step="0.1" name="vma" value={formData.vma || ''} onChange={handleNumberChange} placeholder="Ex: 12.5" className="flex-1 bg-white/5 rounded-lg p-1.5 text-white text-center border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-500 font-medium min-w-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                        <button type="button" onClick={() => increment('vma', 0.5)} className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-black hover:bg-gray-200 transition-colors shrink-0">
                            <Plus size={14} />
                        </button>
                    </div>
                </InputCard>

                <div className="col-span-2">
                    <InputCard icon={<Activity size={18} className="text-green-400" />} label="Niveau de course">
                        <select name="level" value={formData.level} onChange={handleChange} className="w-full bg-white/5 rounded-lg p-2.5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 font-medium">
                            {Object.values(Level).map(level => (
                                <option key={level} value={level} className="bg-[#111] text-white">{level}</option>
                            ))}
                        </select>
                    </InputCard>
                </div>

                <div className="col-span-2">
                     <InputCard icon={<Mail size={18} className="text-gray-400" />} label="Email (optionnel)">
                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="email@exemple.com" className="w-full bg-white/5 rounded-lg p-2.5 text-white border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder-gray-500 font-medium" />
                    </InputCard>
                </div>
            </div>
            
            <div className="mt-8 mb-6">
                <NeonButton onClick={handleSave}>
                    {isOnboarding ? "Commencer l'aventure" : "Enregistrer les modifications"}
                </NeonButton>
            </div>
        </Layout>

        <Modal
            open={modalInfo.open}
            onClose={() => {
                setModalInfo(prev => ({ ...prev, open: false }));
                if (modalInfo.variant === 'success') setPage('profile');
            }}
            variant={modalInfo.variant}
            title={modalInfo.title}
            message={modalInfo.message}
            confirmLabel="OK"
            singleAction
            onConfirm={() => {
                if (modalInfo.variant === 'success') setPage('profile');
            }}
        />
        </>
    );
};

const InputCard: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode }> = ({ icon, label, children }) => (
    <div className="bg-white/5 backdrop-blur-sm p-3 rounded-xl border border-white/10 h-full flex flex-col justify-center transition-all hover:bg-white/10">
        <div className="flex items-center mb-2">
            <div className="p-1.5 bg-white/5 rounded-md mr-2">{icon}</div>
            <label className="font-bold text-xs text-gray-300 uppercase tracking-wider">{label}</label>
        </div>
        {children}
    </div>
);

export default EditProfile;
