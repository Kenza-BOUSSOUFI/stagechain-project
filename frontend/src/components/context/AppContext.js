import React, { createContext, useContext, useState } from 'react';

export const AppCtx = createContext(null);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Had l-logic hiya li m-7taja AuthPage (destructuring property 'login')
  const login = (userData) => {
    setUser(userData);
    console.log("User logged in:", userData);
  };

  const logout = () => setUser(null);

  return (
    <AppCtx.Provider value={{ user, login, logout }}>
      {children}
    </AppCtx.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppCtx);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};