import React, { useState } from 'react';
import { ArrowLeft, Lock, Check, ExternalLink, ShieldCheck } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Layout from '../components/Layout';
import NeonButton from '../components/NeonButton';
import { Distance } from '../types';

const Payment: React.FC = () => {
    const { program, setPage, authUser } = useAppContext();
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getPrice = (distance: Distance) => {
        switch (distance) {
            case Distance.FiveK:         return '4,99';
            case Distance.TenK:          return '8,99';
            case Distance.HalfMarathon:  return '12,99';
            case Distance.Marathon:      return '14,99';
            default:                     return '9,99';
        }
    };

    const handlePayment = async () => {
        if (!program || !authUser) return;

        setIsRedirecting(true);
        setError(null);

        try {
            const response = await fetch('/api/stripe-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    distance: program.distance,
                    programId: program.id,
                    userId: authUser.id,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de la création du paiement');
            }

            // Redirection vers Stripe Checkout
            window.location.href = data.url;

        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue. Réessayez.');
            setIsRedirecting(false);
        }
    };

    if (!program) {
        return (
            <Layout>
                <div className="text-center pt-10 text-white">Aucun programme à débloquer.</div>
            </Layout>
        );
    }

    const price = getPrice(program.distance);

    return (
        <Layout showBottomNav={false}>

            {/* ── Header ── */}
            <header className="flex items-center mb-6">
                <button onClick={() => setPage('home')} className="p-2 text-gray-400 hover:text-white">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-center flex-1 text-white">Débloquer le programme</h1>
                <div className="w-10" />
            </header>

            {/* ── Récapitulatif ── */}
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-gray-400 text-sm">Programme</p>
                        <p className="font-bold text-lg text-white">{program.distance}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-sm text-right">Durée</p>
                        <p className="font-bold text-lg text-white">{program.totalWeeks} semaines</p>
                    </div>
                </div>
                <div className="border-t border-white/10 my-4" />
                <div className="flex justify-between items-center">
                    <p className="text-gray-200">Total à payer</p>
                    <p className="font-black text-3xl">
                        <span className="text-green-400">{price}</span>
                        <span className="text-cyan-400">€</span>
                    </p>
                </div>
            </div>

            {/* ── Ce qui est inclus ── */}
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-6">
                <h3 className="font-bold mb-4 text-white">Ce qui est inclus :</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                    {[
                        'Programme complet personnalisé',
                        'Accès à toutes les semaines',
                        'Suivi de progression intégré',
                        'Détails de chaque séance',
                        'Accès illimité',
                    ].map((item) => (
                        <li key={item} className="flex items-center gap-2">
                            <Check className="text-green-400 flex-shrink-0" size={16} />
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* ── Sécurité Stripe ── */}
            <div className="flex items-center justify-center gap-2 mb-4 text-gray-400">
                <ShieldCheck size={16} />
                <p className="text-xs">Paiement sécurisé par Stripe. Vos données bancaires ne transitent jamais par nos serveurs.</p>
            </div>

            {/* ── Erreur ── */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-4 text-center">
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}

            {/* ── Bouton payer ── */}
            <NeonButton onClick={handlePayment} disabled={isRedirecting}>
                {isRedirecting ? (
                    <span className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Redirection vers Stripe...
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2">
                        <Lock size={16} /> Payer {price} € <ExternalLink size={14} />
                    </span>
                )}
            </NeonButton>

            <p className="text-xs text-gray-500 text-center mt-4">
                Vous serez redirigé vers la page de paiement sécurisée Stripe.
            </p>

        </Layout>
    );
};

export default Payment;
