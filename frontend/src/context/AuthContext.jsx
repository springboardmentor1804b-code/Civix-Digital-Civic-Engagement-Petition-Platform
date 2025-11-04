import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001') + '/api/auth';

    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                try {
                    const response = await fetch(`${API_URL}/user`, {
                        method: 'GET',
                        headers: { 'x-auth-token': token },
                    });
                    if (response.ok) {
                        const userData = await response.json();
                        setUser(userData);
                    } else {
                        logout();
                    }
                } catch (error) {
                    console.error('Failed to load user', error);
                    logout();
                }
            }
            setLoading(false);
        };
        loadUser();
    }, [token,API_URL]);

    const login = async (formData) => {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            setToken(data.token);
        } else {
            throw new Error(data.msg);
        }
    };
    
    const register = async (formData) => {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            setToken(data.token);
        } else {
            throw new Error(data.msg);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const value = {
        token,
        user,
        loading,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};