import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const login = (email, password) => {
    // Mock login logic
    setCurrentUser({
      id: 1,
      name: 'John Doe',
      email: email,
      avatar: null
    });
    setIsLoggedIn(true);
  };

  const logout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      currentUser,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};