
import React, { useRef } from 'react';
import { Mail, Settings, Trophy, Target, Gauge, CheckCircle, Eye, Trash2, Camera, XCircle, LogIn, LogOut } from 'lucide-react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { Program } from '../types';

const Profile: React.FC = () => {
    const { user, program, deleteProgram, setPage, programHistory, setViewedProgram, updateUser, clearHistory, login, logout, isLoading, isAuthenticated } = useAppContext();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const confirmDelete = () => {
        if (window.confirm("Attention : Cela supprimera définitivement votre programme actuel. Continuer ?")) {
            deleteProgram();
            setPage('welcome');
        }
    };
    
    const confirmClearHistory = () => {
        if (window.confirm("Êtes-vous sûr de vouloir effacer tout l'historique des programmes passés ?")) {
            clearHistory();
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

    if (isLoading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-[60vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="pt-8 pb-8">
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
                    <p className="text-gray-400 flex items-center gap-2 mb-4">
                        {user.email && <><Mail size={14} /> {user.email}</>}
                    </p>

                    {!isAuthenticated ? (
                        <button onClick={login} className="bg-white text-black font-bold py-2 px-6 rounded-full flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors mb-4">
                            <LogIn size={18} /> Se connecter avec Google
                        </button>
                    ) : (
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-green-400 text-xs border border-green-400/30 px-2 py-1 rounded-full bg-green-400/10">Compte synchronisé</span>
                        </div>
                    )}
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
                        <div className="bg-white/5 p-4 rounded-lg flex justify-between items-center">
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
                    <div className="flex justify-between items-center mb-4">
                         <h3 className="font-bold text-lg text-white">Historique</h3>
                         {programHistory.length > 0 && (
                            <button onClick={confirmClearHistory} className="text-xs text-red-400 flex items-center gap-1 hover:text-red-300">
                                <XCircle size={14} /> Effacer tout
                            </button>
                         )}
                    </div>
                   
                    {programHistory.length > 0 ? (
                        <div className="space-y-3">
                        {programHistory.map(p => (
                             <div key={p.id} className="bg-white/5 p-4 rounded-lg flex justify-between items-center">
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

                 <div className="text-center mt-8 space-y-4">
                    <button onClick={() => setPage('edit-profile')} className="bg-cyan-900/50 border border-cyan-500/50 text-cyan-300 font-bold py-3 px-6 rounded-full w-full flex items-center justify-center gap-2 hover:bg-cyan-900/80 transition-colors">
                        <Settings size={18} /> Modifier les informations
                    </button>
                    
                    {isAuthenticated && (
                        <button onClick={logout} className="text-red-400 text-sm flex items-center justify-center gap-2 mx-auto hover:text-red-300 py-2">
                            <LogOut size={16} /> Se déconnecter
                        </button>
                    )}
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
