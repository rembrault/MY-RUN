
import React from 'react';
import { ArrowLeft, Calendar, TrendingUp, Target, Footprints, Info, CheckCircle, Flame, Heart, Zap } from 'lucide-react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { WorkoutBlock } from '../types';

const getBlockIcon = (type: WorkoutBlock['type']) => {
    switch(type) {
        case 'Échauffement': return <Flame size={16} className="text-orange-400" />;
        case 'Corps de séance': return <Target size={16} className="text-red-400" />;
        case 'Retour au calme': return <CheckCircle size={16} className="text-green-400" />;
        case 'Info': return <Info size={16} className="text-blue-400" />;
        default: return null;
    }
}

const ProgramView: React.FC = () => {
    const { viewedProgram, setPage, setViewedProgram } = useAppContext();

    if (!viewedProgram) {
        return (
            <Layout>
                <div className="text-center pt-20">
                    <h2 className="text-2xl font-bold text-white">Programme non trouvé</h2>
                    <p className="text-gray-400 mt-2">Aucun programme n'a été sélectionné pour la visualisation.</p>
                    <button onClick={() => setPage('profile')} className="mt-6 bg-cyan-500 text-black font-bold py-3 px-6 rounded-full">
                        Retour au profil
                    </button>
                </div>
            </Layout>
        );
    }
    
    const handleBack = () => {
        setViewedProgram(null);
        setPage('profile');
    };

    const raceDate = new Date(viewedProgram.raceDate);
    const raceDateString = raceDate.toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    
    const allSessions = viewedProgram.weeks.flatMap(week => week.sessions.filter(s => s.type !== 'Repos'));
    const completedSessionsCount = allSessions.filter(s => s.completed).length;
    const totalProgress = allSessions.length > 0 ? Math.round((completedSessionsCount / allSessions.length) * 100) : 0;
    const totalKm = viewedProgram.weeks.reduce((acc, week) => acc + week.totalKm, 0);

    const sessionVisuals: { [key: string]: { icon: React.ElementType, color: string, borderColor: string } } = {
        'Endurance': { icon: Heart, color: 'text-purple-400', borderColor: 'border-purple-500/50'},
        'Course à rythme': { icon: Zap, color: 'text-blue-400', borderColor: 'border-blue-500/50'},
        'Fractionné': { icon: Flame, color: 'text-red-400', borderColor: 'border-red-500/50'},
        'Sortie longue': { icon: Footprints, color: 'text-yellow-400', borderColor: 'border-yellow-500/50'},
    };

    return (
        <Layout showBottomNav={false}>
            <header className="flex items-center mb-6">
                <button onClick={handleBack} className="p-2 text-gray-400 hover:text-white">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-white text-center flex-1">{viewedProgram.raceName || "Détail du Programme"}</h1>
                <div className="w-10"></div>
            </header>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <StatCard icon={<Calendar className="text-red-400" />} label="Course" value={raceDateString} subtitle={viewedProgram.distance} colorClasses="border-red-400/20" />
                <StatCard icon={<TrendingUp className="text-yellow-400" />} label="Progression" value={`${totalProgress}%`} subtitle={`${completedSessionsCount}/${allSessions.length} séances`} colorClasses="border-yellow-400/20" />
                <StatCard icon={<Footprints className="text-blue-400" />} label="Distance totale" value={`${Math.round(totalKm)} km`} subtitle={`sur ${viewedProgram.totalWeeks} semaines`} colorClasses="border-blue-400/20" />
                <StatCard icon={<Target className="text-green-400" />} label="Objectif" value={viewedProgram.timeObjective} subtitle={`VMA: ${viewedProgram.vma || 'N/A'} km/h`} colorClasses="border-green-400/20" />
            </div>

            <div className="space-y-6">
                {viewedProgram.weeks.map((week) => (
                    <div key={week.weekNumber} className="bg-white/5 p-4 rounded-2xl border border-white/10">
                        <h2 className="text-lg font-bold text-white mb-3">Semaine {week.weekNumber}</h2>
                        <div className="space-y-3">
                        {week.sessions.filter(s => s.type !== 'Repos').map(session => {
                             const visuals = sessionVisuals[session.type] || { icon: Zap, color: 'text-cyan-400', borderColor: 'border-cyan-500/50' };
                             const Icon = visuals.icon;
                             return (
                                <div key={session.id} className="bg-black/20 p-3 rounded-xl">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-start gap-3">
                                            <Icon size={20} className={`mt-1 ${visuals.color}`} />
                                            <div>
                                                <p className="font-bold text-white">{session.day} - {session.title}</p>
                                                <p className="text-xs text-gray-400">{session.duration ? `~${session.duration}min` : ''} {session.distance ? `• ~${session.distance}km` : ''}</p>
                                            </div>
                                        </div>
                                        {session.completed && <CheckCircle size={20} className="text-green-500" />}
                                    </div>
                                    <div className="pl-8 mt-2 space-y-2">
                                        {session.structure.map((block, index) => (
                                            <div key={index} className={`text-sm p-2 rounded-lg border-l-2 bg-black/30 ${visuals.borderColor}`}>
                                                <p className="font-semibold text-gray-300 flex items-center gap-2">{getBlockIcon(block.type)} {block.type}</p>
                                                <p className="text-gray-400 text-xs mt-1 ml-1">{block.details}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                             )
                        })}
                        </div>
                    </div>
                ))}
            </div>
        </Layout>
    );
};

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    subtitle: string;
    colorClasses: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subtitle, colorClasses }) => (
    <div className={`bg-gradient-to-br from-white/10 to-white/5 p-4 rounded-2xl border flex flex-col justify-between h-32 ${colorClasses}`}>
        <div>
            <div className="flex items-center gap-2">
                <div className="p-1 bg-black/20 rounded-md">{icon}</div>
                <span className="text-sm font-semibold text-gray-400">{label}</span>
            </div>
        </div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
    </div>
);

export default ProgramView;
    