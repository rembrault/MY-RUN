
import React from 'react';
import { Home, Calendar, Plus, User, Gauge } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Page } from '../types';

const BottomNav: React.FC = () => {
    const { page, setPage, program } = useAppContext();

    const navItems = [
        { id: 'home', icon: Home, label: 'Accueil' },
        { id: 'calendar', icon: Calendar, label: 'Calendrier' },
        { id: 'vma-calculator', icon: Gauge, label: 'VMA' },
        { id: 'profile', icon: User, label: 'Profil' },
    ];

    const handleNavClick = (targetPage: Page) => {
        if (!program && (targetPage === 'home' || targetPage === 'calendar')) {
            setPage('welcome');
        } else {
            setPage(targetPage);
        }
    };
    
    const activePage = page === 'welcome' ? 'home' : page;

    return (
        <nav className="relative h-20 bg-transparent flex justify-around items-center z-20 flex-shrink-0">
            {navItems.map(item => {
                 const isNewProgramButton = item.id === 'new-program';
                 if (isNewProgramButton) {
                     return (
                         <button key={item.id} onClick={() => setPage('new-program')} className="absolute left-1/2 -translate-x-1/2 -top-6 bg-green-500 text-black rounded-full p-4 shadow-lg shadow-green-500/30">
                           <Plus size={28} />
                         </button>
                     );
                 }
                
                const isActive = activePage === item.id || (program && item.id === 'home' && page === 'welcome');
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
    