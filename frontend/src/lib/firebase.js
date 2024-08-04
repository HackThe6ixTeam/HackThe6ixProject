// lib/firebase.js
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyATNXBwpQBWodT2vv8dIFwWOEBdTN9fGnA",
  authDomain: "verify-ea951.firebaseapp.com",
  projectId: "verify-ea951",
  storageBucket: "verify-ea951.appspot.com",
  messagingSenderId: "1004045762264",
  appId: "1:1004045762264:web:a63dcddc5ca32c9ddda1ad"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
