import { useState } from 'react';

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const login = async (email, password) => {
    // Mock authentication
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCurrentUser({
        id: 1,
        name: 'John Doe',
        email: email,
        avatar: null
      });
      setIsLoggedIn(true);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Invalid credentials' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  return {
    isLoggedIn,
    currentUser,
    login,
    logout
  };
};