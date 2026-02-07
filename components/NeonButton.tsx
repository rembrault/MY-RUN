
import React, { ReactNode } from 'react';

interface NeonButtonProps {
    onClick: () => void;
    children: ReactNode;
    className?: string;
    icon?: ReactNode;
    // Fix: Add optional disabled prop to allow disabling the button.
    disabled?: boolean;
}

const NeonButton: React.FC<NeonButtonProps> = ({ onClick, children, className = '', icon, disabled }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            // Fix: Add conditional styling for the disabled state and handle hover effect.
            className={`w-full flex items-center justify-center gap-2 bg-[#00ff87] text-[#0a0a0f] font-bold py-4 px-6 rounded-full transition-all duration-300 transform neon-green-box ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}`}
        >
            {icon && <span>{icon}</span>}
            {children}
        </button>
    );
};

export default NeonButton;
    