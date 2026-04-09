import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Calendar, Gauge, LoaderCircle, Search, CalendarDays, Target, Clock } from 'lucide-react';
import { Distance, Page, Program } from '../../types';
import { searchRaces, Race } from '../../services/raceFinder';

interface Step3Props {
    formData: {
        raceName: string;
        raceDate: Date;
        startDate: Date;
        trainingDays: string[];
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
    [Distance.FiveK]:       ['Finir', '< 30min', '< 25min', '< 20min'],
    [Distance.TenK]:        ['Finir', '< 1h', '< 50min', '< 45min', '< 40min', '< 35min'],
    [Distance.HalfMarathon]:['Finir', '< 2h15', '< 2h', '< 1h45', '< 1h30', '< 1h20'],
    [Distance.Marathon]:    ['Finir', '< 4h30', '< 4h00', '< 3h30', '< 3h00'],
};

const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
const dayLabels  = ['L', 'Ma', 'Me', 'J', 'V', 'S', 'D'];

const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

// ── Carte glassmorphism section ──────────────────────────────
const SectionCard: React.FC<{
    children: React.ReactNode;
    delay?: number;
    accent?: string;
    overflow?: boolean;
}> = ({ children, delay = 0, accent, overflow = false }) => (
    <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={`relative rounded-2xl p-4 ${overflow ? 'overflow-visible' : 'overflow-hidden'}`}
        style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${accent ? `${accent}20` : 'rgba(255,255,255,0.08)'}`,
        }}
    >
        {accent && (
            <div
                className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
                style={{ background: `linear-gradient(90deg, transparent, ${accent}40, transparent)` }}
            />
        )}
        {children}
    </motion.div>
);

// ── Label section ────────────────────────────────────────────
const SectionLabel: React.FC<{ icon: React.ReactNode; label: string; color?: string }> = ({
    icon, label, color = 'rgba(0,255,135,0.7)'
}) => (
    <div className="flex items-center gap-2 mb-3">
        <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: `${color}15`, border: `1px solid ${color}30` }}
        >
            {icon}
        </div>
        <span
            className="text-[10px] font-bold uppercase tracking-[0.15em]"
            style={{ color }}
        >
            {label}
        </span>
    </div>
);

// ────────────────────────────────────────────────────────────
const Step3Personalize: React.FC<Step3Props> = ({
    formData, onChange, onSelect, onSubmit, setPage
}) => {
    const today = new Date().toISOString().split('T')[0];
    const [searchQuery, setSearchQuery]     = useState('');
    const [searchResults, setSearchResults] = useState<Race[]>([]);
    const [isSearching, setIsSearching]     = useState(false);
    const [showResults, setShowResults]     = useState(false);

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

    // Init jours si vide
    useEffect(() => {
        if (!formData.trainingDays || formData.trainingDays.length === 0) {
            const defaultDays =
                formData.sessionsPerWeek === 2 ? ['Mercredi', 'Dimanche']
                : formData.sessionsPerWeek === 3 ? ['Mardi', 'Jeudi', 'Dimanche']
                : ['Mardi', 'Mercredi', 'Vendredi', 'Dimanche'];
            onSelect('trainingDays', defaultDays);
        }
    }, []);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        onSelect('raceDate', new Date(e.target.value));

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        onSelect('startDate', new Date(e.target.value));

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
    };

    const toggleDay = (day: string) => {
        const currentDays = formData.trainingDays || [];
        let newDays: string[];
        if (currentDays.includes(day)) {
            newDays = currentDays.filter(d => d !== day);
        } else {
            if (currentDays.length >= 6) return;
            newDays = [...currentDays, day];
        }
        newDays.sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b));
        onSelect('trainingDays', newDays);
        onSelect('sessionsPerWeek', Math.max(2, newDays.length));
    };

    const objectives = timeObjectives[formData.distance] || [];

    return (
        <div className="flex flex-col h-full pt-4">

            {/* Header */}
            <motion.div
                className="text-center mb-6"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.p
                    className="text-xs font-bold uppercase tracking-[0.2em] mb-3"
                    style={{ color: 'rgba(0,255,135,0.7)' }}
                >
                    Étape 3 sur 3
                </motion.p>
                <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                    Personnalisez
                </h2>
                <p className="text-gray-500 text-sm">Quelques détails pour affiner votre plan.</p>
            </motion.div>

            {/* Contenu scrollable */}
            <div className="flex flex-col gap-3 flex-grow overflow-y-auto pr-0.5 scrollbar-hide">

                {/* ── Nom de la course ── */}
                <SectionCard delay={0.05} accent="#fb923c" overflow={true}>
                    <SectionLabel
                        icon={<Award size={12} style={{ color: '#fb923c' }} />}
                        label="Nom de la course (optionnel)"
                        color="#fb923c"
                    />
                    <div className="relative flex items-center gap-3">
                        <input
                            type="text"
                            placeholder="Rechercher une course..."
                            value={formData.raceName}
                            onChange={handleRaceNameChange}
                            onFocus={() => setShowResults(true)}
                            className="flex-1 bg-transparent text-sm font-semibold text-white focus:outline-none placeholder-gray-500"
                        />
                        {isSearching
                            ? <LoaderCircle size={15} className="animate-spin text-gray-500 flex-shrink-0" />
                            : <Search size={15} className="text-gray-500 flex-shrink-0" />
                        }
                    </div>

                    {/* Résultats dropdown */}
                    <AnimatePresence>
                        {showResults && (searchResults.length > 0 || isSearching) && (
                            <motion.div
                                initial={{ opacity: 0, y: -8, scaleY: 0.95 }}
                                animate={{ opacity: 1, y: 0, scaleY: 1 }}
                                exit={{ opacity: 0, y: -8, scaleY: 0.95 }}
                                transition={{ duration: 0.15 }}
                                className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl overflow-hidden"
                                style={{
                                    background: 'rgba(12,12,18,0.98)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    backdropFilter: 'blur(20px)',
                                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                                }}
                            >
                                {isSearching && !searchResults.length && (
                                    <p className="p-3 text-xs text-gray-500">Recherche en cours...</p>
                                )}
                                {searchResults.map(race => (
                                    <motion.div
                                        key={race.id}
                                        onClick={() => handleSelectRace(race)}
                                        whileHover={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                                        className="p-3 cursor-pointer border-b border-white/5 last:border-0"
                                    >
                                        <p className="font-semibold text-white text-sm">{race.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {new Date(race.date).toLocaleDateString('fr-FR', {
                                                year: 'numeric', month: 'long', day: 'numeric'
                                            })} · {race.city || ''}{race.city && race.country ? ', ' : ''}{race.country}
                                            {race.elevation > 0 ? ` · D+ ${race.elevation}m` : ''}
                                        </p>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </SectionCard>

                {/* ── Dates ── */}
                <div className="grid grid-cols-2 gap-3">
                    {[
                        {
                            label: 'Début du plan',
                            icon: <CalendarDays size={12} style={{ color: '#00d4ff' }} />,
                            value: formData.startDate.toISOString().split('T')[0],
                            onChange: handleStartDateChange,
                            color: '#00d4ff',
                        },
                        {
                            label: 'Date course',
                            icon: <Calendar size={12} style={{ color: '#00ff87' }} />,
                            value: formData.raceDate.toISOString().split('T')[0],
                            onChange: handleDateChange,
                            color: '#00ff87',
                        },
                    ].map((field, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.05, duration: 0.4 }}
                            className="relative rounded-2xl p-4 overflow-hidden"
                            style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: `1px solid ${field.color}20`,
                            }}
                        >
                            <div
                                className="absolute top-0 left-0 right-0 h-px"
                                style={{ background: `linear-gradient(90deg, transparent, ${field.color}40, transparent)` }}
                            />
                            <div className="flex items-center gap-1.5 mb-2">
                                <div
                                    className="w-5 h-5 rounded-md flex items-center justify-center"
                                    style={{ background: `${field.color}15` }}
                                >
                                    {field.icon}
                                </div>
                                <span
                                    className="text-[9px] font-bold uppercase tracking-widest"
                                    style={{ color: field.color }}
                                >
                                    {field.label}
                                </span>
                            </div>
                            <input
                                type="date"
                                min={today}
                                value={field.value}
                                onChange={field.onChange}
                                className="bg-transparent text-sm font-bold text-white focus:outline-none w-full"
                                style={{ colorScheme: 'dark' }}
                            />
                        </motion.div>
                    ))}
                </div>

                {/* ── Jours d'entraînement ── */}
                <SectionCard delay={0.15} accent="#a78bfa">
                    <div className="flex items-center justify-between mb-3">
                        <SectionLabel
                            icon={<Target size={12} style={{ color: '#a78bfa' }} />}
                            label="Jours d'entraînement"
                            color="#a78bfa"
                        />
                        <motion.span
                            key={formData.trainingDays?.length}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            className="text-[10px] font-black px-2.5 py-1 rounded-full"
                            style={{
                                background: 'rgba(167,139,250,0.1)',
                                border: '1px solid rgba(167,139,250,0.25)',
                                color: '#a78bfa',
                            }}
                        >
                            {formData.trainingDays?.length || 0} / sem
                        </motion.span>
                    </div>

                    <div className="flex justify-between gap-1">
                        {daysOfWeek.map((day, i) => {
                            const isSelected = formData.trainingDays?.includes(day);
                            return (
                                <motion.button
                                    key={day}
                                    onClick={() => toggleDay(day)}
                                    whileTap={{ scale: 0.88 }}
                                    className="flex-1 h-9 rounded-xl text-[11px] font-black transition-all duration-200"
                                    style={{
                                        background: isSelected
                                            ? 'linear-gradient(135deg, #a78bfa, #7c3aed)'
                                            : 'rgba(255,255,255,0.04)',
                                        border: isSelected
                                            ? '1px solid rgba(167,139,250,0.4)'
                                            : '1px solid rgba(255,255,255,0.07)',
                                        color: isSelected ? 'white' : 'rgba(255,255,255,0.3)',
                                        boxShadow: isSelected ? '0 0 12px rgba(167,139,250,0.3)' : 'none',
                                    }}
                                >
                                    {dayLabels[i]}
                                </motion.button>
                            );
                        })}
                    </div>
                    <p className="text-[10px] text-gray-500 text-center mt-2.5">
                        Minimum 2 jours · Maximum 6 jours
                    </p>
                </SectionCard>

                {/* ── VMA ── */}
                <SectionCard delay={0.2} accent="#00d4ff">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{
                                    background: 'rgba(0,212,255,0.1)',
                                    border: '1px solid rgba(0,212,255,0.2)',
                                }}
                            >
                                <Gauge size={18} className="text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400/70 mb-1">
                                    Votre VMA (km/h)
                                </p>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.vma}
                                    onChange={(e) => onSelect('vma', parseFloat(e.target.value))}
                                    className="bg-transparent text-2xl font-black text-white focus:outline-none w-20"
                                />
                            </div>
                        </div>
                        <motion.button
                            onClick={() => setPage('vma-calculator')}
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ scale: 1.03 }}
                            className="px-4 py-2 rounded-xl text-xs font-bold"
                            style={{
                                background: 'rgba(0,212,255,0.08)',
                                border: '1px solid rgba(0,212,255,0.2)',
                                color: '#00d4ff',
                            }}
                        >
                            Calculer
                        </motion.button>
                    </div>
                </SectionCard>

                {/* ── Objectif de temps ── */}
                <SectionCard delay={0.25} accent="#00ff87">
                    <SectionLabel
                        icon={<Clock size={12} style={{ color: '#00ff87' }} />}
                        label="Objectif de temps"
                        color="#00ff87"
                    />
                    <div className="grid grid-cols-3 gap-2">
                        {objectives.map((obj, i) => {
                            const isSelected = formData.timeObjective === obj;
                            return (
                                <motion.button
                                    key={obj}
                                    onClick={() => onSelect('timeObjective', obj)}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 + i * 0.04 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
                                    style={{
                                        background: isSelected
                                            ? 'linear-gradient(135deg, rgba(0,255,135,0.2), rgba(0,212,255,0.15))'
                                            : 'rgba(255,255,255,0.04)',
                                        border: isSelected
                                            ? '1px solid rgba(0,255,135,0.35)'
                                            : '1px solid rgba(255,255,255,0.07)',
                                        color: isSelected ? '#00ff87' : 'rgba(255,255,255,0.5)',
                                        boxShadow: isSelected ? '0 0 12px rgba(0,255,135,0.15)' : 'none',
                                    }}
                                >
                                    {obj}
                                </motion.button>
                            );
                        })}
                    </div>
                </SectionCard>

            </div>

            {/* ── CTA ── */}
            <motion.div
                className="pt-5 pb-1"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <motion.button
                    onClick={onSubmit}
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.01 }}
                    className="w-full py-4 rounded-2xl font-black text-black text-sm tracking-wide relative overflow-hidden"
                    style={{
                        background: 'linear-gradient(135deg, #00ff87, #00d4ff)',
                        boxShadow: '0 0 35px rgba(0,255,135,0.35)',
                    }}
                >
                    <motion.div
                        className="absolute inset-0 bg-white/20"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.4 }}
                    />
                    🚀 Générer mon programme
                </motion.button>
            </motion.div>
        </div>
    );
};

export default Step3Personalize;
