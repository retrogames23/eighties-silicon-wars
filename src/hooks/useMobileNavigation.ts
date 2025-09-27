import { useState, useCallback } from 'react';
import { useIsMobile } from './use-mobile';

interface UseMobileNavigationProps {
  tabs: string[];
  initialTab?: string;
}

export const useMobileNavigation = ({ tabs, initialTab = tabs[0] }: UseMobileNavigationProps) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  const navigateToTab = useCallback((direction: 'left' | 'right') => {
    const currentIndex = tabs.indexOf(activeTab);
    if (direction === 'left' && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    } else if (direction === 'right' && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  }, [activeTab, tabs]);

  const toggleMenu = useCallback(() => {
    setIsMenuOpen(prev => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  return {
    activeTab,
    setActiveTab,
    isMenuOpen,
    toggleMenu,
    closeMenu,
    navigateToTab,
    isMobile,
  };
};