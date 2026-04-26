import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  updateDoc,
  doc,
  limit 
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { AppNotification } from "../types";

/**
 * Envia uma notificação para um usuário específico
 */
export const sendNotification = async (notification: Omit<AppNotification, "id" | "read" | "createdAt">) => {
  await addDoc(collection(db, "notifications"), {
    ...notification,
    read: false,
    createdAt: Date.now(),
  });
};

/**
 * Escuta notificações novas para o usuário logado
 */
export const subscribeToNotifications = (userId: string, callback: (notifications: AppNotification[]) => void) => {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    where("read", "==", false),
    orderBy("createdAt", "desc"),
    limit(10)
  );

  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AppNotification));
    callback(notifications);
  });
};

/**
 * Marca uma notificação como lida
 */
export const markAsRead = async (notificationId: string) => {
  const docRef = doc(db, "notifications", notificationId);
  await updateDoc(docRef, { read: true });
};
