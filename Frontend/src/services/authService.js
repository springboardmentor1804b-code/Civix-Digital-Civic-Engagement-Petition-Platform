// authService.js
import api from "./api";

export const authService = {
  login: async (email, password) => {
    try {
      console.log("Logging in:", email);
      const response = await api.post("/auth/login", { email, password });
      
      if (response.data.success) {
        const userData = response.data;
        
        // Store user data AND token in localStorage
        localStorage.setItem("user", JSON.stringify(userData));
        
        // Also store token separately for easier access
        if (userData.token) {
          localStorage.setItem("token", userData.token);
        }
        
        console.log("Storing user data:", userData);
        console.log("Token stored:", userData.token ? "Yes" : "No");
        
        return userData;
      }
      
      throw new Error(response.data.message || "Login failed");
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      
      if (response.data.success) {
        const data = response.data;
        
        // Store user data AND token in localStorage
        localStorage.setItem("user", JSON.stringify(data));
        
        // Also store token separately
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        
        return data;
      }
      
      throw new Error(response.data.message || "Registration failed");
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear local storage
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  },

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem("user");
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  },

  isAuthenticated: () => {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    return !!(user && token);
  },

  // ADD MISSING FUNCTION - Check if user is public official
  isPublicOfficial: () => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData) return false;
      
      const parsedUser = JSON.parse(userData);
      const user = parsedUser?.user || parsedUser;
      
      return user?.role === 'public-official';
    } catch (error) {
      console.error("Error checking public official status:", error);
      return false;
    }
  },

  // Additional helper function - Get user role
  getUserRole: () => {
    try {
      const userData = localStorage.getItem("user");
      if (!userData) return null;
      
      const parsedUser = JSON.parse(userData);
      const user = parsedUser?.user || parsedUser;
      
      return user?.role || 'citizen';
    } catch (error) {
      console.error("Error getting user role:", error);
      return 'citizen';
    }
  }
};

// Export individual functions for named imports
export const { 
  login, 
  register, 
  logout, 
  getCurrentUser, 
  isAuthenticated, 
  isPublicOfficial,
  getUserRole 
} = authService;

export default authService;
