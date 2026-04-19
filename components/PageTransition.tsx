import React, { ReactNode } from 'react';
import { motion, Variants } from 'framer-motion';

interface PageTransitionProps {
    children: ReactNode;
    direction?: 'forward' | 'back' | 'tab';
    className?: string;
}

const slideDistance = 60;

const forwardVariants: Variants = {
    initial: { opacity: 0, x: slideDistance },
    in:      { opacity: 1, x: 0 },
    out:     { opacity: 0, x: -slideDistance * 0.5 },
};

const backVariants: Variants = {
    initial: { opacity: 0, x: -slideDistance },
    in:      { opacity: 1, x: 0 },
    out:     { opacity: 0, x: slideDistance * 0.5 },
};

const tabVariants: Variants = {
    initial: { opacity: 0, scale: 0.97 },
    in:      { opacity: 1, scale: 1 },
    out:     { opacity: 0, scale: 0.97 },
};

const springTransition = {
    type: 'spring' as const,
    stiffness: 350,
    damping: 30,
    mass: 0.8,
};

const tabTransition = {
    type: 'tween' as const,
    ease: [0.25, 0.1, 0.25, 1] as number[],
    duration: 0.2,
};

const PageTransition: React.FC<PageTransitionProps> = ({
    children,
    direction = 'forward',
    className = '',
}) => {
    const variants = direction === 'back'
        ? backVariants
        : direction === 'tab'
        ? tabVariants
        : forwardVariants;

    const transition = direction === 'tab' ? tabTransition : springTransition;

    return (
        <motion.div
            initial="initial"
            animate="in"
            exit="out"
            variants={variants}
            transition={transition}
            className={`h-full w-full ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default PageTransition;
