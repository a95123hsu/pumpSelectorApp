import React, { createContext, useState, useContext, useMemo } from 'react';
// Use default import syntax
import translations from '../translations';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [language, setLanguage] = useState("English");

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
    getText
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);