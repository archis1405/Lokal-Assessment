import { initializeApp } from 'firebase/app';
import { getAnalytics, Analytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyBtItqmNr3_hxHPEMq8qC8JIQV375nEpqM",
  authDomain: "lokal-assessment.firebaseapp.com",
  projectId: "lokal-assessment",
  storageBucket: "lokal-assessment.firebasestorage.app",
  messagingSenderId: "929441703971",
  appId: "1:929441703971:web:4ed8ce795ea3cae4cca996",
  measurementId: "G-D0CZQ1LTLD"
};

let analytics: Analytics | null = null;

try {
  const app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
  console.log('[Firebase] ✓ Analytics initialized');
} catch (error) {
  console.warn('[Firebase] Analytics not configured. Using console fallback.');
  console.warn('[Firebase] To enable: Replace firebaseConfig in src/config/firebase.ts');
}

export { analytics };
