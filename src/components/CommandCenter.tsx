import { useState, useEffect } from "react";
import { subscribeToActivities } from "../services/activityService";
import { subscribeToNotifications, markNotificationAsRead } from "../services/notificationService";
import { useAuth } from "../contexts/AuthContext";
import type { Activity, AppNotification } from "../types";

interface CommandCenterProps {
  boardId: string;
  initialTab?: "activities" | "notifications";
  onClose: () => void;
}

export const CommandCenter = ({ boardId, initialTab = "activities", onClose }: CommandCenterProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"activities" | "notifications">(initialTab);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    const unsubscribeActivities = subscribeToActivities(boardId, (fetched) => {
      setActivities(fetched);
    });

    let unsubscribeNotifications = () => {};
    if (user) {
      unsubscribeNotifications = subscribeToNotifications(user.uid, (fetched) => {
        setNotifications(fetched);
      });
    }

    return () => {
      unsubscribeActivities();
      unsubscribeNotifications();
    };
  }, [boardId, user]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', { 
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
    });
  };

  const renderActivityMessage = (activity: Activity) => {
    const { type, details, userName } = activity;
    switch (type) {
      case "card_created":
        return <span><strong>{userName}</strong> criou <strong>"{details.cardTitle}"</strong></span>;
      case "card_moved":
        return <span><strong>{userName}</strong> moveu <strong>"{details.cardTitle}"</strong> para <em>{details.toList}</em></span>;
      case "list_created":
        return <span><strong>{userName}</strong> criou a lista <strong>"{details.listTitle}"</strong></span>;
      case "card_archived":
        return <span><strong>{userName}</strong> arquivou <strong>"{details.cardTitle}"</strong></span>;
      default:
        return <span>{userName} realizou uma ação.</span>;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {/* Backdrop for Glass Effect */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[55] animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 w-85 sm:w-96 bg-white/90 backdrop-blur-xl shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-[60] flex flex-col border-l border-white/20 animate-in slide-in-from-right duration-500">
        
        {/* Header with Tabs */}
        <div className="p-2 border-b border-gray-100 flex flex-col bg-white/50">
          <div className="flex justify-between items-center px-2 py-1 mb-2">
            <h2 className="font-extrabold text-gray-800 text-sm tracking-tight uppercase">Centro de Comando</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-full transition-all active-shrink">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex bg-gray-100/50 p-1 rounded-lg gap-1">
            <button 
              onClick={() => setActiveTab("activities")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'activities' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Atividades
            </button>
            <button 
              onClick={() => setActiveTab("notifications")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all relative ${activeTab === 'notifications' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              Notificações
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 text-white text-[10px] items-center justify-center">{unreadCount}</span>
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {activeTab === "activities" ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {activities.length === 0 ? (
                <p className="text-center text-gray-400 italic text-sm py-20">Nenhuma atividade recente.</p>
              ) : (
                activities.map((activity) => (
                  <div key={activity.id} className="flex gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600 font-bold text-xs uppercase shadow-sm">
                      {activity.userName.charAt(0)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm text-gray-700 leading-snug">
                        {renderActivityMessage(activity)}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                        {formatTime(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {notifications.length === 0 ? (
                <p className="text-center text-gray-400 italic text-sm py-20">Tudo limpo por aqui! 🎉</p>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => n.id && markNotificationAsRead(n.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${n.read ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-blue-50 border-blue-100 shadow-sm'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{n.senderName}</span>
                      {!n.read && <span className="w-2 h-2 bg-blue-600 rounded-full" />}
                    </div>
                    <p className="text-sm text-gray-800 font-medium">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-2">{formatTime(n.createdAt)}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <p className="text-[10px] text-gray-400 text-center font-medium uppercase tracking-widest">Enki Premium v0.8.0.0</p>
        </div>
      </div>
    </>
  );
};
