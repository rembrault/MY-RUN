
import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Clock, Info, Heart, Zap, Flame, Target, CheckCircle, Footprints, Calendar, GripVertical, Download, X, Smile, Meh, Frown, AlertTriangle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Layout from '../components/Layout';
import { Session, WorkoutBlock, FeedbackType } from '../types';
import { downloadGarminFile } from '../services/garminService';
import NeonButton from '../components/NeonButton';

const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const sessionVisuals: { [key: string]: { icon: React.ElementType, color: string, borderColor: string, textColor: string } } = {
    'Endurance': { icon: Heart, color: 'text-purple-400', borderColor: 'border-purple-500/50', textColor: 'text-purple-300'},
    'Course à rythme': { icon: Zap, color: 'text-blue-400', borderColor: 'border-blue-500/50', textColor: 'text-blue-300'},
    'Fractionné': { icon: Flame, color: 'text-red-400', borderColor: 'border-red-500/50', textColor: 'text-red-300'},
    'Sortie longue': { icon: Footprints, color: 'text-yellow-400', borderColor: 'border-yellow-500/50', textColor: 'text-yellow-300'},
};

const getBlockIcon = (type: WorkoutBlock['type']) => {
    switch(type) {
        case 'Échauffement': return <Flame size={16} className="text-orange-400" />;
        case 'Corps de séance': return <Target size={16} className="text-red-400" />;
        case 'Retour au calme': return <CheckCircle size={16} className="text-green-400" />;
        case 'Info': return <Info size={16} className="text-blue-400" />;
        default: return null;
    }
}

