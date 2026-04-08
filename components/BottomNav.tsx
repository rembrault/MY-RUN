import React from 'react';
import { Home, User, Gauge, ScrollText, Bot, BarChart3 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Page } from '../types';

const BottomNav: React.FC = () => {
    const { page, setPage, program } = useAppContext();

    const navItems = [
        { id: 'home',           icon: Home,      label: 'Accueil' },
        { id: 'my-programs',    icon: ScrollText, label: 'Progr.' },
        { id: 'coach-ia',       icon: Bot,        label: 'Coach IA' }, // ← NOUVEAU
        { id: 'statistics',     icon: BarChart3,   label: 'Stats' },
        { id: 'vma-calculator', icon: Gauge,      label: 'VMA' },
        { id: 'profile',        icon: User,       label: 'Profil' },
    ];

    const handleNavClick = (targetPage: Page) => {
        if (!program && targetPage === 'home') {
            setPage('welcome');
        } else {
            setPage(targetPage);
        }
    };

    const activePage = page === 'welcome' ? 'home' : page;

    return (
        <nav className="relative h-20 bg-transparent flex justify-around items-center z-20 flex-shrink-0 px-2">
            {navItems.map(item => {
                const isActive =
                    activePage === item.id ||
                    (program && item.id === 'home' && page === 'welcome') ||
                    (item.id === 'my-programs' && page.toString().startsWith('week-'));

                // Mise en valeur spéciale pour le Coach IA
                const isCoach = item.id === 'coach-ia';

                return (
                    <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id as Page)}
                        className={`flex flex-col items-center justify-center space-y-1 transition-all duration-200 ${
                            isActive
                                ? isCoach ? 'text-green-400' : 'text-green-400'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {/* Badge spécial pour Coach IA */}
                        {isCoach ? (
                            <div className={`p-1.5 rounded-xl transition-all ${
                                isActive
                                    ? 'bg-green-400/20 shadow-[0_0_10px_rgba(0,255,135,0.3)]'
                                    : 'bg-white/5'
                            }`}>
                                <item.icon size={20} />
                            </div>
                        ) : (
                            <item.icon size={24} />
                        )}
                        <span className={`font-medium ${isCoach ? 'text-[10px]' : 'text-xs'}`}>
                            {item.label}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
};

export default BottomNav;
