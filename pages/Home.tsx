
import React from 'react';
import { Calendar, TrendingUp, Target, ArrowRight, Play, Zap } from 'lucide-react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import NeonButton from '../components/NeonButton';

const Home = () => {
    const { program, setPage, user } = useAppContext();

    if (!program) {
        return (
            <Layout>
                <div className="flex flex-col h-full pt-10">
                    <header className="mb-8">
                        <p className="text-gray-400 text-lg">Bonjour, {user.name}!</p>
                        <h1 className="text-3xl font-bold text-white mt-1">Prêt à courir ?</h1>
                    </header>

                    <div className="flex-grow flex flex-col items-center justify-center text-center">
                        <div className="bg-white/5 p-8 rounded-full mb-6 border border-white/10">
                            <Zap size={48} className="text-cyan-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Aucun programme actif</h2>
                        <p className="text-gray-400 mb-8 max-w-xs">
                            Créez votre programme personnalisé pour atteindre vos objectifs 10km, Semi ou Marathon.
                        </p>
                        <NeonButton onClick={() => setPage('new-program')} icon={<Play size={20} />}>
                            Créer un programme
                        </NeonButton>
                    </div>
                </div>
            </Layout>
        );
    }
    
    const today = new Date();
    const raceDate = new Date(program.raceDate);
    const daysUntilRace = Math.max(0, Math.ceil((raceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    
    const allSessions = program.weeks.flatMap(week => week.sessions.filter(s => s.type !== 'Repos'));
    const completedSessionsCount = allSessions.filter(s => s.completed).length;
    const totalProgress = allSessions.length > 0 ? Math.round((completedSessionsCount / allSessions.length) * 100) : 0;

    // Find next session
    let nextSession = null;
    let nextSessionWeekIndex = 0;
    
    for (let i = 0; i < program.weeks.length; i++) {
        const session = program.weeks[i].sessions.find(s => s.type !== 'Repos' && !s.completed);
        if (session) {
            nextSession = session;
            nextSessionWeekIndex = i;
            break;
        }
    }

    return (
        <Layout>
            <header className="mb-8">
                <p className="text-gray-400 text-lg">Bonjour, {user.name}!</p>
                <h1 className="text-3xl font-bold text-white mt-1">Tableau de bord</h1>
            </header>
            
            <div className="space-y-6">
                {/* ACTIVE PROGRAM CARD */}
                <div 
                    onClick={() => setPage('my-programs')}
                    className="relative bg-gradient-to-br from-blue-900/40 to-black p-6 rounded-3xl border border-blue-500/30 cursor-pointer group transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <span className="bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/20">
                                EN COURS
                            </span>
                            <h2 className="text-2xl font-bold text-white mt-2">{program.raceName}</h2>
                            <p className="text-sm text-gray-400">{program.distance} • Objectif {program.timeObjective}</p>
                        </div>
                        <div className="bg-white/10 p-3 rounded-full">
                            <Target size={24} className="text-blue-400" />
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-400">Progression</span>
                            <span className="text-white font-bold">{totalProgress}%</span>
                        </div>
                        <div className="h-2 bg-black/50 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all duration-1000" 
                                style={{ width: `${totalProgress}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-blue-200 group-hover:text-white transition-colors">
                        Voir le détail <ArrowRight size={16} />
                    </div>
                </div>

                {/* NEXT SESSION CARD */}
                {nextSession ? (
                    <div 
                        onClick={() => setPage(`week-${nextSessionWeekIndex}` as any)}
                        className="bg-white/5 p-6 rounded-3xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all"
                    >
                        <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-3">Prochaine séance</h3>
                        <div className="flex items-center gap-4">
                            <div className="bg-orange-500/20 p-4 rounded-2xl text-orange-400 border border-orange-500/20">
                                <Play size={24} fill="currentColor" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold text-white">{nextSession.title}</h4>
                                <p className="text-sm text-gray-400">{nextSession.type} • {nextSession.duration} min</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-green-500/10 p-6 rounded-3xl border border-green-500/20 text-center">
                        <h3 className="text-green-400 font-bold text-lg">Programme terminé !</h3>
                        <p className="text-gray-400 text-sm mt-1">Félicitations pour vos efforts.</p>
                    </div>
                )}

                {/* STATS ROW */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center py-6">
                        <Calendar size={24} className="text-purple-400 mb-2" />
                        <p className="text-2xl font-bold text-white">J-{daysUntilRace}</p>
                        <p className="text-xs text-gray-400">Avant la course</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center justify-center py-6">
                        <TrendingUp size={24} className="text-yellow-400 mb-2" />
                        <p className="text-2xl font-bold text-white">{program.vma}</p>
                        <p className="text-xs text-gray-400">VMA (km/h)</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Home;
