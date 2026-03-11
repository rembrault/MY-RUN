import React, { useState } from 'react';
import { ArrowLeft, Lock, CreditCard, Check } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import Layout from '../components/Layout';
import NeonButton from '../components/NeonButton';
import { Distance } from '../types';

const Payment: React.FC = () => {
    const { program, completePayment, setPage } = useAppContext();
    const [isPaying, setIsPaying] = useState(false);

    const getPrice = (distance: Distance) => {
        switch (distance) {
            case Distance.FiveK:         return "4,99";
            case Distance.TenK:          return "8,99";
            case Distance.HalfMarathon:  return "12,99";
            case Distance.Marathon:      return "14,99";
            default:                     return "9,99";
        }
    };

    const handlePayment = () => {
        setIsPaying(true);
        setTimeout(() => {
            completePayment();
            alert('Paiement réussi ! Votre programme est débloqué.');
        }, 1500);
    };

    if (!program) {
        return (
            <Layout>
                {/* CORRECTION : ajout text-white */}
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
                {/* CORRECTION : ajout text-white */}
                <h1 className="text-xl font-bold text-center flex-1 text-white">Débloquer le programme</h1>
                <div className="w-10" />
            </header>

            {/* ── Récapitulatif ── */}
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        {/* CORRECTION : text-white sur les valeurs */}
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
                {/* CORRECTION : text-white sur le titre h3 */}
                <h3 className="font-bold mb-4 text-white">Ce qui est inclus :</h3>

                {/* CORRECTION : liste sans puces noires → on utilise des icônes Check à la place */}
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

            {/* ── Formulaire carte ── */}
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-6">
                {/* CORRECTION : text-white sur le titre h3 */}
                <h3 className="font-bold mb-4 flex items-center gap-2 text-white">
                    <CreditCard size={20} /> Paiement par Carte
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-400">Nom sur la carte</label>
                        <input
                            type="text"
                            placeholder="Jean Dupont"
                            className="w-full bg-black/20 rounded-lg p-3 mt-1 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-gray-600"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-gray-400">Numéro de carte</label>
                        <input
                            type="text"
                            placeholder="4242 4242 4242 4242"
                            className="w-full bg-black/20 rounded-lg p-3 mt-1 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-gray-600"
                        />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-sm text-gray-400">Expiration</label>
                            <input
                                type="text"
                                placeholder="MM/AA"
                                className="w-full bg-black/20 rounded-lg p-3 mt-1 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-gray-600"
                            />
                        </div>
                        <div className="flex-1">
                            <label className="text-sm text-gray-400">CVC</label>
                            <input
                                type="text"
                                placeholder="123"
                                className="w-full bg-black/20 rounded-lg p-3 mt-1 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-gray-600"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Séparateur OU ── */}
            <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-700" />
                <span className="flex-shrink mx-4 text-gray-500 text-sm">OU</span>
                <div className="flex-grow border-t border-gray-700" />
            </div>

            {/* ── Boutons Apple Pay / PayPal ── */}
            <div className="space-y-3 mb-6">
                <button className="w-full h-[52px] bg-black text-white font-semibold rounded-full flex items-center justify-center text-xl border border-white/20 hover:bg-white/10 transition-colors">
                     Pay
                </button>
                <button className="w-full bg-[#ffc439] text-[#003087] font-bold py-3.5 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity">
                    <span className="italic text-xl">Pay</span><span className="font-sans text-xl ml-1">Pal</span>
                </button>
            </div>

            {/* ── Bouton principal payer ── */}
            <NeonButton onClick={handlePayment} disabled={isPaying}>
                {isPaying ? 'Paiement en cours...' : (
                    <span className="flex items-center justify-center gap-2">
                        <Lock size={16} /> Payer {price} €
                    </span>
                )}
            </NeonButton>

            <p className="text-xs text-gray-500 text-center mt-4">Paiement sécurisé par SSL.</p>

        </Layout>
    );
};

export default Payment;
