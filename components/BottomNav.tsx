
import React from 'react';
import { Home, User, Gauge, ScrollText } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Page } from '../types';

const BottomNav: React.FC = () => {
    const { page, setPage, program } = useAppContext();

    const navItems = [
        { id: 'home', icon: Home, label: 'Accueil' },
        { id: 'my-programs', icon: ScrollText, label: 'Progr.' },
        { id: 'vma-calculator', icon: Gauge, label: 'VMA' },
        { id: 'profile', icon: User, label: 'Profil' },
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
        <nav className="relative h-20 bg-transparent flex justify-around items-center z-20 flex-shrink-0 px-4">
            {navItems.map(item => {
                // Active state logic: match exact page OR match home if welcome
                // Also highlight 'my-programs' if we are in a detailed week view
                const isActive = activePage === item.id || 
                                 (program && item.id === 'home' && page === 'welcome') ||
                                 (item.id === 'my-programs' && page.toString().startsWith('week-'));

                return (
                    <button
                        key={item.id}
                        onClick={() => handleNavClick(item.id as Page)}
                        className={`flex flex-col items-center justify-center space-y-1 transition-colors duration-200 ${
                            isActive ? 'text-green-400' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        <item.icon size={24} />
                        <span className="text-xs font-medium">{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
};

export default BottomNav;
