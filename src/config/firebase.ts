import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

// Firebase configuration - these are public API keys
// Replace with your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyDVl8Dg8Z0t4H9Fz8Y1M2J3K4L5N6O7P8Q", // Replace with your actual API key
  authDomain: "rdth-tournaments.firebaseapp.com", // Replace with your actual auth domain  
  projectId: "rdth-tournaments", // Replace with your actual project ID
  messagingSenderId: "123456789012", // Replace with your actual sender ID
  appId: "1:123456789012:web:abc123def456ghi789jkl" // Replace with your actual app ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export { RecaptchaVerifier, signInWithPhoneNumber };