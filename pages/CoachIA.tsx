import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, RefreshCw, MessageSquare, ChevronLeft, Trash2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../supabase';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

interface Conversation {
    id: string;
    title: string;
    messages: Message[];
    created_at: string;
    updated_at: string;
}

const QUICK_QUESTIONS = [
    "Comment bien récupérer après une séance difficile ?",
    "Quelle alimentation avant ma course ?",
    "J'ai des douleurs au genou, que faire ?",
    "Comment améliorer ma VMA ?",
    "Comment gérer mon allure en compétition ?",
];

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.role === 'user';
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
        >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                isUser
                    ? 'bg-cyan-500/20 border border-cyan-500/30'
                    : 'bg-green-500/20 border border-green-500/30'
            }`}>
                {isUser
                    ? <User size={14} className="text-cyan-400" />
                    : <Bot size={14} className="text-green-400" />
                }
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                isUser
                    ? 'bg-cyan-500/10 border border-cyan-500/20 text-white rounded-tr-sm'
                    : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-sm'
            }`}>
                {message.content.split('\n').map((line, i) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                        return <p key={i} className="font-bold text-white mt-2 mb-1">{line.replace(/\*\*/g, '')}</p>;
                    }
                    if (line.startsWith('• ') || line.startsWith('- ')) {
                        return <p key={i} className="ml-2 text-gray-300">{line}</p>;
                    }
                    if (line === '') return <br key={i} />;
                    return <p key={i}>{line}</p>;
                })}
            </div>
        </motion.div>
    );
};

