
import React, { useState } from 'react';
import { ArrowLeft, Gauge, Calculator, Save, Timer, Footprints } from 'lucide-react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import NeonButton from '../components/NeonButton';

type TestType = 'demiCooper' | 'vameval' | 'raceTime';

const VMACalculator: React.FC = () => {
    const { user, updateUser, setPage } = useAppContext();
    const [testType, setTestType] = useState<TestType>('demiCooper');
    const [result, setResult] = useState<number | null>(null);

    // State for inputs
    const [demiCooperDist, setDemiCooperDist] = useState<number>(1500);
    const [vamevalStage, setVamevalStage] = useState<number>(10);
    const [raceTimeDist, setRaceTimeDist] = useState<string>('5k');
    const [raceTimeMin, setRaceTimeMin] = useState<number>(25);
    const [raceTimeSec, setRaceTimeSec] = useState<number>(0);

    const calculateVMA = () => {
        let vma = 0;
        switch (testType) {
            case 'demiCooper':
                if (demiCooperDist > 0) vma = demiCooperDist / 100;
                break;
            case 'vameval':
                // VMA = 8 + 0.5 * (Palier - 1)
                if (vamevalStage > 0) vma = 8 + 0.5 * vamevalStage;
                break;
            case 'raceTime':
                const totalSeconds = raceTimeMin * 60 + raceTimeSec;
                if (totalSeconds > 0) {
                    const distanceMeters = raceTimeDist === '5k' ? 5000 : 10000;
                    const intensityPercent = raceTimeDist === '5k' ? 0.95 : 0.92;
                    const speedMs = distanceMeters / totalSeconds;
                    const speedKmh = speedMs * 3.6;
                    vma = speedKmh / intensityPercent;
                }
                break;
        }
        setResult(vma > 0 ? parseFloat(vma.toFixed(2)) : null);
    };

    const saveVMA = () => {
        if (result !== null) {
            updateUser({ vma: result });
            alert(`Votre VMA de ${result} km/h a été enregistrée !`);
            setPage('profile');
        }
    };

    const renderInputs = () => {
        switch (testType) {
            case 'demiCooper':
                return (
                    <div>
                        <label className="font-semibold flex items-center gap-2">
                            <Gauge size={20} className="text-orange-400"/>
                            Distance parcourue en 6 minutes (en mètres)
                        </label>
                        <input type="number" value={demiCooperDist} onChange={(e) => setDemiCooperDist(parseInt(e.target.value, 10))} placeholder="Ex: 1500" className="w-full bg-black/20 rounded-lg p-3 mt-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-2xl font-bold text-center" />
                    </div>
                );
            case 'vameval':
                return (
                    <div>
                        <label className="font-semibold flex items-center gap-2">
                           <Footprints size={20} className="text-orange-400"/>
                           Dernier palier VAMEVAL complété
                        </label>
                        <input type="number" value={vamevalStage} onChange={(e) => setVamevalStage(parseInt(e.target.value, 10))} placeholder="Ex: 12" className="w-full bg-black/20 rounded-lg p-3 mt-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-2xl font-bold text-center" />
                    </div>
                );
            case 'raceTime':
                return (
                    <div>
                        <label className="font-semibold flex items-center gap-2 mb-3">
                            <Timer size={20} className="text-orange-400"/>
                            Temps sur une course récente
                        </label>
                        <select value={raceTimeDist} onChange={(e) => setRaceTimeDist(e.target.value)} className="w-full bg-black/20 rounded-lg p-3 mb-3 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400">
                            <option value="5k">5 km</option>
                            <option value="10k">10 km</option>
                        </select>
                        <div className="flex items-center justify-center gap-2">
                            <input type="number" value={raceTimeMin} onChange={e => setRaceTimeMin(parseInt(e.target.value))} placeholder="Min" className="w-1/2 bg-black/20 rounded-lg p-3 border border-white/10 text-2xl font-bold text-center"/>
                            <span className="text-2xl font-bold">:</span>
                            <input type="number" value={raceTimeSec} onChange={e => setRaceTimeSec(parseInt(e.target.value))} placeholder="Sec" className="w-1/2 bg-black/20 rounded-lg p-3 border border-white/10 text-2xl font-bold text-center"/>
                        </div>
                    </div>
                );
        }
    };
    
    const testInfos = {
        demiCooper: { title: 'Test Demi-Cooper (6 min)', description: 'Courez la plus grande distance possible en 6 minutes sur une piste ou un terrain plat. Entrez ensuite la distance parcourue.'},
        vameval: { title: 'Test VAMEVAL', description: 'Test progressif avec paliers de vitesse. Entrez le numéro du dernier palier que vous avez réussi à compléter entièrement.' },
        raceTime: { title: 'Depuis un temps de course', description: 'Estimez votre VMA à partir d\'un résultat de course récent. Plus la course est récente, plus le résultat sera précis.'}
    };

    return (
        <Layout>
            <header className="flex items-center mb-6 relative">
                <button onClick={() => setPage('profile')} className="absolute left-0 p-2 text-gray-400 hover:text-white">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-center flex-1">Calculateur de VMA</h1>
            </header>
            
            <div className="flex justify-center p-1 bg-white/5 rounded-full border border-white/10 mb-6">
                {(Object.keys(testInfos) as TestType[]).map(key => (
                     <button key={key} onClick={() => setTestType(key)} className={`w-1/3 py-2 px-1 text-xs font-bold rounded-full transition-colors ${testType === key ? 'bg-orange-500 text-white' : 'text-gray-400'}`}>
                        {testInfos[key].title.split('(')[0]}
                    </button>
                ))}
            </div>

            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-6">
                <h2 className="font-bold text-lg mb-2 text-cyan-300">{testInfos[testType].title}</h2>
                <p className="text-gray-400 text-sm">{testInfos[testType].description}</p>
            </div>

            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-6">
                {renderInputs()}
            </div>

            <NeonButton onClick={calculateVMA} icon={<Calculator size={20}/>} className="bg-orange-500 neon-orange-box">
                Calculer ma VMA
            </NeonButton>
            
            {result !== null && (
                <div className="mt-8 text-center bg-gradient-to-br from-green-500/20 to-cyan-500/20 p-6 rounded-2xl border border-green-400/30">
                    <p className="text-gray-400">Votre VMA est estimée à :</p>
                    <p className="text-5xl font-black my-2">
                        <span className="text-green-400">{result}</span>
                        <span className="text-cyan-400 text-3xl"> km/h</span>
                    </p>
                    <button 
                        onClick={saveVMA}
                        className="mt-4 bg-white/10 text-white font-bold py-3 px-6 rounded-full flex items-center justify-center gap-2 hover:bg-white/20 transition-colors w-full"
                    >
                        <Save size={18}/> Enregistrer sur mon profil
                    </button>
                </div>
            )}
        </Layout>
    );
};

export default VMACalculator;
    