
import { initializeApp } from "firebase/app";
import {getAuth, GoogleAuthProvider} from "firebase/auth"
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY, 
 authDomain: "ai-interview-agent-6613d.firebaseapp.com",
  projectId: "ai-interview-agent-6613d",
  storageBucket: "ai-interview-agent-6613d.firebasestorage.app",
  messagingSenderId: "399582214445",
  appId: "1:399582214445:web:2dbbe8e5f33c76a7eb3ba4"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider()

export {auth , provider}