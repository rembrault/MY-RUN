
import React, { useState } from 'react';
import { ArrowLeft, MapPin, Clock, Info, Heart, Zap, Flame, Target, CheckCircle, Footprints, Calendar, GripVertical, Download } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Layout from '../components/Layout';
import { Session, WorkoutBlock } from '../types';
import { downloadGarminFile } from '../services/garminService';

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
    const { program, setPage, updateProgram } = useAppContext();
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    
    if (!program) {
        return <Layout><div className="text-center text-white">Chargement...</div></Layout>;
    }

    const week = program.weeks[weekIndex];
    if (!week) {
        return <Layout><div className="text-center text-white">Semaine non trouvée.</div></Layout>;
    }
    
    const completedCount = week.sessions.filter(s => s.type !== 'Repos' && s.completed).length;

    const toggleComplete = (sessionId: string) => {
        const updatedProgram = { ...program };
        const session = updatedProgram.weeks[weekIndex].sessions.find(s => s.id === sessionId);
        if (session) {
            session.completed = !session.completed;
        }
        updateProgram(updatedProgram);
    };
    
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

        const draggedDay = sessions[draggedIndex].day;
        const targetDay = sessions[targetIndex].day;

        sessions[draggedIndex].day = targetDay;
        sessions[targetIndex].day = draggedDay;

        sessions.sort((a, b) => daysOfWeek.indexOf(a.day) - daysOfWeek.indexOf(b.day));

        newProgram.weeks[weekIndex].sessions = sessions;
        updateProgram(newProgram);
    };

    const handleExportGarmin = (session: Session) => {
        // Estimation de la date de la séance
        const dayIndex = daysOfWeek.indexOf(session.day);
        const today = new Date();
        // On suppose que le programme commence aujourd'hui ou est aligné
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
                    <p className="text-sm text-blue-200/80">Maintenez la poignée <GripVertical className="inline w-3 h-3"/> pour déplacer une séance.</p>
                </div>
            </div>

            <div className="space-y-4">
                {week.sessions.map((session) => (
                    <SessionCard 
                        key={session.id} 
                        session={session} 
                        onToggleComplete={toggleComplete}
                        onDragStart={(e) => handleDragStart(e, session.id)}
                        onDrop={(e) => handleDrop(e, session.id)}
                        onDragOver={(e) => { e.preventDefault(); setDragOverId(session.id); }}
                        onDragLeave={() => setDragOverId(null)}
                        isDragOver={dragOverId === session.id}
                        onExportICS={() => alert("Fonctionnalité ICS à venir")}
                        onExportGarmin={() => handleExportGarmin(session)}
                    />
                ))}
            </div>
        </Layout>
    );
};

interface SessionCardProps {
    session: Session;
    onToggleComplete: (id: string) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragLeave: () => void;
    isDragOver: boolean;
    onExportICS: () => void;
    onExportGarmin: () => void;
}


const SessionCard: React.FC<SessionCardProps> = ({ session, onToggleComplete, onDragStart, onDrop, onDragOver, onDragLeave, isDragOver, onExportICS, onExportGarmin }) => {
    const commonProps = {
        onDragStart,
        onDrop,
        onDragOver,
        onDragLeave,
        draggable: true,
        className: `relative bg-white/5 backdrop-blur-sm p-4 pl-3 rounded-2xl border transition-all duration-300 touch-manipulation ${isDragOver ? 'border-cyan-400 scale-105 z-10' : 'border-white/10'}`
    };

    if (session.type === 'Repos') {
        return (
            <div {...commonProps} >
                {/* Drag Handle */}
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-600 cursor-grab active:cursor-grabbing">
                    <GripVertical size={20} />
                </div>
                <div className="flex justify-between items-center pl-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-black/20 rounded-full text-gray-500"><Heart size={20} /></div>
                        <div>
                            <p className="text-sm text-gray-400">{session.day}</p>
                            <h3 className="font-bold text-lg text-white">Repos</h3>
                        </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-500">Repos</span>
                </div>
            </div>
        );
    }

    const visuals = sessionVisuals[session.type] || { icon: Zap, color: 'text-cyan-400', borderColor: 'border-cyan-500/50', textColor: 'text-cyan-300' };
    const Icon = visuals.icon;

    return (
        <div {...commonProps} className={`${commonProps.className} ${session.completed ? 'opacity-50' : ''}`}>
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
              </div>
            </div>
            <button onClick={() => onToggleComplete(session.id)} className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${session.completed ? 'bg-green-500 border-green-500' : 'border-gray-600'}`}>
                {session.completed && <CheckCircle size={14} className="text-black" />}
            </button>
          </div>
          <div className={`flex items-center gap-4 text-gray-400 text-sm my-4 pl-20 ${session.completed ? 'line-through' : ''}`}>
             {session.duration && <span className="flex items-center gap-1"><Clock size={14}/> ~{session.duration} min</span>}
             {session.distance && <span className="flex items-center gap-1"><MapPin size={14}/> ~{session.distance} km</span>}
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
                <button onClick={onExportICS} className="text-sm text-gray-400 font-semibold flex items-center gap-2 hover:text-white transition-colors">
                    <Calendar size={16} /> ICS
                </button>
                <button onClick={onExportGarmin} className="text-sm text-cyan-400 font-semibold flex items-center gap-2 hover:text-white transition-colors">
                    <Download size={16} /> Garmin (.tcx)
                </button>
            </div>
          </div>
        </div>
    );
};

export default WeekDetail;
