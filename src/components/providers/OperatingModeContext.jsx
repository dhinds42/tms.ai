import React, { createContext, useContext, useState, useEffect } from 'react';

const OperatingModeContext = createContext();

export function OperatingModeProvider({ children }) {
  const [operatingMode, setOperatingModeState] = useState(() => {
    return localStorage.getItem('tms_operating_mode') || 'broker';
  });

  const setOperatingMode = (newMode) => {
    setOperatingModeState(newMode);
    localStorage.setItem('tms_operating_mode', newMode);
  };

  return (
    <OperatingModeContext.Provider value={{ operatingMode, setOperatingMode }}>
      {children}
    </OperatingModeContext.Provider>
  );
}

export function useOperatingMode() {
  const context = useContext(OperatingModeContext);
  if (!context) {
    throw new Error('useOperatingMode must be used within OperatingModeProvider');
  }
  return context;
}