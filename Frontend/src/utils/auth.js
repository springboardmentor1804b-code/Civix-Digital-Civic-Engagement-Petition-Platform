export const getCurrentUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    // Check multiple possible locations for user ID
    return user?.user?.id || user?.id || user?._id || null;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
};

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem("user");
    if (!user) return null;
    
    const parsed = JSON.parse(user);
    // Return the actual user object, handling different response structures
    return parsed?.user || parsed;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

export const isAuthenticated = () => {
  const user = localStorage.getItem("user");
  const token = localStorage.getItem("token");
  
  if (!user || !token) return false;
  
  try {
    const parsedUser = JSON.parse(user);
    return !!(parsedUser && token);
  } catch (error) {
    console.error("Error checking authentication:", error);
    return false;
  }
};

export const getAuthToken = () => {
  return localStorage.getItem("token");
};

// ADD MISSING FUNCTION - Check if user is public official
export const isPublicOfficial = () => {
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
};

// Get user role
export const getUserRole = () => {
  try {
    const userData = localStorage.getItem("user");
    if (!userData) return 'citizen';
    
    const parsedUser = JSON.parse(userData);
    const user = parsedUser?.user || parsedUser;
    
    return user?.role || 'citizen';
  } catch (error) {
    console.error("Error getting user role:", error);
    return 'citizen';
  }
};
