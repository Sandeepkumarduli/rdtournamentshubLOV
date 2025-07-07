import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

// Firebase configuration using environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_SUPABASE_SECRET_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_SUPABASE_SECRET_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_SUPABASE_SECRET_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_SUPABASE_SECRET_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_SUPABASE_SECRET_FIREBASE_APP_ID
};

// Debug logging
console.log('🔥 Firebase Config Debug:', {
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'MISSING',
  authDomain: firebaseConfig.authDomain || 'MISSING',
  projectId: firebaseConfig.projectId || 'MISSING',
  messagingSenderId: firebaseConfig.messagingSenderId || 'MISSING',
  appId: firebaseConfig.appId ? `${firebaseConfig.appId.substring(0, 10)}...` : 'MISSING'
});

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  throw error;
}

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export { RecaptchaVerifier, signInWithPhoneNumber };