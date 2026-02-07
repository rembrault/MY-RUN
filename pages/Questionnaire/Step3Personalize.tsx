
import React, { useState, useEffect, useCallback } from 'react';
import { Award, Calendar, Clock, Target, Footprints, ChevronUp, ChevronDown, Gauge, LoaderCircle, Search } from 'lucide-react';
import { Distance, Page, Program } from '../../types';
import { searchRaces, Race } from '../../services/raceFinder';

interface Step3Props {
    formData: {
        raceName: string;
        raceDate: Date;
        sessionsPerWeek: number;
        timeObjective: string;
        distance: Distance;
        currentMileage: number;
        vma: number;
        raceInfo?: Program['raceInfo'];
    };
    onChange: (input: string) => (e: any) => void;
    onSelect: (field: string, value: any) => void;
    onSubmit: () => void;
    setPage: (page: Page) => void;
}

const timeObjectives: { [key in Distance]: string[] } = {
    [Distance.TenK]: ['Finir', '< 1h', '< 50min', '< 45min', '< 40min', '< 35min'],
    [Distance.HalfMarathon]: ['Finir', '< 2h15', '< 2h', '< 1h45', '< 1h30', '< 1h20'],
    [Distance.Marathon]: ['Finir', '< 4h30', '< 4h00', '< 3h30', '< 3h00'],
};


// Debounce hook
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};


const Step3Personalize: React.FC<Step3Props> = ({ formData, onChange, onSelect, onSubmit, setPage }) => {
    
    const today = new Date().toISOString().split("T")[0];
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<Race[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    useEffect(() => {
        if (debouncedSearchQuery) {
            setIsSearching(true);
            setShowResults(true);
            searchRaces(debouncedSearchQuery, formData.distance).then(results => {
                setSearchResults(results);
                setIsSearching(false);
            });
        } else {
            setSearchResults([]);
            setIsSearching(false);
            setShowResults(false);
        }
    }, [debouncedSearchQuery, formData.distance]);


    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onSelect('raceDate', new Date(e.target.value));
    };
    
    const handleRaceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        onSelect('raceName', query);
    };
    
    const handleSelectRace = (race: Race) => {
        onSelect('raceName', race.name);
        onSelect('raceDate', new Date(race.date));
        onSelect('raceInfo', { name: race.name, date: race.date, elevation: race.elevation });
        setShowResults(false);
        setSearchQuery(race.name);
    }

    return (
        <div className="flex flex-col h-full">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Personnalisez votre programme</h2>
                <p className="text-gray-400">Quelques détails pour affiner votre plan.</p>
            </div>
            <div className="space-y-3 flex-grow overflow-y-auto pr-1">
                {/* Race Name & Date Cards */}
                <div className="relative bg-white/5 p-4 rounded-xl border border-white/10 flex items-center gap-4">
                    <div className="p-3 bg-black/20 rounded-lg">
                        <Award className="text-orange-400" />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs text-gray-400">Nom de la course (optionnel)</label>
                        <input type="text" placeholder="Rechercher une course..." value={formData.raceName} onChange={handleRaceNameChange} onFocus={() => setShowResults(true)} className="bg-transparent text-md font-semibold text-white focus:outline-none w-full"/>
                    </div>
                    {isSearching ? <LoaderCircle size={20} className="animate-spin text-gray-400" /> : <Search size={20} className="text-gray-400"/>}

                    {showResults && (searchResults.length > 0 || isSearching) && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a20] border border-white/10 rounded-lg z-10 max-h-48 overflow-y-auto">
                            {isSearching && !searchResults.length && <p className="p-3 text-sm text-gray-400">Recherche...</p>}
                            {searchResults.map(race => (
                                <div key={race.id} onClick={() => handleSelectRace(race)} className="p-3 hover:bg-white/10 cursor-pointer">
                                    <p className="font-semibold">{race.name}</p>
                                    <p className="text-xs text-gray-400">{new Date(race.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })} - {race.country}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex items-center gap-4">
                    <div className="p-3 bg-black/20 rounded-lg">
                        <Calendar className="text-orange-400" />
                    </div>
                    <div className="flex-1">
                        <label className="text-xs text-gray-400">Date de la course</label>
                        <input type="date" min={today} value={formData.raceDate.toISOString().split('T')[0]} onChange={handleDateChange} className="bg-transparent text-md font-semibold text-white focus:outline-none w-full" style={{ colorScheme: 'dark' }} />
                    </div>
                </div>
                
                {/* Sessions per Week Card */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <label className="text-sm text-gray-400">Séances par semaine : <span className="font-bold text-orange-400">{formData.sessionsPerWeek}x</span></label>
                    <div className="mt-3">
                        <input type="range" min="2" max="6" value={formData.sessionsPerWeek} onChange={(e) => onSelect('sessionsPerWeek', parseInt(e.target.value, 10))} className="w-full orange-slider" />
                    </div>
                </div>

                {/* VMA Card */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="p-3 bg-black/20 rounded-lg">
                                <Gauge className="text-orange-400" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-400">Votre VMA (km/h)</label>
                                <input 
                                    type="number" 
                                    step="0.1"
                                    value={formData.vma}
                                    onChange={(e) => onSelect('vma', parseFloat(e.target.value))}
                                    className="bg-transparent text-md font-semibold text-white focus:outline-none w-24"
                                />
                            </div>
                        </div>
                        <button onClick={() => setPage('vma-calculator')} className="bg-orange-500/20 text-orange-300 text-xs font-bold px-3 py-2 rounded-lg hover:bg-orange-500/40 transition-colors">Calculer</button>
                    </div>
                </div>


                {/* Time Objective Card */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                    <label className="text-sm text-gray-400 mb-3 block">Objectif de temps</label>
                    <div className="grid grid-cols-3 gap-2">
                        {(timeObjectives[formData.distance] || []).map(obj => (
                            <button key={obj} onClick={() => onSelect('timeObjective', obj)} className={`p-3 rounded-lg text-xs transition-colors ${formData.timeObjective === obj ? 'bg-orange-500 text-white font-bold' : 'bg-black/20 hover:bg-black/40'}`}>
                                {obj}
                            </button>
                        ))}
                    </div>
                </div>

            </div>
            <button onClick={onSubmit} className="w-full bg-[#00ff87] text-[#0a0a0f] font-bold py-4 px-6 rounded-full mt-6 transition-all duration-300 transform hover:scale-105 neon-green-box">
                Générer mon programme
            </button>
        </div>
    );
};

export default Step3Personalize;
    