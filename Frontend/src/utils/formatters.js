/**
 * Format user address for display
 */
export const formatUserAddress = (user) => {
  if (!user) return 'No location';
  
  if (user.address) {
    const { city, state, country } = user.address;
    const parts = [city, state, country].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'No location set';
  }
  
  return 'No location set';
};

/**
 * Format user location coordinates for display (if needed)
 */
export const formatUserLocation = (user) => {
  if (!user?.location?.coordinates) return null;
  
  const [lng, lat] = user.location.coordinates;
  return {
    latitude: lat,
    longitude: lng,
    display: `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  };
};

/**
 * Get user avatar URL with fallback
 */
export const getUserAvatar = (user, defaultAvatar = "https://randomuser.me/api/portraits/men/75.jpg") => {
  return user?.avatar || user?.profilePicture || defaultAvatar;
};

/**
 * Format user role for display
 */
export const formatUserRole = (role) => {
  if (!role) return 'Citizen';
  
  const roleMap = {
    'citizen': 'Citizen',
    'official': 'Official',
    'admin': 'Administrator'
  };
  
  return roleMap[role] || role.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

/**
 * Format date for display
 */
export const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Format date and time for display
 */
export const formatDateTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format number with commas
 */
export const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  return num.toLocaleString();
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Get initials from name
 */
export const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

export default {
  formatUserAddress,
  formatUserLocation,
  getUserAvatar,
  formatUserRole,
  formatDate,
  formatDateTime,
  formatNumber,
  truncateText,
  getInitials
};