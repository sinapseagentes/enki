import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { UserProfile } from "../types";

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

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const snap = await getDoc(userRef);
  if (snap.exists()) {
    const data = snap.data();
    return {
      uid: userId,
      email: data.email || '',
      displayName: data.displayName || 'Usuário Anônimo',
      photoURL: data.photoURL || '',
      bio: data.bio || '',
      title: data.title || '',
      joinedAt: data.joinedAt || data.lastLogin || Date.now(),
      lastSeen: data.lastSeen,
      isOnline: data.isOnline,
      role: data.role || 'user',
      storageLimit: data.storageLimit,
      storageMetrics: data.storageMetrics
    };
  }
  return null;
};

// Admin only function
export const getAllUsers = async (): Promise<UserProfile[]> => {
  const usersRef = collection(db, USERS_COLLECTION);
  const snap = await getDocs(usersRef);
  return snap.docs.map(doc => {
    const data = doc.data();
    return {
      uid: doc.id,
      email: data.email || '',
      displayName: data.displayName || 'Usuário Anônimo',
      photoURL: data.photoURL || '',
      role: data.role || 'user',
      storageLimit: data.storageLimit,
      storageMetrics: data.storageMetrics,
      isOnline: data.isOnline
    } as UserProfile;
  });
};

export const deleteUserDocument = async (userId: string) => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await deleteDoc(userRef);
};

export const updateUserRoleAndLimit = async (userId: string, role: 'admin' | 'user', storageLimit: number) => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await setDoc(userRef, { role, storageLimit }, { merge: true });
};

export const updateUserProfile = async (userId: string, data: Partial<UserProfile>) => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const snap = await getDoc(userRef);
  
  if (!snap.exists()) {
    await setDoc(userRef, data);
  } else {
    await updateDoc(userRef, data);
  }
};

export interface UserStats {
  boardsCount: number;
  cardsCreated: number;
  cardsCompleted: number;
  daysActive: number;
}

export const getUserStats = async (userId: string): Promise<UserStats> => {
  try {
    // 1. Count boards where user is a member
    const boardsRef = collection(db, "boards");
    const boardsQ = query(boardsRef, where("members", "array-contains", userId));
    const boardsSnap = await getDocs(boardsQ);
    const boardsCount = boardsSnap.size;

    // 2. Count cards created by user (from activities)
    const activitiesRef = collection(db, "activities");
    const cardsCreatedQ = query(activitiesRef, where("userId", "==", userId), where("type", "==", "card_created"));
    const cardsCreatedSnap = await getDocs(cardsCreatedQ);
    const cardsCreated = cardsCreatedSnap.size;

    // 3. Count cards completed (this would ideally be a separate field, but for now we can mock or estimate)
    // For simplicity, we'll return 0 if we don't have a direct way to query checklist completion by user
    const cardsCompleted = 0; // TODO: implement full logic

    // 4. Calculate days active
    const userProfile = await getUserProfile(userId);
    let daysActive = 1;
    if (userProfile?.joinedAt) {
      const msPerDay = 1000 * 60 * 60 * 24;
      daysActive = Math.max(1, Math.ceil((Date.now() - userProfile.joinedAt) / msPerDay));
    }

    return {
      boardsCount,
      cardsCreated,
      cardsCompleted,
      daysActive
    };
  } catch (error) {
    console.error("Error getting user stats:", error);
    return { boardsCount: 0, cardsCreated: 0, cardsCompleted: 0, daysActive: 1 };
  }
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
