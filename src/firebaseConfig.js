// src/firebaseConfig.js

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// --- BURAYI KENDİ BİLGİLERİNLE DOLDUR ---
const firebaseConfig = {
  apiKey: "AIzaSyAueh5DQfuNhXyuoOHsuf97Zax0UzRNkpI",
  authDomain: "emlakprj.firebaseapp.com",
  projectId: "emlakprj",
  storageBucket: "emlakprj.firebasestorage.app",
  messagingSenderId: "91728663490",
  appId: "1:91728663490:web:b581d29d526740ec43bc5b",
  measurementId: "G-21QZSLC1HK"
};

// ----------------------------------------

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { db, auth };