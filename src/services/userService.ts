import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

const USERS_COLLECTION = "users";

export interface UserSettings {
  dashboardBackground?: string;
  themePreference?: "light" | "dark";
  displayName?: string;
  photoURL?: string;
}

export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    return snap.data() as UserSettings;
  }
  return null;
};

export const getUserProfile = async (userId: string): Promise<{uid: string, displayName: string, photoURL: string} | null> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    const data = snap.data();
    return {
      uid: userId,
      displayName: data.displayName || 'Usuário Anônimo',
      photoURL: data.photoURL || ''
    };
  }
  return null;
};

export const updateDashboardBackground = async (userId: string, background: string) => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const snap = await getDoc(userRef);
  
  if (!snap.exists()) {
    await setDoc(userRef, { dashboardBackground: background });
  } else {
    await updateDoc(userRef, { dashboardBackground: background });
  }
};
