// Import Firebase SDK
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, signInWithEmailAndPassword } from "firebase/auth";

// Your Firebase configuration (use your actual Firebase config)
const firebaseConfig = {
  apiKey: "AIzaSyDpUxYJphboHSJRXcBfEpNpTixlcyMGau0",
  authDomain: "kilonzocorp-c5cfb.firebaseapp.com",
  projectId: "kilonzocorp-c5cfb",
  storageBucket: "kilonzocorp-c5cfb.firebasestorage.app",
  messagingSenderId: "684642845648",
  appId: "1:684642845648:web:50c5524372e20ae5c0afd5",
  measurementId: "G-LL0K4NFG7F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Auth instance
const auth = getAuth(app);

// Function to sign up a user with Firebase Authentication
const signUpWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Function to send email verification after sign-up
const sendVerificationEmail = async (user) => {
  try {
    await sendEmailVerification(user);
  } catch (error) {
    throw new Error(error.message);
  }
};

// **Exporting signInWithEmailAndPassword as well**
export { auth, signUpWithEmailAndPassword, sendVerificationEmail, signInWithEmailAndPassword };
