import { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // --- Dark Mode State ---
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

    // --- Sidebar States ---
    // Desktop: true = collapsed (mini), false = expanded
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(localStorage.getItem('sidebarCollapsed') === 'true');

    // Mobile: true = open (overlay), false = hidden
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Apply Theme to Body
    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Persist Sidebar State
    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', isSidebarCollapsed);
    }, [isSidebarCollapsed]);

    const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

    // Desktop Toggle (Collapse/Expand)
    const toggleSidebar = () => setIsSidebarCollapsed(prev => !prev);

    // Mobile Toggle (Open/Close Overlay)
    const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);

    return (
        <ThemeContext.Provider value={{
            theme, toggleTheme,
            isSidebarCollapsed, toggleSidebar,
            isMobileMenuOpen, toggleMobileMenu, setIsMobileMenuOpen
        }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);