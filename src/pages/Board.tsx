import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { subscribeToLists, createList, updateListOrder } from "../services/listService";
import { subscribeToCards, createCard, updateCard } from "../services/cardService";
import { subscribeToBoard, getMembersProfile, updateBoardBackground } from "../services/boardService";
import { logActivity } from "../services/activityService";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { ListContainer } from "../components/ListContainer";
import { CardModal } from "../components/CardModal";
import { InviteModal } from "../components/InviteModal";
import { ActivityLog } from "../components/ActivityLog";
import { NotificationBell } from "../components/NotificationBell";
import type { List, Card, Board } from "../types";

const COLORS = [
  { name: "Azul Ollert", value: "#0079bf" },
  { name: "Verde", value: "#4ade80" },
  { name: "Laranja", value: "#fb923c" },
  { name: "Vermelho", value: "#f87171" },
  { name: "Roxo", value: "#c084fc" },
  { name: "Rosa", value: "#f472b6" },
  { name: "Ciano", value: "#22d3ee" },
  { name: "Cinza", value: "#a8a29e" },
];

const GRADIENTS = [
  { name: "Classic Blue", value: "from-blue-600 to-blue-800" },
  { name: "Midnight", value: "from-slate-800 to-slate-900" },
  { name: "Sunset", value: "from-orange-500 to-red-600" },
  { name: "Ocean", value: "from-cyan-500 to-blue-600" },
  { name: "Forest", value: "from-emerald-500 to-teal-700" },
  { name: "Purple Rain", value: "from-purple-600 to-indigo-800" },
  { name: "Royal", value: "from-rose-500 to-indigo-700" },
];

