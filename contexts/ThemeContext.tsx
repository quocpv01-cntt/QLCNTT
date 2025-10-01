import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

export const colorPalettes = {
    blue: { 50: "239 246 255", 100: "219 234 254", 200: "191 219 254", 300: "147 197 253", 400: "96 165 250", 500: "59 130 246", 600: "37 99 235", 700: "29 78 216", 800: "30 64 175", 900: "30 58 138", 950: "23 37 84" },
    green: { 50: "240 253 244", 100: "220 252 231", 200: "187 247 208", 300: "134 239 172", 400: "74 222 128", 500: "34 197 94", 600: "22 163 74", 700: "21 128 61", 800: "22 101 52", 900: "20 83 45", 950: "5 46 22" },
    rose: { 50: "255 241 242", 100: "255 228 230", 200: "254 205 211", 300: "253 164 175", 400: "251 113 133", 500: "244 63 94", 600: "225 29 72", 700: "190 18 60", 800: "159 18 57", 900: "136 19 55", 950: "76 5 25" },
    indigo: { 50: "238 242 255", 100: "224 231 255", 200: "199 210 254", 300: "165 180 252", 400: "129 140 248", 500: "99 102 241", 600: "79 70 229", 700: "67 56 202", 800: "55 48 163", 900: "49 46 129", 950: "30 27 75" },
};

type PrimaryColor = keyof typeof colorPalettes;

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  primaryColor: PrimaryColor;
  setPrimaryColor: (color: PrimaryColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Define keys for localStorage
const USER_THEME_KEY = 'theme';
const USER_COLOR_KEY = 'primaryColor';
const SYSTEM_DEFAULT_THEME_KEY = 'systemDefaultTheme_v1';
const SYSTEM_DEFAULT_COLOR_KEY = 'systemDefaultColor_v1';

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      // 1. Check for user-specific setting
      const userTheme = localStorage.getItem(USER_THEME_KEY) as Theme;
      if (userTheme && (userTheme === 'light' || userTheme === 'dark')) return userTheme;

      // 2. Check for system-wide default
      const systemTheme = localStorage.getItem(SYSTEM_DEFAULT_THEME_KEY) as Theme;
      if (systemTheme && (systemTheme === 'light' || systemTheme === 'dark')) return systemTheme;
    }
    // 3. Fallback to hardcoded default
    return 'dark';
  });

  const [primaryColor, setPrimaryColorState] = useState<PrimaryColor>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      // 1. Check for user-specific setting
      const userColor = localStorage.getItem(USER_COLOR_KEY) as PrimaryColor;
      if (userColor && colorPalettes[userColor]) return userColor;
      
      // 2. Check for system-wide default
      const systemColor = localStorage.getItem(SYSTEM_DEFAULT_COLOR_KEY) as PrimaryColor;
      if (systemColor && colorPalettes[systemColor]) return systemColor;
    }
    // 3. Fallback to hardcoded default
    return 'blue';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    // Any change to theme by a user is saved as their personal preference
    localStorage.setItem(USER_THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    const palette = colorPalettes[primaryColor];
    for (const [shade, value] of Object.entries(palette)) {
        root.style.setProperty(`--color-primary-${shade}`, String(value));
    }
    // Any change to color by a user is saved as their personal preference
    localStorage.setItem(USER_COLOR_KEY, primaryColor);
  }, [primaryColor]);


  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);
  
  const setPrimaryColor = useCallback((color: PrimaryColor) => {
    setPrimaryColorState(color);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, primaryColor, setPrimaryColor }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};