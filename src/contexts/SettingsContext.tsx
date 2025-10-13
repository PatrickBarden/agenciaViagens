import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { toast } from "sonner";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

// Helper to convert hex to HSL
const hexToHsl = (hex: string): string => {
  if (!hex) return "217 100% 54%"; // Default color if hex is invalid
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

  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
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

const applyColorTheme = (color: string) => {
  const root = document.documentElement;
  const hslColor = hexToHsl(color);
  root.style.setProperty('--primary', hslColor);
  
  const [h, s, l] = hslColor.split(' ').map(val => parseInt(val));
  const hoverL = Math.max(0, l - 6);
  root.style.setProperty('--primary-hover', `${h} ${s}% ${hoverL}%`);
};

interface SettingsContextType {
  logoUrl: string | null;
  primaryColor: string;
  setLogoUrl: (url: string | null) => void;
  setPrimaryColor: (color: string) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const DEFAULT_PRIMARY_COLOR = '#1A75FF';

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [logoUrl, setLogoUrlState] = useState<string | null>(null);
  const [primaryColor, setPrimaryColorState] = useState<string>(DEFAULT_PRIMARY_COLOR);

  // Load settings from DB when user is available
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
          throw error;
        }

        if (data) {
          setLogoUrlState(data.logo_url || null);
          setPrimaryColorState(data.primary_color || DEFAULT_PRIMARY_COLOR);
        } else {
          // No settings found, use defaults
          setLogoUrlState(null);
          setPrimaryColorState(DEFAULT_PRIMARY_COLOR);
        }
      } catch (error: any) {
        console.error("Error fetching user settings:", error);
        toast.error("Não foi possível carregar suas configurações.");
      }
    };

    fetchSettings();
  }, [user]);

  // Apply theme whenever primaryColor changes
  useEffect(() => {
    applyColorTheme(primaryColor);
  }, [primaryColor]);

  const upsertSetting = useCallback(async (setting: { logo_url?: string | null; primary_color?: string }) => {
    if (!user) {
      toast.error("Você precisa estar logado para salvar as configurações.");
      return;
    }
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({ user_id: user.id, ...setting }, { onConflict: 'user_id' });

      if (error) throw error;
      
      if (setting.primary_color) toast.success("Cor principal atualizada!");
      if (setting.logo_url !== undefined) toast.success("Logo atualizado com sucesso!");

    } catch (error: any) {
      console.error("Error saving setting:", error);
      toast.error("Erro ao salvar configuração.");
    }
  }, [user]);

  const setLogoUrl = (url: string | null) => {
    setLogoUrlState(url);
    upsertSetting({ logo_url: url });
  };

  const setPrimaryColor = (color: string) => {
    setPrimaryColorState(color);
    upsertSetting({ primary_color: color });
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