import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Board, UserProfile } from "../types";

interface StorageDashboardProps {
  boards: Board[]; // Boards the user is a member of
}

export const StorageDashboard = ({ boards }: StorageDashboardProps) => {
  const { user } = useAuth();
  const { theme, scribeMode } = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // We fetch the user's profile to get their total storage usage across the platform
  useEffect(() => {
    if (!user) return;
    
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const userQuery = query(collection(db, "users"), where("uid", "==", user.uid));
        const userSnap = await getDocs(userQuery);
        if (!userSnap.empty) {
          setUserProfile(userSnap.docs[0].data() as UserProfile);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const formatBytes = (bytes: number = 0) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // User's total contribution across all these boards
  const userTotalBytes = userProfile?.storageMetrics?.totalBytes || 0;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Global User Metric */}
      <div className={`mb-8 p-6 rounded-2xl shadow-lg border ${scribeMode ? 'bg-amber-100/50 border-amber-200' : 'bg-white border-blue-100'}`}>
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-full ${scribeMode ? 'bg-amber-200 text-amber-800' : 'bg-blue-100 text-blue-600'}`}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
          </div>
          <div>
            <h2 className={`text-sm font-bold uppercase tracking-wider ${scribeMode ? 'text-amber-800' : 'text-blue-600'}`}>
              {scribeMode ? 'Seu Tesouro Acumulado' : 'Seu Armazenamento Total'}
            </h2>
            <p className={`text-4xl font-extrabold ${scribeMode ? 'text-theme-main' : 'text-gray-900'}`}>
              {formatBytes(userTotalBytes)}
            </p>
          </div>
        </div>
      </div>

      {/* Boards Storage Breakdown */}
      <h3 className={`text-xl font-bold mb-4 ${scribeMode ? 'text-theme-main' : 'text-white'}`}>
        {scribeMode ? 'Peso por Tábua' : 'Consumo por Quadro'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {boards.length === 0 && (
          <p className="text-white/60 italic">Nenhum dado encontrado.</p>
        )}
        {boards.map(board => {
          const boardTotal = board.storageMetrics?.totalBytes || 0;
          const userContribution = board.storageMetrics?.byUser?.[user?.uid || ""] || 0;
          const percentage = boardTotal > 0 ? Math.round((userContribution / boardTotal) * 100) : 0;

          return (
            <div key={board.id} className={`p-5 rounded-xl shadow-md border relative overflow-hidden ${scribeMode ? 'bg-theme-surface border-theme' : (theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200')}`}>
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              
              <h4 className={`font-bold text-lg mb-1 truncate relative z-10 ${scribeMode ? 'text-theme-main' : 'text-gray-800'}`}>
                {board.title}
              </h4>
              <p className="text-xs text-gray-500 mb-4 relative z-10">
                Total do Quadro: <strong>{formatBytes(boardTotal)}</strong>
              </p>

              <div className="relative z-10 bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex justify-between items-end mb-1">
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">Sua Parte</span>
                  <span className="font-bold text-blue-600">{formatBytes(userContribution)}</span>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                </div>
                <p className="text-[10px] text-right text-gray-400 mt-1">{percentage}% do total do quadro</p>
              </div>

              {userContribution > 0 && (
                <BoardStorageDetails boardId={board.id!} userId={user?.uid!} formatBytes={formatBytes} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Subcomponent to load and display list and card breakdown
const BoardStorageDetails = ({ boardId, userId, formatBytes }: { boardId: string, userId: string, formatBytes: (b: number) => string }) => {
  const [lists, setLists] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const listsQuery = query(collection(db, "lists"), where("boardId", "==", boardId));
        const cardsQuery = query(collection(db, "cards"), where("boardId", "==", boardId));
        
        const [listsSnap, cardsSnap] = await Promise.all([getDocs(listsQuery), getDocs(cardsQuery)]);
        
        const loadedLists = listsSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(l => (l as any).storageMetrics?.byUser?.[userId] > 0);
        const loadedCards = cardsSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(c => (c as any).storageMetrics?.byUser?.[userId] > 0);
        
        setLists(loadedLists);
        setCards(loadedCards);
      } catch (error) {
        console.error("Error fetching board details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [expanded, boardId, userId]);

  if (!expanded) {
    return (
      <button onClick={() => setExpanded(true)} className="mt-4 w-full text-xs text-blue-600 hover:text-blue-800 font-medium py-1 bg-blue-50 hover:bg-blue-100 rounded transition-colors relative z-10">
        Ver Detalhes por Lista e Cartão
      </button>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-100 relative z-10">
      <div className="flex justify-between items-center mb-2">
        <h5 className="text-xs font-bold text-gray-700 uppercase">Detalhamento</h5>
        <button onClick={() => setExpanded(false)} className="text-[10px] text-gray-400 hover:text-gray-600">Ocultar</button>
      </div>

      {loading ? (
        <p className="text-xs text-gray-400 italic text-center py-2">Carregando...</p>
      ) : (
        <div className="space-y-3 max-h-48 overflow-y-auto pr-1 text-sm custom-scrollbar">
          {lists.length === 0 && cards.length === 0 && (
            <p className="text-xs text-gray-400 italic">Nenhum consumo específico encontrado.</p>
          )}
          {lists.map(list => {
            const listUserBytes = list.storageMetrics?.byUser?.[userId] || 0;
            const listCards = cards.filter(c => c.listId === list.id);
            return (
              <div key={list.id} className="bg-white/50 rounded p-2 border border-gray-50">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-gray-800 truncate pr-2">{list.title}</span>
                  <span className="text-xs text-blue-600 font-bold whitespace-nowrap">{formatBytes(listUserBytes)}</span>
                </div>
                {listCards.length > 0 && (
                  <div className="pl-2 border-l-2 border-blue-200 mt-1 space-y-1">
                    {listCards.map(card => {
                      const cardUserBytes = card.storageMetrics?.byUser?.[userId] || 0;
                      return (
                        <div key={card.id} className="flex justify-between items-center text-xs">
                          <span className="text-gray-600 truncate pr-2" title={card.title}>{card.title}</span>
                          <span className="text-gray-500 whitespace-nowrap">{formatBytes(cardUserBytes)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

