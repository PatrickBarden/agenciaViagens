import React from 'react';
import { useSettings } from '@/contexts/SettingsContext';

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const { logoUrl } = useSettings();

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="object-contain w-full h-full" />
              ) : (
                <span className="text-white font-bold text-lg">B</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-sidebar-foreground">Barden CRM</h1>
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};