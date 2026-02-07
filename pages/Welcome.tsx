
import React from 'react';
import { Plus, Play, Zap, Diamond } from 'lucide-react';
import Layout from '../components/Layout';
import NeonButton from '../components/NeonButton';
import { useAppContext } from '../context/AppContext';

const Welcome: React.FC = () => {
    const { setPage, program } = useAppContext();

    return (
        <Layout showBottomNav={true}>
            <div className="flex flex-col items-center justify-start h-full text-center pt-6 pb-2">
                <span className="bg-black/20 text-green-400 text-sm font-medium px-4 py-2 rounded-full border border-green-400/30 flex items-center gap-2 mb-6 mt-2">
                    <Zap size={16} /> Programmes sur mesure
                </span>

                <div className="mb-6 relative">
                    <h1 className="text-7xl font-black tracking-tighter">
                        <span className="text-[#00d4ff] neon-cyan-text">MY</span>
                        <span className="text-[#00ff87] neon-green-text">RUN</span>
                    </h1>
                </div>

                <p className="text-lg text-gray-300 max-w-xs mx-auto mb-8">
                    Plans d'entraînement sur mesure pour le <span className="text-[#00d4ff] font-semibold">10km</span>, <span className="text-[#00ff87] font-semibold">semi</span> et <span className="text-orange-400 font-semibold">marathon</span>.
                </p>
                
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 flex items-start gap-4 text-left w-full max-w-sm mx-auto mb-6">
                    <div className="p-2 bg-black/20 rounded-lg shrink-0">
                         <Diamond className="text-cyan-400" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">Conçu par des experts</h3>
                        <p className="text-sm text-gray-400 mt-1">
                            Programmes créés par une équipe expérimentée pour garantir vos résultats.
                        </p>
                    </div>
                </div>

                <div className="w-full max-w-sm mx-auto">
                {program ? (
                    <NeonButton onClick={() => setPage('home')} icon={<Play size={20} />}>
                        Continuer mon programme
                    </NeonButton>
                ) : (
                    <NeonButton onClick={() => setPage('new-program')} icon={<Plus size={20} />}>
                        Créer mon programme
                    </NeonButton>
                )}
                </div>
            </div>
        </Layout>
    );
};

export default Welcome;
