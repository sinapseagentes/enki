import { useState, useEffect, useRef } from "react";
import { subscribeToActivities } from "../services/activityService";
import { subscribeToNotifications, markNotificationAsRead } from "../services/notificationService";
import { subscribeToMessages, sendMessage } from "../services/messageService";
import { subscribeToPresence, isUserOnline } from "../services/presenceService";
import { useAuth } from "../contexts/AuthContext";
import type { Activity, AppNotification, Message, UserProfile } from "../types";

interface CommandCenterProps {
  boardId: string;
  members: UserProfile[];
  initialTab?: "activities" | "notifications" | "messages";
  onClose: () => void;
  scribeMode?: boolean;
}

export const CommandCenter = ({ boardId, members, initialTab = "activities", onClose, scribeMode }: CommandCenterProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"activities" | "notifications" | "messages">(initialTab);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<UserProfile | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [presenceMap, setPresenceMap] = useState<Record<string, any>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (user && selectedRecipient && activeTab === "messages") {
      const unsubscribeMessages = subscribeToMessages(user.uid, selectedRecipient.uid, (fetched) => {
        setMessages(fetched);
      });
      return () => unsubscribeMessages();
    }
  }, [user, selectedRecipient, activeTab]);

  useEffect(() => {
    if (members && members.length > 0) {
      const memberIds = members.map(m => m.uid);
      const unsubscribePresence = subscribeToPresence(memberIds, (profiles) => {
        setPresenceMap(profiles);
      });
      return () => unsubscribePresence();
    }
  }, [members]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedRecipient || !newMessage.trim()) return;

    const messageData = {
      senderId: user.uid,
      senderName: user.displayName || "Usuário",
      receiverId: selectedRecipient.uid,
      text: newMessage.trim(),
    };

    try {
      await sendMessage(messageData);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

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
            <h2 className="font-extrabold text-gray-800 text-sm tracking-tight uppercase">
              {scribeMode ? "Palácio Admin de Ur" : "Centro de Comando"}
            </h2>
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
              {scribeMode ? "Crônicas" : "Atividades"}
            </button>
            <button 
              onClick={() => setActiveTab("notifications")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all relative ${activeTab === 'notifications' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              {scribeMode ? "Decretos" : "Notificações"}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 text-white text-[10px] items-center justify-center">{unreadCount}</span>
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab("messages")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-md transition-all ${activeTab === 'messages' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
              {scribeMode ? "Escribas" : "Mensagens"}
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 custom-scrollbar">
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
          ) : activeTab === "notifications" ? (
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
          ) : (
            <div className="h-full flex flex-col animate-in fade-in slide-in-from-bottom-2 duration-300">
              {!selectedRecipient ? (
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Membros do Tabuleiro</p>
                  {members
                    .filter(m => m.uid !== user?.uid)
                    .map(member => (
                      <button
                        key={member.uid}
                        onClick={() => setSelectedRecipient(member)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50 hover:border-blue-200 transition-all text-left"
                      >
                        <div className="relative">
                          {member.photoURL ? (
                            <img src={member.photoURL} className="w-10 h-10 rounded-full object-cover" alt="" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase">
                              {member.displayName.charAt(0)}
                            </div>
                          )}
                          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${isUserOnline(presenceMap[member.uid]?.lastSeen, presenceMap[member.uid]?.isOnline) ? 'bg-green-500' : 'bg-gray-400'}`} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{member.displayName}</p>
                          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Clique para conversar</p>
                        </div>
                      </button>
                    ))}
                  {members.filter(m => m.uid !== user?.uid).length === 0 && (
                    <p className="text-center text-gray-400 italic text-sm py-20">Você está sozinho nesta tábua.</p>
                  )}
                </div>
              ) : (
                <div className="flex flex-col h-full">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                    <button onClick={() => setSelectedRecipient(null)} className="p-1 hover:bg-gray-100 rounded-full">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-bold uppercase">
                        {selectedRecipient.displayName.charAt(0)}
                      </div>
                      <span className="text-sm font-bold text-gray-800">{selectedRecipient.displayName}</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 mb-4">
                    {messages.length === 0 ? (
                      <p className="text-center text-gray-400 italic text-xs py-10">Inicie uma conversa sagrada...</p>
                    ) : (
                      messages.map(msg => (
                        <div key={msg.id} className={`flex flex-col ${msg.senderId === user?.uid ? 'items-end' : 'items-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.senderId === user?.uid ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                            {msg.text}
                          </div>
                          <span className="text-[8px] text-gray-400 mt-1 uppercase font-bold">{formatTime(msg.createdAt)}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleSendMessage} className="mt-auto flex gap-2 pt-2 border-t border-gray-100">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={scribeMode ? "Inscreva sua vontade..." : "Digite sua mensagem..."}
                      className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md active-shrink"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                  </form>
                </div>
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
