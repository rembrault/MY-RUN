
import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface NeonButtonProps {
    onClick: () => void;
    children: ReactNode;
    className?: string;
    icon?: ReactNode;
    disabled?: boolean;
}

const NeonButton: React.FC<NeonButtonProps> = ({ onClick, children, className = '', icon, disabled }) => {
    return (
        <motion.button
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            onClick={onClick}
            disabled={disabled}
            className={`w-full flex items-center justify-center gap-2 bg-[#00ff87] text-[#0a0a0f] font-bold py-4 px-6 rounded-full transition-colors duration-300 neon-green-box ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:brightness-110'}`}
        >
            {icon && <span>{icon}</span>}
            {children}
        </motion.button>
    );
};

export default NeonButton;
