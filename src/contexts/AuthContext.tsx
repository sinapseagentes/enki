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
      
      const { doc, updateDoc, writeBatch } = await import("firebase/firestore");
      
      if (details?.isNewUser) {
        // Apenas recria o documento no banco se for um cadastro NOVO e Genuíno.
        const batch = writeBatch(db);
        
        // 1. Dados Públicos (Acessível a outros membros do board)
        batch.set(doc(db, "users", currentUser.uid), {
          uid: currentUser.uid,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          lastLogin: Date.now()
        });
        
        // 2. Dados Privados (Acessível apenas ao dono)
        batch.set(doc(db, "userPrivate", currentUser.uid), {
          email: currentUser.email,
          storageMetrics: { totalBytes: 0 },
          role: 'user'
        });
        
        // 3. Lookup de E-mail (Acessível para busca exata via inviteUserToBoard)
        if (currentUser.email) {
          batch.set(doc(db, "userLookup", currentUser.email.toLowerCase()), {
            uid: currentUser.uid
          });
        }
        
        await batch.commit();
      } else {
        // Usuário já existente: migra dados sensíveis para userPrivate (se ainda não migrado)
        // e garante que userLookup existe
        try {
          const { getDoc, deleteField } = await import("firebase/firestore");
          
          const userDocRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userDocRef);
          
          if (userSnap.exists()) {
            const userData = userSnap.data();
            const needsMigration = userData.email !== undefined || userData.storageMetrics !== undefined;
            
            if (needsMigration) {
              const migrationBatch = writeBatch(db);
              
              // Remove campos sensíveis do documento público
              migrationBatch.update(userDocRef, {
                email: deleteField(),
                storageMetrics: deleteField(),
                role: deleteField(),
                storageLimit: deleteField(),
                lastLogin: Date.now()
              });
              
              // Garante que userPrivate existe com os dados corretos
              const privateRef = doc(db, "userPrivate", currentUser.uid);
              migrationBatch.set(privateRef, {
                email: currentUser.email,
                storageMetrics: userData.storageMetrics || { totalBytes: 0 },
                role: userData.role || 'user'
              }, { merge: true });
              
              // Garante que userLookup existe
              if (currentUser.email) {
                const lookupRef = doc(db, "userLookup", currentUser.email.toLowerCase());
                migrationBatch.set(lookupRef, { uid: currentUser.uid }, { merge: true });
              }
              
              await migrationBatch.commit();
              console.log("✅ Migração de dados privados concluída.");
            } else {
              // Já migrado: só atualiza o lastLogin
              await updateDoc(userDocRef, { lastLogin: Date.now() });
            }
          }
        } catch (e) {
          console.warn("Usuário banido ou erro de migração:", e);
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
