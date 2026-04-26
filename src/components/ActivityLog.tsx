import { useState, useEffect } from "react";
import { subscribeToActivities } from "../services/activityService";
import type { Activity } from "../types";

interface ActivityLogProps {
  boardId: string;
  onClose: () => void;
}

export const ActivityLog = ({ boardId, onClose }: ActivityLogProps) => {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToActivities(boardId, (fetched) => {
      setActivities(fetched);
    });
    return () => unsubscribe();
  }, [boardId]);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const renderActivityMessage = (activity: Activity) => {
    const { type, details, userName } = activity;
    
    switch (type) {
      case "card_created":
        return (
          <span>
            <strong className="text-gray-900">{userName}</strong> criou o cartão <strong className="text-blue-600">"{details.cardTitle}"</strong>
          </span>
        );
      case "card_moved":
        return (
          <span>
            <strong className="text-gray-900">{userName}</strong> moveu <strong className="text-blue-600">"{details.cardTitle}"</strong> de <span className="text-gray-500">{details.fromList}</span> para <span className="text-gray-500">{details.toList}</span>
          </span>
        );
      case "list_created":
        return (
          <span>
            <strong className="text-gray-900">{userName}</strong> criou a lista <strong className="text-gray-900">"{details.listTitle}"</strong>
          </span>
        );
      case "card_archived":
        return (
          <span>
            <strong className="text-gray-900">{userName}</strong> arquivou o cartão <strong className="text-gray-900">"{details.cardTitle}"</strong>
          </span>
        );
      default:
        return <span>{userName} realizou uma ação.</span>;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl z-[60] flex flex-col border-l border-gray-200 animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h2 className="font-bold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Atividades
        </h2>
        <button 
          onClick={onClose}
          className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-400"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activities.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm italic">Nenhuma atividade recente.</p>
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600 font-bold text-xs uppercase">
                {activity.userName.charAt(0)}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm text-gray-700 leading-snug">
                  {renderActivityMessage(activity)}
                </p>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tighter">
                  {formatTime(activity.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
