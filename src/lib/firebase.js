import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "movie-watchlist-d2dd8.firebaseapp.com",
  projectId: "movie-watchlist-d2dd8",
  storageBucket: "movie-watchlist-d2dd8.firebasestorage.app",
  messagingSenderId: "390357333431",
  appId: "1:390357333431:web:12d056ee26a172cd6b6432",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
