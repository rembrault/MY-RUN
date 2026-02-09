
import React, { useRef } from 'react';
import { Lock, Plus, Trash2, Eye, Trophy, Calendar, Camera, Check, Image as ImageIcon } from 'lucide-react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { Program } from '../types';

const MyPrograms: React.FC = () => {
    const { program, setPage, deleteProgram, isPaid, programHistory, setViewedProgram, updateProgram } = useAppContext();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleGenerateNewProgram = () => {
        if (!program || window.confirm('Voulez-vous archiver votre programme actuel et en créer un nouveau ?')) {
            if (program) deleteProgram(); // Archive current
            setPage('new-program');
        }
    };

    const confirmDelete = () => {
        if (window.confirm('Voulez-vous vraiment supprimer ce programme ? Toutes les données seront effacées.')) {
            deleteProgram();
            setPage('home'); // Go back to dashboard after delete
        }
    };

    const handleViewHistory = (p: Program) => {
        setViewedProgram(p);
        setPage('program-view');
    };

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && program) {
            const reader = new FileReader();
            reader.onload = () => {
                if (reader.result) {
                    const updatedProgram = { ...program, image: reader.result as string };
                    updateProgram(updatedProgram);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Layout>
            <div className="pt-4 pb-20">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-white">Mes Programmes</h1>
                    {program && (
                         <button 
                            onClick={confirmDelete} 
                            className="text-red-500 p-2 hover:bg-red-500/10 rounded-full transition-colors" 
                            title="Supprimer le programme actif"
                        >
                            <Trash2 size={20} />
                        </button>
                    )}
                </header>

                {/* PROGRAMME ACTIF */}
                {program ? (
                    <div className="mb-10">
                        {/* PROGRAMME BANNER / IMAGE */}
                        <div className="relative h-48 rounded-2xl overflow-hidden mb-6 border border-white/10 group shadow-lg">
                            {program.image ? (
                                <img src={program.image} alt="Program cover" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-900 via-[#0a0a0f] to-black flex items-center justify-center">
                                     <ImageIcon size={48} className="text-white/10" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                            
                            <div className="absolute bottom-4 left-4 right-4">
                                 <span className="text-green-400 text-[10px] font-bold uppercase tracking-wider bg-green-900/30 border border-green-500/30 px-2 py-1 rounded-md backdrop-blur-md shadow-sm">En cours</span>
                                 <h2 className="text-2xl font-bold text-white mt-2 text-shadow-sm leading-tight">{program.raceName}</h2>
                                 <p className="text-sm text-gray-300 mt-1 flex items-center gap-2">
                                    <span>{program.distance}</span>
                                    <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                                    <span>{program.totalWeeks} semaines</span>
                                 </p>
                            </div>

                            <button 
                                onClick={handleImageClick}
                                className="absolute top-3 right-3 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white backdrop-blur-md transition-all border border-white/10"
                            >
                                <Camera size={18} />
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                            />
                        </div>

                        <div className="space-y-3">
                            {program.weeks.map((week, index) => {
                                const isLocked = !isPaid && index > 0;
                                const isFirstWeek = index === 0;
                                const nonRestSessions = week.sessions.filter(s => s.type !== 'Repos');
                                const completedInWeek = nonRestSessions.filter(s => s.completed).length;
                                const isCompleted = nonRestSessions.length > 0 && completedInWeek === nonRestSessions.length;

                                return (
                                    <div
                                        key={week.weekNumber}
                                        onClick={() => isLocked ? setPage('payment') : setPage(`week-${index}` as any)}
                                        className={`p-4 rounded-xl border flex justify-between items-center transition-all duration-300 
                                            ${isLocked ? 'opacity-60 bg-white/5 border-white/10' : 'cursor-pointer hover:bg-white/10'}
                                            ${isCompleted 
                                                ? 'border-green-500 bg-green-500/10 shadow-[0_0_15px_rgba(34,197,94,0.15)]' 
                                                : 'bg-white/5 border-white/10 hover:border-cyan-400/50'
                                            }
                                        `}
                                    >
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <p className={`font-bold text-lg ${isCompleted ? 'text-green-400' : 'text-white'}`}>
                                                    Semaine {week.weekNumber}
                                                </p>
                                                {isCompleted && (
                                                    <div className="bg-green-500 text-black rounded-full p-0.5">
                                                        <Check size={12} strokeWidth={4} />
                                                    </div>
                                                )}
                                                {isFirstWeek && !isPaid && !isCompleted && (
                                                    <span className="bg-green-500/20 text-green-300 text-[10px] font-bold px-2 py-1 rounded-full">
                                                        GRATUIT
                                                    </span>
                                                )}
                                            </div>
                                            <p className={`text-sm mt-1 ${isCompleted ? 'text-green-200/70' : 'text-gray-400'}`}>
                                                {week.title}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className={`font-semibold ${isCompleted ? 'text-green-300' : 'text-white'}`}>
                                                    {completedInWeek}/{week.sessionsCount}
                                                </p>
                                                <p className={`text-xs ${isCompleted ? 'text-green-400/50' : 'text-gray-500'}`}>séances</p>
                                            </div>
                                            {isLocked && <Lock size={20} className="text-yellow-400" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/5 p-8 rounded-2xl border border-white/10 text-center mb-8">
                        <p className="text-gray-300 mb-4">Vous n'avez pas de programme actif.</p>
                         <button 
                            onClick={handleGenerateNewProgram}
                            className="bg-green-500 text-black font-bold py-3 px-6 rounded-full inline-flex items-center gap-2 hover:scale-105 transition-transform"
                        >
                            <Plus size={18} /> Créer un programme
                        </button>
                    </div>
                )}

                {/* HISTORIQUE */}
                <div>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Trophy size={18} className="text-yellow-400" /> Historique
                    </h3>
                    
                    {programHistory.length > 0 ? (
                        <div className="space-y-3">
                            {programHistory.map(p => (
                                <div key={p.id} className="bg-black/20 p-4 rounded-xl flex justify-between items-center border border-white/5">
                                    <div>
                                        <p className="font-bold text-white">{p.raceName}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                            <span>{p.distance}</span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1"><Calendar size={10}/> {new Date(p.raceDate).toLocaleDateString('fr-FR')}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => handleViewHistory(p)} className="text-cyan-400 p-2 hover:bg-cyan-500/10 rounded-full">
                                        <Eye size={20} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic">Aucun programme terminé.</p>
                    )}
                </div>

                {/* BOUTON CRÉATION SI PROGRAMME EXISTE DÉJÀ (Pour le remplacer) */}
                {program && (
                    <div className="mt-8 pt-6 border-t border-white/10">
                         <button 
                            onClick={handleGenerateNewProgram}
                            className="w-full bg-white/5 text-gray-300 font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-white/10 transition-colors text-sm"
                        >
                            <Plus size={16} />
                            Commencer un nouveau programme
                        </button>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default MyPrograms;
