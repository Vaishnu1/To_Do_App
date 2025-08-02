import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// Your Firebase configuration object
const firebaseConfig = {
  apiKey: "AIzaSyDsJfrFG2_wRIP8MOT_P7R3Ab_NSz0LZUk",
  authDomain: "to-do-8ee8f.firebaseapp.com",
  projectId: "to-do-8ee8f",
  storageBucket: "to-do-8ee8f.firebasestorage.app",
  messagingSenderId: "877112973840",
  appId: "1:877112973840:web:1399beff0a75e09cd5c895",
  measurementId: "G-T0VVZM8TBC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
const db = getFirestore(app);

export { db, auth };
