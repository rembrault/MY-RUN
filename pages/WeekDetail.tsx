
import React, { useState } from 'react';
import { ArrowLeft, MapPin, Clock, Download, Info, Heart, Zap, Flame, Target, CheckCircle, Footprints, Calendar } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Layout from '../components/Layout';
import { Session, WorkoutBlock } from '../types';

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

const generateICSFileContent = (session: Session, programStartDate: Date, weekIndex: number): string => {
    const eventDate = new Date(programStartDate);
    const dayIndex = daysOfWeek.indexOf(session.day);
    if (dayIndex === -1) return ''; 
    
    const dateOffset = (weekIndex * 7) + dayIndex;
    eventDate.setDate(eventDate.getDate() + dateOffset);

    const formatDate = (date: Date) => date.toISOString().split('T')[0].replace(/-/g, '');
    const formatDateTime = (date: Date) => date.toISOString().replace(/[-:.]/g, '').split('Z')[0] + 'Z';

    const description = session.structure.map(block => {
        let blockDesc = `${block.type}`;
        if (block.duration) blockDesc += ` (~${block.duration} min)`;
        blockDesc += `:\\n${block.details.replace(/\n/g, '\\n')}`;
        return blockDesc;
    }).join('\\n\\n');

    const uid = `${session.id}-${programStartDate.getTime()}@myrun.app`;
    const now = new Date();

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//MyRunApp//EN',
        'BEGIN:VEVENT',
        `UID:${uid}`,
        `DTSTAMP:${formatDateTime(now)}`,
        `DTSTART;VALUE=DATE:${formatDate(eventDate)}`,
        `SUMMARY:Course: ${session.title}`,
        `DESCRIPTION:${description}`,
        'END:VEVENT',
        'END:VCALENDAR'
    ].join('\r\n');

    return icsContent;
};

const downloadICSFile = (icsContent: string, filename: string) => {
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

const WeekDetail: React.FC<{ weekIndex: number }> = ({ weekIndex }) => {
    const { program, setPage, updateProgram } = useAppContext();
    const [dragOverId, setDragOverId] = useState<string | null>(null);
    
    if (!program) {
        return <Layout><div className="text-center">Chargement...</div></Layout>;
    }

    const week = program.weeks[weekIndex];
    if (!week) {
        return <Layout><div className="text-center">Semaine non trouvée.</div></Layout>;
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

    const handleExportICS = (session: Session) => {
        if (!program || !program.id) return;
        const startDate = new Date(program.id);
        const icsContent = generateICSFileContent(session, startDate, weekIndex);
        if (icsContent) {
            const filename = `MyRun_S${week.weekNumber}_${session.day}.ics`;
            downloadICSFile(icsContent, filename);
        }
    };

    return (
        <Layout showBottomNav={false}>
            <header className="text-center mb-6 relative">
                 <button onClick={() => setPage('home')} className="absolute left-0 p-1 text-gray-400 hover:text-white">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold">Semaine {week.weekNumber} / {program.totalWeeks}</h1>
            </header>

            <div className="bg-white/5 backdrop-blur-sm p-4 rounded-2xl mb-6 border border-white/10">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-sm text-gray-400">Semaine {week.weekNumber}</p>
                        <h2 className="text-xl font-bold">{week.title}</h2>
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
                    <p className="text-sm text-blue-200/80">Vous pouvez glisser-déposer les séances pour réorganiser votre semaine.</p>
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
                        onExportICS={() => handleExportICS(session)}
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
}


const SessionCard: React.FC<SessionCardProps> = ({ session, onToggleComplete, onDragStart, onDrop, onDragOver, onDragLeave, isDragOver, onExportICS }) => {
    const commonProps = {
        onDragStart,
        onDrop,
        onDragOver,
        onDragLeave,
        draggable: true,
        className: `bg-white/5 backdrop-blur-sm p-4 rounded-2xl border transition-all duration-300 cursor-grab active:cursor-grabbing ${isDragOver ? 'border-cyan-400 scale-105' : 'border-white/10'}`
    };

    if (session.type === 'Repos') {
        return (
            <div {...commonProps} >
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-black/20 rounded-full text-gray-500"><Heart size={20} /></div>
                        <div>
                            <p className="text-sm text-gray-400">{session.day}</p>
                            <h3 className="font-bold text-lg">Repos</h3>
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
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`bg-black/20 p-3 rounded-full ${visuals.color}`}>
                <Icon size={20} />
              </div>
              <div>
                <p className={`text-sm text-gray-400 ${session.completed ? 'line-through' : ''}`}>{session.day}</p>
                <h3 className={`font-bold text-lg mt-1 ${session.completed ? 'line-through' : ''}`}>{session.title}</h3>
              </div>
            </div>
            <button onClick={() => onToggleComplete(session.id)} className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0 ${session.completed ? 'bg-green-500 border-green-500' : 'border-gray-600'}`}>
                {session.completed && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
            </button>
          </div>
          <div className={`flex items-center gap-4 text-gray-400 text-sm my-4 pl-16 ${session.completed ? 'line-through' : ''}`}>
             {session.duration && <span className="flex items-center gap-1"><Clock size={14}/> ~{session.duration} min</span>}
             {session.distance && <span className="flex items-center gap-1"><MapPin size={14}/> ~{session.distance} km</span>}
          </div>
          
          <div className="pl-16 space-y-3">
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

          <div className="pl-16 mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <p className="text-xs text-gray-500 font-semibold">EXPORTER</p>
            <div className="flex items-center gap-4">
                 <button onClick={() => alert('Export GPX bientôt disponible!')} className="text-sm text-gray-400 font-semibold flex items-center gap-2 hover:text-white transition-colors">
                    <Download size={16} /> GPX
                </button>
                <button onClick={onExportICS} className="text-sm text-cyan-400 font-semibold flex items-center gap-2 hover:text-white transition-colors">
                    <Calendar size={16} /> Calendrier
                </button>
            </div>
          </div>
        </div>
    );
};

export default WeekDetail;
    