
import React from 'react';
import { Calendar, TrendingUp, Target, Trash2, Footprints, Lock, Plus } from 'lucide-react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';

// Fix: Removed explicit React.FC type to resolve a type inference issue that caused cascading errors.
const Home = () => {
    const { program, setPage, deleteProgram, isPaid, user } = useAppContext();

    if (!program) {
        return (
            <Layout>
                <div className="text-center pt-20">
                    <h2 className="text-2xl font-bold">Aucun programme actif</h2>
                    <p className="text-gray-400 mt-2">Créez votre programme pour commencer.</p>
                    <button onClick={() => setPage('new-program')} className="mt-6 bg-green-500 text-black font-bold py-3 px-6 rounded-full">
                        Créer un programme
                    </button>
                </div>
            </Layout>
        );
    }
    
    const confirmDelete = () => {
        if (window.confirm('Voulez-vous supprimer ce programme ? Il sera archivé dans votre historique et ne sera plus votre programme actif.')) {
            deleteProgram();
        }
    };
    
    const handleGenerateNewProgram = () => {
        if (window.confirm('Voulez-vous archiver votre programme actuel et en créer un nouveau ? Votre programme actuel sera sauvegardé dans votre historique.')) {
            deleteProgram();
            setPage('new-program');
        }
    };

    const today = new Date();
    const raceDate = new Date(program.raceDate);
    const daysUntilRace = Math.max(0, Math.ceil((raceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    
    const allSessions = program.weeks.flatMap(week => week.sessions.filter(s => s.type !== 'Repos'));
    const completedSessionsCount = allSessions.filter(s => s.completed).length;
    const totalProgress = allSessions.length > 0 ? Math.round((completedSessionsCount / allSessions.length) * 100) : 0;
    const totalKm = program.weeks.reduce((acc, week) => acc + week.totalKm, 0);

    const raceDateString = raceDate.toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    
    const upcomingSessions = program.weeks
      .flatMap(week => week.sessions.map(s => ({ ...s, weekNumber: week.weekNumber })))
      .filter(s => s.type !== 'Repos' && !s.completed)
      .slice(0, 3);
      
    const sessionColors: { [key: string]: string } = {
        'Endurance': 'border-purple-500',
        'Course à rythme': 'border-blue-500',
        'Fractionné': 'border-red-500',
        'Sortie longue': 'border-yellow-500'
    };
    
    const sessionTagColors: { [key: string]: string } = {
        'Endurance': 'bg-purple-500/20 text-purple-300',
        'Course à rythme': 'bg-blue-500/20 text-blue-300',
        'Fractionné': 'bg-red-500/20 text-red-300',
        'Sortie longue': 'bg-yellow-500/20 text-yellow-300'
    };
    
    return (
        <Layout>
            <header className="mb-6">
                <p className="text-gray-400 text-lg">Bonjour, {user.name}!</p>
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-white">{program.raceName || "Mon Programme"}</h1>
                    <button onClick={confirmDelete} className="text-red-500 p-2 hover:bg-red-500/10 rounded-full" title="Supprimer le programme">
                        <Trash2 size={20} />
                    </button>
                </div>
            </header>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
                <StatCard icon={<Calendar className="text-red-400" />} label="Jour J" value={`J-${daysUntilRace}`} subtitle={raceDateString} colorClasses="border-red-400/20 hover:border-red-400" />
                <StatCard icon={<TrendingUp className="text-yellow-400" />} label="Progression" value={`${totalProgress}%`} subtitle={`${completedSessionsCount}/${allSessions.length} séances`} colorClasses="border-yellow-400/20 hover:border-yellow-400" />
                <StatCard icon={<Footprints className="text-blue-400" />} label="Distance totale" value={`${Math.round(totalKm)} km`} subtitle={`sur ${program.totalWeeks} semaines`} colorClasses="border-blue-400/20 hover:border-blue-400" />
                <StatCard icon={<Target className="text-green-400" />} label="Objectif" value={program.timeObjective} subtitle={program.distance} colorClasses="border-green-400/20 hover:border-green-400" />
            </div>

            {upcomingSessions.length > 0 && (
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 mb-8">
                    <h2 className="text-xl font-bold mb-4">Prochaines Séances</h2>
                    <div className="space-y-3">
                        {upcomingSessions.map((session) => (
                             <div key={session.id} className={`bg-black/20 p-3 rounded-xl border-l-4 ${sessionColors[session.type] || 'border-gray-500'}`}>
                                 <p className="text-xs text-gray-400">Semaine {session.weekNumber} • {session.day}</p>
                                 <div className="flex justify-between items-center mt-1">
                                    <h3 className="font-semibold text-md">{session.title}</h3>
                                    <span className={`text-xs font-semibold px-2 py-1 rounded-md ${sessionTagColors[session.type]}`}>{session.type === 'Course à rythme' ? 'Rythme' : session.type}</span>
                                 </div>
                             </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                <h2 className="text-xl font-bold mb-4">Mon Programme</h2>
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
                                onClick={() => isLocked ? setPage('payment') : setPage(`week-${index}`)}
                                className={`bg-black/20 p-4 rounded-xl border border-white/10 flex justify-between items-center transition-all duration-300 
                                    ${isLocked ? 'opacity-60' : 'cursor-pointer hover:bg-white/20 hover:border-cyan-400/50'}
                                    ${isCompleted ? '!border-green-500 neon-green-box' : ''}
                                `}
                            >
                                <div>
                                    <div className="flex items-center gap-3">
                                        <p className="font-bold text-lg">Semaine {week.weekNumber}</p>
                                        {isFirstWeek && !isPaid && (
                                            <span className="bg-green-500/20 text-green-300 text-[10px] font-bold px-2 py-1 rounded-full">
                                                SEMAINE GRATUITE
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1">{week.title}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <p className="font-semibold">{completedInWeek}/{week.sessionsCount}</p>
                                        <p className="text-xs text-gray-500">séances</p>
                                    </div>
                                    {isLocked && <Lock size={20} className="text-yellow-400" />}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-8">
                    <button 
                        onClick={handleGenerateNewProgram}
                        className="w-full bg-white/10 text-white font-bold py-3 px-6 rounded-full flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
                    >
                        <Plus size={18} />
                        Générer un nouveau programme
                    </button>
                </div>
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
    <div className={`bg-gradient-to-br from-white/10 to-white/5 p-4 rounded-2xl border flex flex-col justify-between h-32 transition-all duration-300 hover:scale-105 ${colorClasses}`}>
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

export default Home;
