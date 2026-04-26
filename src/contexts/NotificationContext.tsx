import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { subscribeToNotifications, markAsRead } from "../services/notificationService";

type NotificationType = "success" | "error" | "info" | "warning";

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextData {
  showNotification: (message: string, type?: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextData>({} as NotificationContextData);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const lastNotifCount = useRef(0);

  const removeNotification = useCallback((id: string) => {
    setNotifications((state) => state.filter((n) => n.id !== id));
  }, []);

  const showNotification = useCallback((message: string, type: NotificationType = "success") => {
    const id = crypto.randomUUID();
    const newNotification = { id, message, type };

    setNotifications((state) => [...state, newNotification]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 4000);
  }, [removeNotification]);

  // Listen to Firestore Notifications (Cross-User)
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToNotifications(user.uid, (firestoreNotifs) => {
      // If we have more notifications than before, show toast for the newest ones
      if (firestoreNotifs.length > lastNotifCount.current) {
        const newest = firestoreNotifs[0];
        if (newest && (Date.now() - newest.createdAt < 10000)) { // Only if recent
          showNotification(`${newest.senderName}: ${newest.message}`, "info");
          // Mark as read after showing toast? Or keep for the notification center?
          // Let's mark as read for now to not repeat, or we could have a "bell" UI later.
          markAsRead(newest.id!);
        }
      }
      lastNotifCount.current = firestoreNotifs.length;
    });

    return () => unsubscribe();
  }, [user, showNotification]);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      
      {/* Toast UI Portal-like Container */}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
        {notifications.map((n) => (
          <div 
            key={n.id}
            className={`pointer-events-auto min-w-[200px] px-4 py-3 rounded-lg shadow-2xl text-white text-sm font-medium flex items-center gap-3 animate-in slide-in-from-right duration-300 ${
              n.type === "success" ? "bg-green-600" : 
              n.type === "error" ? "bg-red-600" : 
              n.type === "warning" ? "bg-orange-500" : "bg-blue-600"
            }`}
          >
            {n.type === "success" && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
            {n.type === "error" && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            {n.message}
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
