import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  signOut as firebaseSignOut
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCDVeuIOjg-TNAUT45hRB129CHYOXcyFfA",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "p3hm-2026.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "p3hm-2026",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "p3hm-2026.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "744697513752",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:744697513752:web:9592ab65d2723ff545806d",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    
    // Always sign out from firebase client auth before popup to ensure user selection
    try {
      await firebaseSignOut(auth);
    } catch (_) {}

    const isElectronEnv = typeof window !== "undefined" && (
      window.navigator.userAgent.includes("Electron") || 
      !!(window as any).electronAPI
    );

    try {
      const result = await signInWithPopup(auth, provider);
      return { user: result.user, error: null };
    } catch (popupErr: any) {
      if (isElectronEnv) {
        console.warn("Electron Google Popup notice:", popupErr?.message);
        return { user: null, error: "Otentikasi Google ditutup atau terhalang. Silakan coba kembali." };
      }
      if (
        popupErr?.code === "auth/popup-blocked" ||
        popupErr?.code === "auth/popup-closed-by-user" ||
        popupErr?.message?.includes("popup-blocked")
      ) {
        console.warn("Popup blocked, falling back to signInWithRedirect:", popupErr);
        await signInWithRedirect(auth, provider);
        return { user: null, error: null };
      }
      throw popupErr;
    }
  } catch (error: any) {
    return { user: null, error: error.message };
  }
}

export async function logoutFirebase() {
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
}
