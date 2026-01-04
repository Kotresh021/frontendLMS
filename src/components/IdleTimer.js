import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const IdleTimer = () => {
    const { logout, user } = useAuth();

    // Set timeout duration (e.g., 15 minutes = 900000 ms)
    const TIMEOUT_DURATION = 15 * 60 * 1000;

    useEffect(() => {
        if (!user) return; // Only track if logged in

        let timeout;

        const resetTimer = () => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                alert("Session expired due to inactivity.");
                logout();
                window.location.href = '/';
            }, TIMEOUT_DURATION);
        };

        // Events that reset the timer
        const events = ['mousemove', 'keydown', 'click', 'scroll'];

        // Attach listeners
        events.forEach(event => window.addEventListener(event, resetTimer));

        // Start timer initially
        resetTimer();

        // Cleanup
        return () => {
            clearTimeout(timeout);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
    }, [user, logout]);

    return null; // This component renders nothing visually
};

export default IdleTimer;