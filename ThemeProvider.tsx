import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';
import { Theme, lightTheme, darkTheme } from './theme';

const ThemeContext = createContext<Theme | undefined>(undefined);

export const useTheme = () => {
  const theme = useContext(ThemeContext);
  if (!theme) 
    throw new Error('useTheme must be used within a ThemeProvider');
  
  return theme;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const colorScheme = Appearance.getColorScheme();
    return colorScheme === 'dark' ? darkTheme : lightTheme;
  });

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setTheme(colorScheme === 'dark' ? darkTheme : lightTheme);
    });

    return () => subscription?.remove();
  }, []);

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};