const CoachIA: React.FC = () => {
    const { user, program, isPaid, authUser } = useAppContext();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showQuick, setShowQuick] = useState(true);
    const [conversationId, setConversationId] = useState<string | null>(null);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const welcomeMessage = useCallback((): Message => ({
        id: 'welcome-' + Date.now(),
        role: 'assistant',
        content: `Bonjour ${user.name || 'sportif'} ! 👋\n\nJe suis ton coach MY RUN. Je connais ton profil et ${program ? `ton programme ${program.distance} (${program.totalWeeks} semaines)` : 'tes objectifs running'}.\n\nPose-moi toutes tes questions sur l'entraînement, la récupération, la nutrition ou ta prochaine course ! 🏃`,
        timestamp: new Date(),
    }), [user.name, program]);

    // ── Charger la dernière conversation ou créer un welcome ──
    useEffect(() => {
        if (!authUser) {
            setMessages([welcomeMessage()]);
            return;
        }
        (async () => {
            const { data } = await supabase
                .from('coach_conversations')
                .select('*')
                .eq('user_id', authUser.id)
                .order('updated_at', { ascending: false })
                .limit(1);

            if (data && data.length > 0) {
                const conv = data[0];
                const msgs = (conv.messages as any[]).map((m: any) => ({
                    ...m,
                    timestamp: new Date(m.timestamp),
                }));
                setConversationId(conv.id);
                setMessages(msgs);
                setShowQuick(msgs.filter((m: Message) => m.role === 'user').length === 0);
            } else {
                setMessages([welcomeMessage()]);
            }
        })();
    }, [authUser]);

    // ── Charger la liste des conversations pour l'historique ──
    const loadConversationsList = useCallback(async () => {
        if (!authUser) return;
        const { data } = await supabase
            .from('coach_conversations')
            .select('id, title, created_at, updated_at, messages')
            .eq('user_id', authUser.id)
            .order('updated_at', { ascending: false })
            .limit(20);
        if (data) {
            setConversations(data.map(c => ({
                ...c,
                messages: (c.messages as any[]).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })),
            })));
        }
    }, [authUser]);

    // ── Sauvegarder les messages avec debounce ──
    const saveMessages = useCallback(async (msgs: Message[], convId: string | null) => {
        if (!authUser || msgs.length <= 1) return;

        const serialized = msgs.map(m => ({
            ...m,
            timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp,
        }));

        // Générer un titre à partir du 1er message utilisateur
        const firstUserMsg = msgs.find(m => m.role === 'user');
        const title = firstUserMsg
            ? firstUserMsg.content.slice(0, 60) + (firstUserMsg.content.length > 60 ? '…' : '')
            : 'Nouvelle conversation';

        if (convId) {
            await supabase
                .from('coach_conversations')
                .update({ messages: serialized, title })
                .eq('id', convId)
                .eq('user_id', authUser.id);
        } else {
            const { data } = await supabase
                .from('coach_conversations')
                .insert({
                    user_id: authUser.id,
                    title,
                    messages: serialized,
                })
                .select('id')
                .single();
            if (data) {
                setConversationId(data.id);
            }
        }
    }, [authUser]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const buildSystemPrompt = (): string => {
        const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

        let context = `Tu es "MY RUN Coach", un entraîneur running expert et bienveillant intégré dans l'application MY RUN.
Tu communiques en français, de façon encourageante, précise et professionnelle.
Tu donnes des conseils concrets, pratiques et adaptés au profil de l'utilisateur.
Tu ne fais jamais plus de 3-4 paragraphes par réponse. Tu utilises des emojis avec modération.
Date du jour : ${today}.

PROFIL DE L'UTILISATEUR :
- Prénom : ${user.name || 'Non renseigné'}
- Niveau : ${user.level}
- VMA : ${user.vma ? `${user.vma} km/h` : 'Non renseignée'}
- Poids : ${user.weight ? `${user.weight} kg` : 'Non renseigné'}
- Taille : ${user.height ? `${user.height} cm` : 'Non renseignée'}`;

        if (program) {
            const completedSessions = program.weeks.flatMap(w => w.sessions).filter(s => s.completed && s.type !== 'Repos').length;
            const totalSessions = program.weeks.flatMap(w => w.sessions).filter(s => s.type !== 'Repos').length;
            const progressPct = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
            const daysUntilRace = Math.max(0, Math.ceil((new Date(program.raceDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

            context += `\n\nPROGRAMME EN COURS :
- Distance : ${program.distance}
- Course cible : ${program.raceName}
- Objectif : ${program.timeObjective}
- Semaines total : ${program.totalWeeks}
- Jours avant la course : ${daysUntilRace}
- Séances/semaine : ${program.sessionsPerWeek}
- Progression : ${progressPct}% (${completedSessions}/${totalSessions} séances)
- Débloqué : ${isPaid ? 'Oui' : 'Non (semaine 1 uniquement)'}`;
        } else {
            context += `\n\nPROGRAMME : Aucun programme actif.`;
        }

        context += `\n\nRÈGLES :
- Utilise le prénom de temps en temps
- Douleur → recommande médecin ou kiné
- Ne génère pas de plans complets (l'app le fait)
- Reste dans le domaine running/fitness/récupération`;

        return context;
    };

    const sendMessage = async (userText: string) => {
        if (!userText.trim() || isLoading) return;

        setShowQuick(false);
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: userText.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const history = messages
                .filter(m => !m.id.startsWith('welcome'))
                .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

            // Appel via le proxy serveur — la clé API reste côté serveur
            const response = await fetch('/api/openai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [
                        { role: 'system', content: buildSystemPrompt() },
                        ...history,
                        { role: 'user', content: userText.trim() },
                    ],
                    max_tokens: 600,
                    temperature: 0.7,
                }),
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(`Erreur ${response.status}: ${(err as any).error || 'Erreur inconnue'}`);
            }

            const data = await response.json();
            const text = data.choices?.[0]?.message?.content;
            if (!text) throw new Error('Réponse vide');

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: text,
                timestamp: new Date(),
            };

            setMessages(prev => {
                const updated = [...prev, assistantMessage];
                // Sauvegarder avec debounce pour éviter les appels multiples
                if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
                saveTimeoutRef.current = setTimeout(() => saveMessages(updated, conversationId), 500);
                return updated;
            });

        } catch (error: any) {
            console.error('Erreur OpenAI:', error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `Désolé, je rencontre une difficulté technique. 😕\n\nVérifie ta connexion et réessaie dans quelques secondes.`,
                timestamp: new Date(),
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    const resetConversation = () => {
        // Sauvegarder la conversation en cours avant de reset
        if (messages.length > 1 && conversationId) {
            saveMessages(messages, conversationId);
        }
        setConversationId(null);
        setMessages([{
            id: 'welcome-' + Date.now(),
            role: 'assistant',
            content: `Nouvelle conversation ! 👋\n\nQue puis-je faire pour toi, ${user.name || 'sportif'} ?`,
            timestamp: new Date(),
        }]);
        setShowQuick(true);
    };

    const loadConversation = (conv: Conversation) => {
        setConversationId(conv.id);
        setMessages(conv.messages);
        setShowQuick(conv.messages.filter(m => m.role === 'user').length === 0);
        setShowHistory(false);
    };

    const deleteConversation = async (convId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!authUser) return;
        await supabase
            .from('coach_conversations')
            .delete()
            .eq('id', convId)
            .eq('user_id', authUser.id);
        setConversations(prev => prev.filter(c => c.id !== convId));
        if (conversationId === convId) {
            resetConversation();
        }
    };

    return (
        <Layout showBottomNav={true}>
            <div className="flex flex-col h-full relative">

                {/* Header */}
                <header className="flex items-center justify-between mb-4 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-green-500/10 p-2 rounded-full border border-green-500/20">
                            <Bot size={20} className="text-green-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">Coach IA</h1>
                            <p className="text-xs text-green-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                                En ligne • Propulsé par ChatGPT
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => { loadConversationsList(); setShowHistory(true); }}
                            className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-full border border-white/10 transition-colors"
                            title="Historique"
                        >
                            <MessageSquare size={16} />
                        </button>
                        <button
                            onClick={resetConversation}
                            className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-full border border-white/10 transition-colors"
                            title="Nouvelle conversation"
                        >
                            <RefreshCw size={16} />
                        </button>
                    </div>
                </header>

                {/* Panneau historique des conversations */}
                <AnimatePresence>
                    {showHistory && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="absolute inset-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-sm flex flex-col p-4"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <button
                                    onClick={() => setShowHistory(false)}
                                    className="p-2 text-gray-400 hover:text-white"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <h2 className="text-lg font-bold text-white">Conversations</h2>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-2">
                                {conversations.length === 0 ? (
                                    <p className="text-gray-500 text-sm text-center mt-8">Aucune conversation sauvegardée</p>
                                ) : (
                                    conversations.map(conv => (
                                        <button
                                            key={conv.id}
                                            onClick={() => loadConversation(conv)}
                                            className={`w-full text-left p-3 rounded-xl border transition-all ${
                                                conv.id === conversationId
                                                    ? 'bg-green-500/10 border-green-500/30'
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                            }`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-white font-medium truncate">{conv.title}</p>
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {new Date(conv.updated_at).toLocaleDateString('fr-FR', {
                                                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                        })}
                                                        {' • '}{conv.messages.filter(m => m.role === 'user').length} messages
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={(e) => deleteConversation(conv.id, e)}
                                                    className="p-1.5 text-gray-500 hover:text-red-400 transition-colors flex-shrink-0"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>

                            <button
                                onClick={() => { resetConversation(); setShowHistory(false); }}
                                className="mt-3 w-full py-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm font-medium hover:bg-green-500/20 transition-all"
                            >
                                + Nouvelle conversation
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1">
                    {messages.map(message => (
                        <MessageBubble key={message.id} message={message} />
                    ))}

                    {isLoading && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500/20 border border-green-500/30 flex-shrink-0">
                                <Bot size={14} className="text-green-400" />
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
                                <div className="flex gap-1 items-center h-5">
                                    {[0, 1, 2].map(i => (
                                        <motion.div
                                            key={i}
                                            className="w-2 h-2 bg-green-400 rounded-full"
                                            animate={{ y: [0, -6, 0] }}
                                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Questions rapides */}
                <AnimatePresence>
                    {showQuick && messages.length <= 1 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-3 flex-shrink-0"
                        >
                            <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Questions fréquentes</p>
                            <div className="flex flex-wrap gap-2">
                                {QUICK_QUESTIONS.map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => sendMessage(q)}
                                        className="text-xs bg-white/5 border border-white/10 text-gray-300 px-3 py-2 rounded-xl hover:bg-white/10 hover:text-white transition-all"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Zone de saisie */}
                <div className="flex-shrink-0 flex gap-2 items-end bg-white/5 border border-white/10 rounded-2xl p-2">
                    <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Pose ta question au coach..."
                        rows={1}
                        className="flex-1 bg-transparent text-white text-sm placeholder-gray-500 resize-none outline-none py-2 px-2 max-h-32"
                        style={{ minHeight: '40px' }}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
                        }}
                    />
                    <button
                        onClick={() => sendMessage(input)}
                        disabled={!input.trim() || isLoading}
                        className="w-10 h-10 bg-green-400 text-black rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,255,135,0.3)]"
                    >
                        <Send size={16} />
                    </button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-2 flex-shrink-0">
                    Entrée pour envoyer • Maj+Entrée pour nouvelle ligne
                </p>
            </div>
        </Layout>
    );
};

export default CoachIA;
