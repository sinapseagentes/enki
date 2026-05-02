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
    let unsubscribeUserDoc: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Ativa um olheiro no próprio perfil do usuário para KICK em tempo real
        const { doc, onSnapshot } = await import("firebase/firestore");
        unsubscribeUserDoc = onSnapshot(
          doc(db, "users", currentUser.uid), 
          (snap) => {
            if (!snap.exists()) {
              // Se o documento não existe, verificamos se é um cadastro novo (menos de 1 minuto)
              const creationTime = new Date(currentUser.metadata.creationTime || Date.now()).getTime();
              const isNewUser = Date.now() - creationTime < 60000;
              
              if (!isNewUser) {
                console.warn("🚨 CONTA INEXISTENTE NO BANCO: KICK AUTOMÁTICO.");
                signOut(auth);
                setUser(null);
              }
            }
          },
          (error) => console.error("Erro de permissão no perfil (Kick):", error)
        );
      } else {
        setUser(null);
        if (unsubscribeUserDoc) unsubscribeUserDoc();
      }
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
    };
  }, []);

  const loginWithGoogle = async () => {
    try {
      const { getAdditionalUserInfo } = await import("firebase/auth");
      const result = await signInWithPopup(auth, googleProvider);
      const currentUser = result.user;
      const details = getAdditionalUserInfo(result);
      
      const { doc, setDoc, updateDoc } = await import("firebase/firestore");
      
      if (details?.isNewUser) {
        // Apenas recria o documento no banco se for um cadastro NOVO e Genuíno.
        await setDoc(doc(db, "users", currentUser.uid), {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          lastLogin: Date.now()
        });
      } else {
        // Se já existia, só atualiza o lastLogin. Se o documento foi deletado por um admin, 
        // isso vai falhar e o usuário NÃO será recriado, travando-o na tela de Acesso Negado.
        try {
          await updateDoc(doc(db, "users", currentUser.uid), {
            lastLogin: Date.now()
          });
        } catch (e) {
          console.warn("Usuário banido tentou fazer login. Bloqueado pelo Firestore Rules.");
        }
      }
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
