import React from 'react';
import { AuthProvider, useAuth } from './AuthContext';
import { UIProvider, useUI } from './UIContext';
import { DomainProvider, useDomain } from './DomainContext';
import { ProfileProvider, useProfile } from './ProfileContext';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthProvider>
      <UIProvider>
        <DomainProvider>
          <ProfileProvider>
            {children}
          </ProfileProvider>
        </DomainProvider>
      </UIProvider>
    </AuthProvider>
  );
};

export const useApp = () => {
  const auth = useAuth();
  const ui = useUI();
  const domain = useDomain();
  const profile = useProfile();

  return {
    ...auth,
    ...ui,
    ...domain,
    ...profile,
  };
};

export { useAuth } from './AuthContext';
export { useUI } from './UIContext';
export { useDomain } from './DomainContext';
export { useProfile } from './ProfileContext';
