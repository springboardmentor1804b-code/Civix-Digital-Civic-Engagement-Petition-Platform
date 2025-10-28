import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    console.warn('useAuth used outside AuthProvider, returning defaults');
    
    // Try to get user from localStorage as fallback
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    
    return {
      user,
      loading: false,
      login: async () => {},
      logout: async () => {},
      checkAuth: async () => {}
    };
  }
  
  return context;
};