const WeekDetail: React.FC<{ weekIndex: number }> = ({ weekIndex }) => {
    const { program, setPage, updateProgram, adaptProgramIntensity } = useAppContext();
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    const [feedbackSessionId, setFeedbackSessionId] = useState<string | null>(null);
    const [showAdaptationModal, setShowAdaptationModal] = useState(false);
    
    if (!program) {
        return <Layout><div className="text-center text-white">Chargement...</div></Layout>;
    }

    const week = program.weeks[weekIndex];
    if (!week) {
        return <Layout><div className="text-center text-white">Semaine non trouvée.</div></Layout>;
    }
    
    const completedCount = week.sessions.filter(s => s.type !== 'Repos' && s.completed).length;

    // --- LOGIQUE DE FEEDBACK ---
    const handleCheckClick = (session: Session) => {
        if (session.completed) {
            // Si déjà complété, on décoche (annulation)
            toggleComplete(session.id, false);
        } else {
            // Sinon, on ouvre la modale de feedback
            setFeedbackSessionId(session.id);
        }
    };

    const submitFeedback = (feedback: FeedbackType) => {
        if (feedbackSessionId) {
            toggleComplete(feedbackSessionId, true, feedback);
            setFeedbackSessionId(null);
            
            // Check Adaptation Logic : Si "Hard", vérifier les sessions précédentes
            if (feedback === 'hard') {
                checkForAdaptation();
            }
        }
    };

    const toggleComplete = (sessionId: string, status: boolean, feedback?: FeedbackType) => {
        const updatedProgram = { ...program };
        const session = updatedProgram.weeks[weekIndex].sessions.find(s => s.id === sessionId);
        if (session) {
            session.completed = status;
            if (feedback) session.feedback = feedback;
            else if (!status) delete session.feedback; // Remove feedback if unchecked
        }
        updateProgram(updatedProgram);
    };

    const checkForAdaptation = () => {
        // Aplatir toutes les sessions passées jusqu'à maintenant
        const allSessions = program.weeks.flatMap(w => w.sessions).filter(s => s.completed && s.type !== 'Repos');
        // Prendre les 3 dernières
        const last3 = allSessions.slice(-3); // Inclut celle qu'on vient de faire (car on a mis à jour le state localement mais pas encore le contexte global pour la lecture immédiate, mais ici on lit du contexte. Attention au refresh. 
        // Simplification: On compte dans le contexte actuel + celle qu'on vient de valider.
        
        // Pour faire simple et fiable : on regarde si on a 3 "hard" consécutifs dans l'historique récent (en incluant potentiellement celle en cours si on rechargeait).
        // Ici, `program` n'est pas encore mis à jour avec le dernier feedback dans cette closure.
        // On va supposer que l'utilisateur a cliqué "Hard".
        
        let consecutiveHards = 1; // Celle actuelle
        for (let i = allSessions.length - 1; i >= 0; i--) {
            if (allSessions[i].feedback === 'hard') {
                consecutiveHards++;
            } else {
                break;
            }
        }
        
        if (consecutiveHards >= 3) {
            setTimeout(() => setShowAdaptationModal(true), 500);
        }
    };

    const handleAdaptationConfirm = () => {
        adaptProgramIntensity(5); // Réduire de 5%
        setShowAdaptationModal(false);
        alert("Votre VMA a été ajustée. Le plan sera plus doux !");
    };

    // --- DRAG & DROP ---
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, sessionId: string) => {
        e.dataTransfer.setData('sessionId', sessionId);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetSessionId: string) => {
        e.preventDefault();
        setDragOverId(null);
        const draggedSessionId = e.dataTransfer.getData('sessionId');
        if (draggedSessionId === targetSessionId) return;

        const newProgram = { ...program };
        const sessions = [...newProgram.weeks[weekIndex].sessions];
        
        const draggedIndex = sessions.findIndex(s => s.id === draggedSessionId);
        const targetIndex = sessions.findIndex(s => s.id === targetSessionId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        // Échange des jours pour garder la chronologie
        const draggedDay = sessions[draggedIndex].day;
        const targetDay = sessions[targetIndex].day;

        sessions[draggedIndex].day = targetDay;
        sessions[targetIndex].day = draggedDay;

        // Re-trier par jour de la semaine
        sessions.sort((a, b) => daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day));

        newProgram.weeks[weekIndex].sessions = sessions;
        updateProgram(newProgram);
    };

    const handleExportGarmin = (session: Session) => {
        const dayIndex = daysOfWeek.indexOf(session.day);
        const today = new Date();
        const sessionDate = new Date(today.getTime() + (weekIndex * 7 + dayIndex) * 24 * 60 * 60 * 1000);
        downloadGarminFile(session, sessionDate);
    };

    return (
        <Layout showBottomNav={false}>
            <header className="text-center mb-6 relative">
                 <button onClick={() => setPage('home')} className="absolute left-0 p-1 text-gray-400 hover:text-white">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-white">Semaine {week.weekNumber} / {program.totalWeeks}</h1>
            </header>

            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl mb-6 border border-white/10">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-400">Semaine {week.weekNumber}</p>
                        <h2 className="text-xl font-bold text-white">{week.title}</h2>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-bold text-white">{completedCount}/{week.sessionsCount}</p>
                        <p className="text-sm text-gray-400">séances</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-gray-400 text-sm mt-2">
                   <span className="flex items-center gap-1"><MapPin size={14}/> {week.totalKm} km cette semaine</span>
                   <span className="flex items-center gap-1"><Clock size={14}/> {week.sessionsCount} séances</span>
                </div>
            </div>

            <div className="bg-blue-900/40 p-4 rounded-2xl mb-6 flex items-start gap-3 border border-blue-500/30">
                <Info className="text-blue-400 h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                    <h3 className="font-bold text-blue-300">Flexibilité</h3>
                    <p className="text-sm text-blue-200/80">Déplacez vos séances (même sur les jours de repos) avec la poignée <GripVertical className="inline w-3 h-3"/>.</p>
                </div>
            </div>

            <div className="space-y-4 pb-20">
                {week.sessions.map((session) => (
                    <SessionCard 
                        key={session.id} 
                        session={session} 
                        onCheckClick={() => handleCheckClick(session)}
                        onDragStart={(e) => handleDragStart(e, session.id)}
                        onDrop={(e) => handleDrop(e, session.id)}
                        onDragOver={(e) => { e.preventDefault(); setDragOverId(session.id); }}
                        onDragLeave={() => setDragOverId(null)}
                        isDragOver={dragOverId === session.id}
                        onExportGarmin={() => handleExportGarmin(session)}
                    />
                ))}
            </div>

            {/* FEEDBACK MODAL */}
            {feedbackSessionId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#1a1a20] w-full max-w-sm rounded-3xl p-6 border border-white/10 shadow-2xl">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-white mb-2">Séance terminée !</h3>
                            <p className="text-gray-400">Comment vous êtes-vous senti ?</p>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            <button onClick={() => submitFeedback('easy')} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-colors">
                                <Smile size={32} className="text-green-400" />
                                <span className="text-xs font-bold text-green-400">Facile</span>
                            </button>
                            <button onClick={() => submitFeedback('medium')} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 hover:bg-yellow-500/20 transition-colors">
                                <Meh size={32} className="text-yellow-400" />
                                <span className="text-xs font-bold text-yellow-400">Moyen</span>
                            </button>
                            <button onClick={() => submitFeedback('hard')} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-colors">
                                <Frown size={32} className="text-red-400" />
                                <span className="text-xs font-bold text-red-400">Dur</span>
                            </button>
                        </div>
                        <button onClick={() => setFeedbackSessionId(null)} className="w-full py-3 text-gray-500 text-sm font-semibold">Annuler</button>
                    </div>
                </div>
            )}

            {/* ADAPTATION MODAL */}
            {showAdaptationModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in zoom-in-95 duration-300">
                    <div className="bg-[#1a1a20] w-full max-w-sm rounded-3xl p-6 border border-orange-500/30 shadow-2xl relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-orange-500 rounded-t-3xl"></div>
                        <div className="flex justify-center mb-4">
                            <div className="bg-orange-500/20 p-4 rounded-full">
                                <AlertTriangle size={32} className="text-orange-500" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold text-white text-center mb-2">Trop intense ?</h3>
                        <p className="text-gray-300 text-center text-sm mb-6">
                            On dirait que les dernières séances étaient difficiles. Voulez-vous que j'adapte le plan en 
                            <span className="text-orange-400 font-bold"> réduisant vos allures de 5%</span> pour faciliter la récupération ?
                        </p>
                        
                        <div className="space-y-3">
                            <NeonButton onClick={handleAdaptationConfirm} className="py-3">
                                Oui, adapter le plan
                            </NeonButton>
                            <button onClick={() => setShowAdaptationModal(false)} className="w-full py-3 text-gray-400 font-semibold hover:text-white">
                                Non, je continue comme ça
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

interface SessionCardProps {
    session: Session;
    onCheckClick: () => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragLeave: () => void;
    isDragOver: boolean;
    onExportGarmin: () => void;
}


const SessionCard: React.FC<SessionCardProps> = ({ session, onCheckClick, onDragStart, onDrop, onDragOver, onDragLeave, isDragOver, onExportGarmin }) => {
    const commonProps = {
        onDragStart,
        onDrop,
        onDragOver,
        onDragLeave,
        draggable: true,
        className: `relative bg-white/5 backdrop-blur-sm p-4 pl-3 rounded-2xl border transition-all duration-300 touch-manipulation ${isDragOver ? 'border-cyan-400 scale-105 z-10 bg-white/10' : 'border-white/10'}`
    };

    if (session.type === 'Repos') {
        return (
            <div {...commonProps} >
                {/* Drag Handle */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-600 cursor-grab active:cursor-grabbing hover:text-white">
                    <GripVertical size={20} />
                </div>
                <div className="flex justify-between items-center pl-8">
                    <div className="flex items-center gap-4 opacity-50">
                        <div className="p-3 bg-black/20 rounded-full text-gray-500"><Heart size={20} /></div>
                        <div>
                            <p className="text-sm text-gray-400">{session.day}</p>
                            <h3 className="font-bold text-lg text-white">Repos</h3>
                        </div>
                    </div>
                    {/* Zone de drop visuelle pour le repos */}
                    <div className="text-xs text-gray-600 font-mono uppercase tracking-widest">
                        Zone de repos
                    </div>
                </div>
            </div>
        );
    }

    const visuals = sessionVisuals[session.type] || { icon: Zap, color: 'text-cyan-400', borderColor: 'border-cyan-500/50', textColor: 'text-cyan-300' };
    const Icon = visuals.icon;

    return (
        <div {...commonProps} className={`${commonProps.className} ${session.completed ? 'opacity-70 grayscale-[0.5]' : ''}`}>
           {/* Drag Handle */}
           <div className="absolute left-2 top-6 text-gray-500 hover:text-white cursor-grab active:cursor-grabbing">
                <GripVertical size={20} />
            </div>

          <div className="flex items-start justify-between pl-8">
            <div className="flex items-start gap-4">
              <div className={`bg-black/20 p-3 rounded-full ${visuals.color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className={`text-sm text-gray-400 ${session.completed ? 'line-through' : ''}`}>{session.day}</p>
                <h3 className={`font-bold text-lg mt-1 text-white ${session.completed ? 'line-through' : ''}`}>{session.title}</h3>
                
                {/* Feedback Badge */}
                {session.completed && session.feedback && (
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 uppercase tracking-wide
                        ${session.feedback === 'easy' ? 'bg-green-500/20 text-green-300' : 
                          session.feedback === 'medium' ? 'bg-yellow-500/20 text-yellow-300' : 
                          'bg-red-500/20 text-red-300'}`}>
                        {session.feedback === 'easy' ? 'Facile' : session.feedback === 'medium' ? 'Moyen' : 'Difficile'}
                    </div>
                )}
              </div>
            </div>
            
            <button onClick={onCheckClick} className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${session.completed ? 'bg-green-500 border-green-500 scale-110' : 'border-gray-600 hover:border-white'}`}>
                {session.completed && <CheckCircle size={16} className="text-black" />}
            </button>
          </div>

          <div className={`flex items-center gap-4 text-gray-400 text-sm my-4 pl-20 ${session.completed ? 'line-through opacity-50' : ''}`}>
             {session.duration && <span className="flex items-center gap-1 text-white"><Clock size={14} className="text-gray-500"/> ~{session.duration} min</span>}
             {session.distance && <span className="flex items-center gap-1 text-white"><MapPin size={14} className="text-gray-500"/> ~{session.distance} km</span>}
          </div>
          
          <div className="pl-8 ml-3 space-y-3">
              {session.structure.map((block, index) => (
                  <div key={index} className={`bg-black/20 p-3 rounded-lg border-l-2 ${visuals.borderColor}`}>
                      <div className="flex justify-between items-center">
                          <p className={`font-bold text-sm ${visuals.textColor} flex items-center gap-2`}>
                              {getBlockIcon(block.type)}
                              {block.type}
                          </p>
                          {block.duration && <p className="text-xs text-gray-400 font-semibold">~ {block.duration} min</p>}
                      </div>
                      <p className="text-sm text-gray-300 mt-1 ml-1">{block.details}</p>
                  </div>
              ))}
          </div>

          <div className="pl-11 mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <p className="text-xs text-gray-500 font-semibold">EXPORTS</p>
            <div className="flex items-center gap-4">
                <button onClick={() => alert("Fonctionnalité ICS à venir")} className="text-sm text-gray-400 font-semibold flex items-center gap-2 hover:text-white transition-colors">
                    <Calendar size={16} /> ICS
                </button>
                <button onClick={onExportGarmin} className="text-sm text-cyan-400 font-semibold flex items-center gap-2 hover:text-white transition-colors">
                    <Download size={16} /> Garmin
                </button>
            </div>
          </div>
        </div>
    );
};

export default WeekDetail;
