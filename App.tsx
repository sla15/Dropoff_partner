import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { LoadingScreen } from './screens/LoadingScreen';

const AppContent: React.FC = () => {
  const { isOnboarded, secondaryOnboardingRole, isLoading } = useApp();

  // Show loading screen during initialization
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Show onboarding if not onboarded OR if user is adding a new role (secondary onboarding)
  const showOnboarding = !isOnboarded || secondaryOnboardingRole !== null;

  return showOnboarding ? <OnboardingScreen /> : <Layout />;
}

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;