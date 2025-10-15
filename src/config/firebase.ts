import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

// Firebase configuration - temporarily disable Firebase if credentials not available
const firebaseConfig = {
  apiKey: "placeholder", // Will be replaced with actual key when available
  authDomain: "placeholder.firebaseapp.com",
  projectId: "placeholder",
  messagingSenderId: "000000000000",
  appId: "placeholder"
};

// Initialize Firebase with error handling
let app;
let auth;
try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log('⚠️ Firebase using placeholder config - OTP will not work until real credentials are added');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  // Create dummy auth object to prevent crashes
  auth = null;
}

// Export auth with null check
export { auth, RecaptchaVerifier, signInWithPhoneNumber };