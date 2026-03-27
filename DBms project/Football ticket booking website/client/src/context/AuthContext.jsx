// ─── Auth Context (Context API) ───
import { createContext, useContext, useState, useEffect } from 'react';
import { getProfile, authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            getProfile()
                .then((res) => setUser(res.data.user))
                .catch(() => {
                    localStorage.removeItem('token');
                    setUser(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const switchUserRole = async (role) => {
        if (!role) return;
        try {
            const res = await authAPI.switchRole({ role });
            // Update token and user state
            localStorage.setItem('token', res.data.token);
            setUser(res.data.user);
        } catch (err) {
            console.error('Failed to switch role', err);
            alert('Failed to switch role: ' + (err.response?.data?.error || err.message));
        }
    };

    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, switchUserRole }}>
            {children}
        </AuthContext.Provider>
    );
}
