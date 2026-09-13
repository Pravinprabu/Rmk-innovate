import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import LanguageScreen from './src/screens/LanguageScreen';
import ConsentScreen from './src/screens/ConsentScreen';
import LoginScreen from './src/screens/LoginScreen';
import MainTabs from './src/screens/MainTabs';

// Simple screen-state machine, same shape as the kiosk's own App.jsx --
// no navigation library, just conditional rendering driven by a `screen`
// string. Flow: language -> consent -> login (identify once) -> MainTabs,
// which owns everything after login (the bottom-tab shell and both the
// booking and upload/scan sub-flows).
export default function App() {
  const [screen, setScreen] = useState('language');
  const [language, setLanguage] = useState('en');
  const [patient, setPatient] = useState(null); // { patientId, encounterId, fullName, abhaId, mobileNumber }

  function handleLanguageNext(lang) {
    setLanguage(lang);
    setScreen('consent');
  }

  function handleLoginNext(identified) {
    setPatient(identified);
    setScreen('main');
  }

  return (
    <>
      {screen === 'language' && <LanguageScreen onNext={handleLanguageNext} />}

      {screen === 'consent' && (
        <ConsentScreen onNext={() => setScreen('login')} onBack={() => setScreen('language')} />
      )}

      {screen === 'login' && (
        <LoginScreen language={language} onNext={handleLoginNext} onBack={() => setScreen('consent')} />
      )}

      {screen === 'main' && <MainTabs patient={patient} />}

      <StatusBar style="auto" />
    </>
  );
}
