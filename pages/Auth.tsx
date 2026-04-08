import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Zap } from 'lucide-react';
import { supabase } from '../supabase';

// ─── Types ───────────────────────────────────────────────
type AuthMode = 'login' | 'register' | 'reset';

// ─── Composant principal ──────────────────────────────────
const Auth: React.FC = () => {
    const [mode, setMode] = useState<AuthMode>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // ── Traduit les erreurs Supabase en français ──
    const getAuthError = (message: string): string => {
        if (message.includes('Invalid login credentials'))  return 'Email ou mot de passe incorrect.';
        if (message.includes('User already registered'))    return 'Un compte existe déjà avec cet email.';
        if (message.includes('Password should be'))         return 'Le mot de passe doit faire au moins 6 caractères.';
        if (message.includes('invalid email'))              return 'Adresse email invalide.';
        if (message.includes('rate limit'))                 return 'Trop de tentatives. Réessayez plus tard.';
        if (message.includes('Email not confirmed'))        return 'Veuillez confirmer votre email avant de vous connecter.';
        return 'Une erreur est survenue. Réessayez.';
    };

    // ── Connexion email/mot de passe ──
    const handleLogin = async () => {
        if (!email || !password) { setError('Remplissez tous les champs.'); return; }
        setIsLoading(true); setError('');
        try {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) setError(getAuthError(error.message));
            // Supabase onAuthStateChange dans AppContext prend le relais
        } catch {
            setError('Une erreur est survenue. Réessayez.');
        } finally {
            setIsLoading(false);
        }
    };

    // ── Inscription email/mot de passe ──
    const handleRegister = async () => {
        if (!email || !password || !confirmPassword) { setError('Remplissez tous les champs.'); return; }
        if (password !== confirmPassword) { setError('Les mots de passe ne correspondent pas.'); return; }
        if (password.length < 6) { setError('Le mot de passe doit faire au moins 6 caractères.'); return; }
        setIsLoading(true); setError('');
        try {
            const { error } = await supabase.auth.signUp({ email, password });
            if (error) {
                setError(getAuthError(error.message));
            } else {
                setSuccessMsg('Compte créé ! Vérifiez votre email pour confirmer votre inscription.');
            }
        } catch {
            setError('Une erreur est survenue. Réessayez.');
        } finally {
            setIsLoading(false);
        }
    };

    // ── Connexion Google ──
    const handleGoogle = async () => {
        setIsLoading(true); setError('');
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: window.location.origin },
            });
            if (error) setError(getAuthError(error.message));
        } catch {
            setError('Une erreur est survenue. Réessayez.');
        } finally {
            setIsLoading(false);
        }
    };

    // ── Réinitialisation mot de passe ──
    const handleReset = async () => {
        if (!email) { setError('Entrez votre adresse email.'); return; }
        setIsLoading(true); setError('');
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email);
            if (error) {
                setError(getAuthError(error.message));
            } else {
                setSuccessMsg('Un email de réinitialisation a été envoyé !');
            }
        } catch {
            setError('Une erreur est survenue. Réessayez.');
        } finally {
            setIsLoading(false);
        }
    };

    // ── Soumission selon le mode ──
    const handleSubmit = () => {
        if (mode === 'login')    handleLogin();
        else if (mode === 'register') handleRegister();
        else if (mode === 'reset')    handleReset();
    };

    const switchMode = (newMode: AuthMode) => {
        setMode(newMode);
        setError('');
        setSuccessMsg('');
        setPassword('');
        setConfirmPassword('');
    };

    return (
        <div className="futuristic-grid min-h-screen flex flex-col items-center justify-center px-6 py-10">

            {/* ── Logo / Header ── */}
            <motion.div
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex flex-col items-center mb-10"
            >
                <img
                    src="/logo-myrun.png"
                    alt="MY RUN"
                    className="h-32 mb-1"
                    style={{
                        filter: 'drop-shadow(0 0 8px rgba(0,255,135,0.3)) drop-shadow(0 0 20px rgba(0,212,255,0.15))',
                    }}
                />
            </motion.div>

            {/* ── Carte principale ── */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="w-full max-w-sm bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-7 shadow-[0_0_40px_rgba(0,0,0,0.5)]"
            >
                {/* ── Onglets Login / Inscription ── */}
                {mode !== 'reset' && (
                    <div className="flex bg-black/30 rounded-2xl p-1 mb-7">
                        {(['login', 'register'] as AuthMode[]).map((m) => (
                            <button
                                key={m}
                                onClick={() => switchMode(m)}
                                className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                                    mode === m
                                        ? 'bg-green-400 text-black shadow-[0_0_15px_rgba(0,255,135,0.4)]'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {m === 'login' ? 'Connexion' : 'Inscription'}
                            </button>
                        ))}
                    </div>
                )}

                {/* ── Titre selon mode ── */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mode}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {mode === 'reset' && (
                            <div className="mb-6">
                                <h2 className="text-xl font-bold text-white">Mot de passe oublié</h2>
                                <p className="text-gray-400 text-sm mt-1">Entrez votre email pour recevoir un lien de réinitialisation.</p>
                            </div>
                        )}

                        {/* ── Champ Email ── */}
                        <div className="mb-4">
                            <label className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-2 block">
                                Adresse email
                            </label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                    placeholder="votre@email.com"
                                    className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all"
                                />
                            </div>
                        </div>

                        {/* ── Champ Mot de passe ── */}
                        {mode !== 'reset' && (
                            <div className="mb-4">
                                <label className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-2 block">
                                    Mot de passe
                                </label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                        placeholder="••••••••"
                                        className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all"
                                    />
                                    <button
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                                    >
                                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── Confirmation mot de passe (inscription) ── */}
                        {mode === 'register' && (
                            <div className="mb-4">
                                <label className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-2 block">
                                    Confirmer le mot de passe
                                </label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                                        placeholder="••••••••"
                                        className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        {/* ── Mot de passe oublié (mode login) ── */}
                        {mode === 'login' && (
                            <div className="flex justify-end mb-5">
                                <button
                                    onClick={() => switchMode('reset')}
                                    className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                                >
                                    Mot de passe oublié ?
                                </button>
                            </div>
                        )}

                        {/* ── Message d'erreur ── */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl p-3 mb-4"
                            >
                                {error}
                            </motion.div>
                        )}

                        {/* ── Message de succès ── */}
                        {successMsg && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-xl p-3 mb-4"
                            >
                                {successMsg}
                            </motion.div>
                        )}

                        {/* ── Bouton principal ── */}
                        <button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="w-full bg-[#00ff87] text-[#0a0a0f] font-black py-3.5 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(0,255,135,0.3)] mb-4"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>
                                    {mode === 'login' && 'Se connecter'}
                                    {mode === 'register' && "Créer mon compte"}
                                    {mode === 'reset' && 'Envoyer le lien'}
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>

                        {/* ── Retour depuis reset ── */}
                        {mode === 'reset' && (
                            <button
                                onClick={() => switchMode('login')}
                                className="w-full text-gray-400 hover:text-white text-sm py-2 transition-colors"
                            >
                                ← Retour à la connexion
                            </button>
                        )}

                    </motion.div>
                </AnimatePresence>

                {/* ── Séparateur ── */}
                {mode !== 'reset' && (
                    <>
                        <div className="flex items-center gap-3 my-5">
                            <div className="flex-1 h-px bg-white/10" />
                            <span className="text-gray-600 text-xs uppercase tracking-widest">ou</span>
                            <div className="flex-1 h-px bg-white/10" />
                        </div>

                        {/* ── Bouton Google ── */}
                        <button
                            onClick={handleGoogle}
                            disabled={isLoading}
                            className="w-full bg-white/5 border border-white/10 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-white/10 hover:border-white/20 transition-all duration-200 disabled:opacity-50"
                        >
                            {/* Logo Google SVG */}
                            <svg width="18" height="18" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            Continuer avec Google
                        </button>
                    </>
                )}
            </motion.div>

            {/* ── Mention légale ── */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-gray-600 text-xs text-center mt-6 max-w-xs"
            >
                En vous connectant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
            </motion.p>
        </div>
    );
};

export default Auth;
