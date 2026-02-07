
import React, { ReactNode, useState, useRef, useEffect } from 'react';
import BottomNav from './BottomNav';

interface LayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showBottomNav = true }) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<number | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    scrollTimeoutRef.current = window.setTimeout(() => {
      setIsScrolling(false);
    }, 1500); // Hide after 1.5s of no scrolling
  };

  useEffect(() => {
    const mainEl = mainRef.current;
    const currentTimeoutRef = scrollTimeoutRef.current;

    if (mainEl) {
        mainEl.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => {
      if (mainEl) {
        mainEl.removeEventListener('scroll', handleScroll);
      }
      if (currentTimeoutRef) {
        clearTimeout(currentTimeoutRef);
      }
    };
  }, []);

  return (
    <div className="futuristic-grid min-h-screen w-full flex items-center justify-center p-2">
      <div className="relative w-full max-w-md h-[95vh] bg-[#111115] rounded-3xl border border-white/10 flex flex-col overflow-hidden">
        <div className={`absolute top-0 right-2 w-1 h-full bg-[#00ff87]/80 rounded-full z-0 pointer-events-none transition-opacity duration-300 ${isScrolling ? 'opacity-80' : 'opacity-0'}`}></div>
        
        <main ref={mainRef} className="flex-grow overflow-y-auto p-4 z-10 scrollbar-hide">
          {children}
        </main>

        {showBottomNav && <BottomNav />}
      </div>
    </div>
  );
};

export default Layout;
    