import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCe0QbVEa_icGAWyZlmjKMRjIBt25_ZWEY",
  authDomain: "hiresense-ai-50695.firebaseapp.com",
  projectId: "hiresense-ai-50695",
  storageBucket: "hiresense-ai-50695.firebasestorage.app",
  messagingSenderId: "700160889144",
  appId: "1:700160889144:web:9ebc9a6436875fe6f471cd",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);