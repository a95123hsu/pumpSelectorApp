import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
// Use default import syntax
import translations from '../translations';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Helper to get default language from URL
  const getDefaultLanguage = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('lang') === 'zh') return '繁體中文';
    if (params.get('lang') === 'en') return 'English';
    return localStorage.getItem('language') || 'English';
  };

  // Load language from URL or localStorage
  const [language, setLanguage] = useState(getDefaultLanguage);

  // Dark mode state
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem('darkMode');
    return stored === 'true';
  });

  // Persist dark mode to localStorage and update document class
  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Persist language to localStorage and update URL whenever it changes
  useEffect(() => {
    localStorage.setItem('language', language);
    // Update URL query parameter
    const params = new URLSearchParams(window.location.search);
    if (language === '繁體中文') {
      params.set('lang', 'zh');
    } else {
      params.set('lang', 'en');
    }
    const newUrl = window.location.pathname + '?' + params.toString();
    window.history.replaceState({}, '', newUrl);
  }, [language]);

  // Memoize the getText function to prevent unnecessary re-renders
  const getText = useMemo(() => {
    return (key, lang = language, params = {}) => {
      // Handle optional language parameter (backward compatibility)
      let textParams = params;
      let textLang = language;
      
      // If the second parameter is an object, it's the params (no language specified)
      if (typeof lang === 'object') {
        textParams = lang;
        textLang = language;
      } else {
        textLang = lang;
      }
      
      // Get the translation text or fallback to English or the key itself
      let text = translations[textLang]?.[key] || translations["English"]?.[key] || key;
      
      // Replace all occurrences of each parameter in the text
      if (textParams && typeof textParams === 'object') {
        Object.keys(textParams).forEach(param => {
          // Use replaceAll instead of replace to handle multiple occurrences
          text = text.replaceAll(`{${param}}`, textParams[param]);
        });
      }
      
      return text;
    };
  }, [language]);

  const value = {
    language,
    setLanguage,
    getText,
    darkMode,
    setDarkMode
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);