export const BoardPage = () => {
  const { id: boardId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [board, setBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [showActivities, setShowActivities] = useState(false);
  const [showBgMenu, setShowBgMenu] = useState(false);

  useEffect(() => {
    if (!boardId) return;

    const unsubscribeBoard = subscribeToBoard(boardId, (fetchedBoard) => {
      setBoard(fetchedBoard);
    });

    const unsubscribeLists = subscribeToLists(boardId, (fetchedLists) => {
      setLists(fetchedLists);
    });

    const unsubscribeCards = subscribeToCards(boardId, (fetchedCards) => {
      setCards(fetchedCards);
    });

    return () => {
      unsubscribeBoard();
      unsubscribeLists();
      unsubscribeCards();
    };
  }, [boardId]);

  useEffect(() => {
    if (board?.members && board.members.length > 0) {
      getMembersProfile(board.members).then(profiles => {
        setMembers(profiles);
      });
    }
  }, [board?.members]);

  const handleAddList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim() || !boardId) return;
    
    try {
      const order = lists.length;
      await createList(boardId, newListTitle, order);
      
      if (user) {
        await logActivity({
          boardId,
          userId: user.uid,
          userName: user.displayName || "Usuário",
          type: "list_created",
          details: { listTitle: newListTitle }
        });
      }

      setNewListTitle("");
      setIsAddingList(false);
    } catch (error) {
      console.error("Error creating list:", error);
    }
  };

  const handleAddCard = async (listId: string, title: string) => {
    if (!boardId) return;
    try {
      const listCards = cards.filter(c => c.listId === listId);
      const order = listCards.length;
      await createCard(boardId, listId, title, order);

      if (user) {
        await logActivity({
          boardId,
          userId: user.uid,
          userName: user.displayName || "Usuário",
          type: "card_created",
          details: { cardTitle: title }
        });
      }
    } catch (error) {
      console.error("Error creating card:", error);
    }
  };

  const onDragEnd = useCallback(async (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === "list") {
      const newLists = Array.from(lists);
      const [movedList] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, movedList);
      setLists(newLists);

      try {
        await Promise.all(
          newLists.map((list, index) => updateListOrder(list.id!, index))
        );
      } catch (error) {
        console.error("Error updating list order:", error);
      }
      return;
    }

    if (type === "card") {
      const sourceListId = source.droppableId;
      const destinationListId = destination.droppableId;

      const newCards = Array.from(cards);
      const movedCardIndex = newCards.findIndex(c => c.id === draggableId);
      const movedCard = newCards[movedCardIndex];

      if (sourceListId === destinationListId) {
        const listCards = newCards.filter(c => c.listId === sourceListId).sort((a,b) => a.order - b.order);
        listCards.splice(source.index, 1);
        listCards.splice(destination.index, 0, movedCard);
        
        const updatedCards = newCards.map(c => {
          if (c.listId === sourceListId) {
            const newIndex = listCards.findIndex(lc => lc.id === c.id);
            if (newIndex !== -1) return { ...c, order: newIndex };
          }
          return c;
        });
        setCards(updatedCards);

        try {
          await Promise.all(
            listCards.map((c, idx) => updateCard(c.id!, { order: idx }))
          );
        } catch (error) {
          console.error("Error updating cards order:", error);
        }
      } else {
        movedCard.listId = destinationListId;
        
        const sourceListCards = newCards.filter(c => c.listId === sourceListId && c.id !== draggableId).sort((a,b) => a.order - b.order);
        const destListCards = newCards.filter(c => c.listId === destinationListId).sort((a,b) => a.order - b.order);
        
        destListCards.splice(destination.index, 0, movedCard);
        
        const updatedCards = newCards.map(c => {
          if (c.id === movedCard.id) return { ...c, listId: destinationListId, order: destination.index };
          if (c.listId === sourceListId) {
            const newIndex = sourceListCards.findIndex(lc => lc.id === c.id);
            if (newIndex !== -1) return { ...c, order: newIndex };
          }
          if (c.listId === destinationListId) {
            const newIndex = destListCards.findIndex(lc => lc.id === c.id);
            if (newIndex !== -1) return { ...c, order: newIndex };
          }
          return c;
        });
        setCards(updatedCards);

        try {
          await Promise.all([
            ...sourceListCards.map((c, idx) => updateCard(c.id!, { order: idx })),
            ...destListCards.map((c, idx) => updateCard(c.id!, { order: idx, listId: c.id === movedCard.id ? destinationListId : c.listId }))
          ]);

          if (user) {
            const sourceList = lists.find(l => l.id === sourceListId);
            const destList = lists.find(l => l.id === destinationListId);
            await logActivity({
              boardId: boardId!,
              userId: user.uid,
              userName: user.displayName || "Usuário",
              type: "card_moved",
              details: { 
                cardTitle: movedCard.title,
                fromList: sourceList?.title,
                toList: destList?.title
              }
            });
          }
        } catch (error) {
          console.error("Error updating cross-list cards:", error);
        }
      }
    }
  }, [lists, cards, boardId, user]);

  const currentBg = board?.background || "from-blue-600 to-blue-800";
  const isGradient = currentBg.startsWith("from-");

  return (
    <div 
      className={`h-screen flex flex-col transition-all duration-500 ${theme === 'dark' ? 'bg-theme-page' : (isGradient ? `bg-gradient-to-br ${currentBg}` : '')}`}
      style={!isGradient && theme !== 'dark' ? { backgroundColor: currentBg } : {}}
    >
      <nav className={`${theme === 'dark' ? 'bg-slate-900/50' : 'bg-black/20'} backdrop-blur-md px-4 py-3 flex justify-between items-center text-white shrink-0 border-b border-white/10`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/")}
            className="hover:bg-white/20 p-1.5 rounded transition-colors"
            title="Voltar ao Dashboard"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <h1 className="font-bold text-lg hidden sm:block truncate max-w-xs">
            {board?.title || "Carregando..."}
          </h1>
          
          <div className="flex -space-x-2 ml-2">
            {members.map((member, i) => (
              <div 
                key={member.uid} 
                className="relative group"
                style={{ zIndex: members.length - i }}
              >
                {member.photoURL ? (
                  <img 
                    src={member.photoURL} 
                    alt={member.displayName}
                    className="w-8 h-8 rounded-full border-2 border-white/20 object-cover bg-white"
                    title={member.displayName}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-white/20 bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-bold uppercase">
                    {member.displayName?.charAt(0) || "?"}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={toggleTheme}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
            title={theme === "light" ? "Mudar para Dark Mode" : "Mudar para Light Mode"}
          >
            {theme === "light" ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 18v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            )}
          </button>
          
          <NotificationBell />

          <div className="relative">
            <button 
              onClick={() => setShowBgMenu(!showBgMenu)}
              className={`p-2 rounded-full transition-all ${showBgMenu ? "bg-white text-blue-600" : "text-white/80 hover:text-white hover:bg-white/10"}`}
              title="Mudar Fundo"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </button>

            {showBgMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
                <h4 className="text-gray-800 font-bold text-sm mb-3">Plano de Fundo</h4>
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Gradientes Premium</span>
                    <div className="grid grid-cols-2 gap-2">
                      {GRADIENTS.map(g => (
                        <button
                          key={g.value}
                          onClick={() => {
                            updateBoardBackground(boardId!, g.value);
                            setShowBgMenu(false);
                          }}
                          className={`h-12 rounded-lg bg-gradient-to-br ${g.value} border-2 ${board?.background === g.value ? 'border-blue-500 scale-95' : 'border-transparent hover:scale-105'} transition-all`}
                          title={g.name}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Cores Sólidas</span>
                    <div className="grid grid-cols-4 gap-2">
                      {COLORS.map(c => (
                        <button
                          key={c.value}
                          onClick={() => {
                            updateBoardBackground(boardId!, c.value);
                            setShowBgMenu(false);
                          }}
                          className={`h-8 rounded-md border-2 ${board?.background === c.value ? 'border-blue-500 scale-95' : 'border-transparent hover:scale-110'} transition-all`}
                          style={{ backgroundColor: c.value }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => setShowActivities(!showActivities)}
            className={`p-2 rounded-full transition-all ${showActivities ? "bg-white text-blue-600" : "text-white/80 hover:text-white hover:bg-white/10"}`}
            title="Histórico de Atividades"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>
          <button 
            onClick={() => setIsInviting(true)}
            className="bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-md flex items-center gap-2 transition-all"
          >
            Convidar
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="all-lists" direction="horizontal" type="list">
            {(provided) => (
              <div 
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex items-start gap-4 h-full"
              >
                {lists.map((list, index) => (
                  <ListContainer 
                    key={list.id} 
                    list={list} 
                    cards={cards.filter(c => c.listId === list.id)} 
                    index={index}
                    onAddCard={handleAddCard}
                    onCardClick={setActiveCard}
                  />
                ))}
                {provided.placeholder}

                {/* Add List Button */}
                <div className="w-72 shrink-0">
                  {!isAddingList ? (
                    <button
                      onClick={() => setIsAddingList(true)}
                      className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold p-3 rounded-lg flex items-center gap-2 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      Adicionar outra lista
                    </button>
                  ) : (
                    <div className="bg-theme-surface p-3 rounded-lg shadow-xl border border-theme animate-in fade-in slide-in-from-top-2 duration-200">
                      <form onSubmit={handleAddList}>
                        <input
                          autoFocus
                          type="text"
                          placeholder="Insira o título da lista..."
                          value={newListTitle}
                          onChange={(e) => setNewListTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-theme-card text-theme-main border border-theme rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            type="submit"
                            className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-md hover:bg-blue-700 font-semibold shadow-sm transition-all"
                          >
                            Adicionar lista
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsAddingList(false)}
                            className="text-theme-secondary hover:text-theme-main p-1.5 transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </main>

      {/* Modals */}
      {activeCard && (
        <CardModal 
          card={activeCard} 
          board={board || undefined}
          boardMembers={members}
          onClose={() => setActiveCard(null)} 
        />
      )}

      {isInviting && boardId && (
        <InviteModal
          boardId={boardId}
          boardTitle={board?.title || ""}
          onClose={() => setIsInviting(false)}
        />
      )}

      {showActivities && boardId && (
        <ActivityLog 
          boardId={boardId} 
          onClose={() => setShowActivities(false)} 
        />
      )}
    </div>
  );
};
