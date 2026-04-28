import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { auth, googleProvider, db } from "../lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser && currentUser.email) {
        try {
          const { doc, setDoc } = await import("firebase/firestore");
          await setDoc(doc(db, "users", currentUser.uid), {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            lastLogin: Date.now()
          }, { merge: true });
        } catch (error) {
          console.error("Error saving user profile to DB:", error);
        }
      }
    });
    return unsubscribe;
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (user) {
        try {
          const { updatePresence } = await import("../services/presenceService");
          await updatePresence(user.uid, false);
        } catch (e) {
          console.error("Error setting offline status on logout", e);
        }
      }
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  useEffect(() => {
    let heartbeatInterval: ReturnType<typeof setInterval>;

    if (user) {
      const startHeartbeat = async () => {
        const { updatePresence } = await import("../services/presenceService");
        
        // Initial heartbeat
        updatePresence(user.uid, true);

        // Regular heartbeat every 60 seconds
        heartbeatInterval = setInterval(() => {
          updatePresence(user.uid, true);
        }, 60000);
      };

      startHeartbeat();

      // Handle beforeunload to mark offline
      const handleBeforeUnload = () => {
        // We use a synchronous XMLHttpRequest here or just navigator.sendBeacon if possible, 
        // but simple async update Doc might not finish in time.
        // We'll rely on timeout for unexpected disconnects.
      };
      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        clearInterval(heartbeatInterval);
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
