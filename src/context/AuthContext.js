import { createContext, useState, useEffect, useContext } from 'react';
import API from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        verifySession();
    }, []);

    const verifySession = async () => {
        // CHANGE: localStorage -> sessionStorage
        const savedUser = sessionStorage.getItem('user');

        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            setUser(parsedUser);

            try {
                // Verify with backend
                await API.put('/users/profile', { token: parsedUser.token });
            } catch (error) {
                console.error("Session verification failed:", error);
                logout();
            }
        }
        setLoading(false);
    };

    const login = (userData) => {
        // CHANGE: localStorage -> sessionStorage
        sessionStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        // CHANGE: localStorage -> sessionStorage
        sessionStorage.removeItem('user');
        sessionStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;