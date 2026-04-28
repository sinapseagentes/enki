import { doc, getDoc, setDoc, updateDoc, onSnapshot, collection, query, where } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { UserProfile } from "../types";

const USERS_COLLECTION = "users";
const PRESENCE_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

// Update user's last seen timestamp
export const updatePresence = async (userId: string, isOnline: boolean = true) => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  try {
    await updateDoc(userRef, {
      lastSeen: Date.now(),
      isOnline
    });
  } catch (error) {
    // If doc doesn't exist yet, we might want to create it, but usually AuthContext handles initial creation.
    console.error("Error updating presence:", error);
  }
};

// Check if a user is currently considered online
export const isUserOnline = (lastSeen?: number, isOnlineFlag?: boolean): boolean => {
  if (isOnlineFlag === false) return false;
  if (!lastSeen) return false;
  return (Date.now() - lastSeen) < PRESENCE_TIMEOUT_MS;
};

// Subscribe to presence updates for a list of user IDs
export const subscribeToPresence = (userIds: string[], callback: (profiles: Record<string, UserProfile>) => void) => {
  if (!userIds || userIds.length === 0) {
    callback({});
    return () => {};
  }

  const usersRef = collection(db, USERS_COLLECTION);
  // Firestore 'in' query has a limit of 10 items.
  // For larger boards, we would need to batch queries or use a different approach.
  // For now, we'll slice to 10 for safety if it gets too large.
  const queryUserIds = userIds.slice(0, 10);
  const q = query(usersRef, where("uid", "in", queryUserIds));

  return onSnapshot(q, (snapshot) => {
    const profiles: Record<string, UserProfile> = {};
    snapshot.forEach((doc) => {
      const data = doc.data() as UserProfile;
      profiles[data.uid] = data;
    });
    callback(profiles);
  });
};
