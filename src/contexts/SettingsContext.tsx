import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Helper to convert hex to HSL, as the theme uses HSL values
const hexToHsl = (hex: string): string => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }

  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
};

interface SettingsContextType {
  logoUrl: string | null;
  primaryColor: string; // Stored as hex
  setLogoUrl: (url: string | null) => void;
  setPrimaryColor: (color: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const DEFAULT_PRIMARY_COLOR = '#1A75FF'; // The original primary color

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [logoUrl, setLogoUrlState] = useState<string | null>(null);
  const [primaryColor, setPrimaryColorState] = useState<string>(DEFAULT_PRIMARY_COLOR);

  // Load settings from localStorage on initial render
  useEffect(() => {
    const savedLogoUrl = localStorage.getItem('crm_logo_url');
    const savedPrimaryColor = localStorage.getItem('crm_primary_color');

    if (savedLogoUrl) {
      setLogoUrlState(savedLogoUrl);
    }
    if (savedPrimaryColor) {
      setPrimaryColorState(savedPrimaryColor);
    }
  }, []);

  // Apply primary color to CSS variables whenever it changes
  useEffect(() => {
    if (primaryColor) {
      const root = document.documentElement;
      const hslColor = hexToHsl(primaryColor);
      root.style.setProperty('--primary', hslColor);
      
      const [h, s, l] = hslColor.split(' ').map(val => parseInt(val));
      const hoverL = Math.max(0, l - 6);
      root.style.setProperty('--primary-hover', `${h} ${s}% ${hoverL}%`);
    }
  }, [primaryColor]);

  const setLogoUrl = (url: string | null) => {
    setLogoUrlState(url);
    if (url) {
      localStorage.setItem('crm_logo_url', url);
    } else {
      localStorage.removeItem('crm_logo_url');
    }
  };

  const setPrimaryColor = (color: string) => {
    setPrimaryColorState(color);
    localStorage.setItem('crm_primary_color', color);
  };

  return (
    <SettingsContext.Provider value={{ logoUrl, primaryColor, setLogoUrl, setPrimaryColor }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};