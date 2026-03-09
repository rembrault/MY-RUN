
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
            case Distance.FiveK: return "4,99";
            case Distance.TenK: return "8,99";
            case Distance.HalfMarathon: return "12,99";
            case Distance.Marathon: return "14,99";
            default: return "9,99";
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
        return <Layout><div className="text-center pt-10">Aucun programme à débloquer.</div></Layout>
    }

    const price = getPrice(program.distance);

    return (
        <Layout showBottomNav={false}>
             <header className="flex items-center mb-6">
                <button onClick={() => setPage('home')} className="p-2 text-gray-400 hover:text-white">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-center flex-1">Débloquer le programme</h1>
                <div className="w-10"></div>
            </header>

            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-gray-400 text-sm">Programme</p>
                        <p className="font-bold text-lg">{program.distance}</p>
                    </div>
                     <div>
                        <p className="text-gray-400 text-sm text-right">Durée</p>
                        <p className="font-bold text-lg">{program.totalWeeks} semaines</p>
                    </div>
                </div>
                <div className="border-t border-white/10 my-4"></div>
                 <div className="flex justify-between items-center">
                    <p className="text-gray-200">Total à payer</p>
                    <p className="font-black text-3xl">
                        <span className="text-green-400">{price}</span>
                        <span className="text-cyan-400">€</span>
                    </p>
                </div>
            </div>

            <div className="bg-white/5 p-6 rounded-2xl border border-white/10 mb-6">
                <h3 className="font-bold mb-4">Ce qui est inclus :</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2"><Check className="text-green-400" size={16} /> Programme complet personnalisé</li>
                    <li className="flex items-center gap-2"><Check className="text-green-400" size={16} /> Accès à toutes les semaines</li>
                    <li className="flex items-center gap-2"><Check className="text-green-400" size={16} /> Suivi de progression intégré</li>
                    <li className="flex items-center gap-2"><Check className="text-green-400" size={16} /> Détails de chaque séance</li>
                    <li className="flex items-center gap-2"><Check className="text-green-400" size={16} /> Accès illimité</li>
                </ul>
            </div>
            
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                <h3 className="font-bold mb-4 flex items-center gap-2"><CreditCard size={20} /> Paiement par Carte</h3>
                <form className="space-y-4">
                    <div>
                        <label className="text-sm text-gray-400">Nom sur la carte</label>
                        <input type="text" placeholder="Jean Dupont" className="w-full bg-black/20 rounded-lg p-3 mt-1 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white" />
                    </div>
                     <div>
                        <label className="text-sm text-gray-400">Numéro de carte</label>
                        <input type="text" placeholder="4242 4242 4242 4242" className="w-full bg-black/20 rounded-lg p-3 mt-1 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white" />
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="text-sm text-gray-400">Expiration</label>
                            <input type="text" placeholder="MM/AA" className="w-full bg-black/20 rounded-lg p-3 mt-1 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white" />
                        </div>
                        <div className="flex-1">
                            <label className="text-sm text-gray-400">CVC</label>
                            <input type="text" placeholder="123" className="w-full bg-black/20 rounded-lg p-3 mt-1 border border-white/10 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white" />
                        </div>
                    </div>
                </form>
            </div>
            
            <div className="flex items-center my-4">
                <div className="flex-grow border-t border-gray-700"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-sm">OU</span>
                <div className="flex-grow border-t border-gray-700"></div>
            </div>

            <div className="space-y-3">
                <button className="w-full h-[52px] bg-black text-white font-semibold rounded-full flex items-center justify-center text-xl">
                    <span className="text-2xl -mt-1 mr-1"></span> Pay
                </button>
                <button className="w-full bg-[#ffc439] text-[#003087] font-bold py-3.5 rounded-full flex items-center justify-center">
                    <span className="italic text-xl">Pay</span><span className="font-sans text-xl ml-1">Pal</span>
                </button>
            </div>

            <div className="mt-6">
                <NeonButton onClick={handlePayment} disabled={isPaying}>
                    {isPaying ? 'Paiement en cours...' : (
                        <span className="flex items-center justify-center gap-2">
                            <Lock size={16} /> Payer {price} €
                        </span>
                    )}
                </NeonButton>
            </div>
             <p className="text-xs text-gray-500 text-center mt-4">Paiement sécurisé par SSL.</p>
        </Layout>
    );
};

export default Payment;
    