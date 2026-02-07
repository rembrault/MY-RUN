
import React, { useRef } from 'react';
import { Mail, Settings, Trophy, Target, Gauge, CheckCircle, Eye, Trash2, Camera } from 'lucide-react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { Program } from '../types';

const Profile: React.FC = () => {
    const { user, program, deleteProgram, setPage, programHistory, setViewedProgram, updateUser } = useAppContext();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const confirmDelete = () => {
        if (window.confirm("Attention : Cela supprimera définitivement votre programme actuel. Continuer ?")) {
            deleteProgram();
            setPage('welcome');
        }
    };
    
    const handleViewHistory = (p: Program) => {
        setViewedProgram(p);
        setPage('program-view');
    };

    const handleAvatarChangeClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.result) {
                    updateUser({ avatar: reader.result as string });
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const completedSessions = program ? program.weeks.flatMap(w => w.sessions).filter(s => s.completed).length : 0;
    const totalPrograms = programHistory.length + (program ? 1 : 0);

    return (
        <Layout>
            <div className="pt-8">
                <div className="flex flex-col items-center text-center">
                    <div className="relative">
                        <img src={user.avatar} alt="User Avatar" className="w-24 h-24 rounded-full border-4 border-cyan-500 object-cover" />
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <button onClick={handleAvatarChangeClick} className="absolute -bottom-1 -right-1 bg-gray-700 p-2 rounded-full text-white hover:bg-gray-600">
                            <Camera size={16} />
                        </button>
                    </div>
                    <h2 className="text-2xl font-bold text-white mt-4">{user.name || 'Coureur Anonyme'}</h2>
                    <p className="text-gray-400 flex items-center gap-2">
                        {user.email && <><Mail size={14} /> {user.email}</>}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4 my-8 text-center">
                    <StatBox value={totalPrograms.toString()} label="Programmes" icon={<Trophy />} />
                    <StatBox value={completedSessions.toString()} label="Séances faites" icon={<CheckCircle />} />
                    <StatBox value={user.vma ? `${user.vma} km/h` : 'N/A'} label="VMA" icon={<Gauge />} />
                    <StatBox value={program ? program.timeObjective : 'N/A'} label="Objectif" icon={<Target />} />
                </div>

                <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10 mb-6">
                    <h3 className="font-bold text-lg text-white mb-4">Mon programme actif</h3>
                    {program ? (
                        <div className="bg-black/20 p-4 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-bold text-white">{program.raceName}</p>
                                <p className="text-sm text-gray-400">{program.distance} • {program.totalWeeks} semaines</p>
                            </div>
                            <button 
                                onClick={confirmDelete} 
                                className="text-red-500 p-2 hover:bg-red-500/10 rounded-full cursor-pointer" 
                                title="Supprimer le programme"
                            >
                                <Trash2 size={24} />
                            </button>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <p className="text-gray-400 mb-4">Aucun programme actif</p>
                            <button onClick={() => setPage('new-program')} className="text-green-400 font-semibold">
                                Créer un programme
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                    <h3 className="font-bold text-lg text-white mb-4">Historique des programmes</h3>
                    {programHistory.length > 0 ? (
                        <div className="space-y-3">
                        {programHistory.map(p => (
                             <div key={p.id} className="bg-black/20 p-4 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-bold text-white">{p.raceName}</p>
                                    <p className="text-sm text-gray-400">{p.distance} • {new Date(p.raceDate).toLocaleDateString('fr-FR')}</p>
                                </div>
                                <button onClick={() => handleViewHistory(p)} className="text-cyan-400 p-2 hover:bg-cyan-500/10 rounded-full">
                                    <Eye size={20} />
                                </button>
                            </div>
                        ))}
                        </div>
                    ) : (
                         <div className="text-center py-4">
                            <p className="text-gray-400">Aucun programme dans l'historique.</p>
                        </div>
                    )}
                </div>

                 <div className="text-center mt-8">
                    <button onClick={() => setPage('edit-profile')} className="bg-cyan-500/20 text-cyan-300 font-bold py-3 px-6 rounded-full w-full flex items-center justify-center gap-2">
                        <Settings size={18} /> Modifier les informations
                    </button>
                </div>
            </div>
        </Layout>
    );
};

const StatBox: React.FC<{ value: string; label: string; icon: React.ReactNode }> = ({ value, label, icon }) => (
    <div className="bg-white/5 backdrop-blur-sm p-4 rounded-xl border border-white/10 flex flex-col items-center justify-center">
        <div className="text-orange-400 mb-2">{icon}</div>
        <p className="text-xl font-bold text-white">{value}</p>
        <p className="text-xs text-gray-400">{label}</p>
    </div>
);

export default Profile;
