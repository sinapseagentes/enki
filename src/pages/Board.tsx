import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { subscribeToLists, createList } from "../services/listService";
import { subscribeToCards, createCard } from "../services/cardService";
import { subscribeToBoard, getMembersProfile, updateBoardBackground } from "../services/boardService";
import { logActivity } from "../services/activityService";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { ListContainer } from "../components/ListContainer";
import { CardModal } from "../components/CardModal";
import { InviteModal } from "../components/InviteModal";
import { CommandCenter } from "../components/CommandCenter";
import { COLORS, GRADIENTS } from "../constants/design";
import type { List, Card, Board } from "../types";

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
  const [showCommandCenter, setShowCommandCenter] = useState(false);
  const [commandCenterTab, setCommandCenterTab] = useState<"activities" | "notifications">("activities");
  const [showBgMenu, setShowBgMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLabel, setFilterLabel] = useState<string | null>(null);
  const [filterMember, setFilterMember] = useState<string | null>(null);
  const [filterDateStatus, setFilterDateStatus] = useState<"overdue" | "today" | null>(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

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

    // Usar writeBatch do Firestore para evitar disparar múltiplos snapshots
    const { writeBatch, doc } = await import("firebase/firestore");
    const { db } = await import("../lib/firebase");
    const batch = writeBatch(db);

    if (type === "list") {
      const newLists = [...lists].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const [movedList] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, movedList);
      
      // Update local state optimistically
      setLists(newLists.map((l, i) => ({ ...l, order: i })));

      try {
        newLists.forEach((list, index) => {
          const listRef = doc(db, "lists", list.id!);
          batch.update(listRef, { order: index });
        });
        await batch.commit();
      } catch (error) {
        console.error("Error updating lists batch:", error);
      }
      return;
    }

    if (type === "card") {
      const sourceListId = source.droppableId;
      const destinationListId = destination.droppableId;

      if (sourceListId === destinationListId) {
        const listCards = cards
          .filter(c => c.listId === sourceListId)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        
        const [movedCard] = listCards.splice(source.index, 1);
        listCards.splice(destination.index, 0, movedCard);
        
        // Optimistic update
        const updatedCards = cards.map(c => {
          if (c.listId === sourceListId) {
            const newIndex = listCards.findIndex(lc => lc.id === c.id);
            if (newIndex !== -1) return { ...c, order: newIndex };
          }
          return c;
        });
        setCards(updatedCards);

        try {
          listCards.forEach((c, idx) => {
            const cardRef = doc(db, "cards", c.id!);
            batch.update(cardRef, { order: idx });
          });
          await batch.commit();
        } catch (error) {
          console.error("Error updating cards batch:", error);
        }
      } else {
        const sourceListCards = cards
          .filter(c => c.listId === sourceListId)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        const destListCards = cards
          .filter(c => c.listId === destinationListId)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        
        const [movedCard] = sourceListCards.splice(source.index, 1);
        const updatedMovedCard = { ...movedCard, listId: destinationListId };
        destListCards.splice(destination.index, 0, updatedMovedCard);
        
        // Optimistic update
        const updatedCards = cards.map(c => {
          if (c.id === draggableId) return { ...updatedMovedCard, order: destination.index };
          if (c.listId === sourceListId) {
            const newIndex = sourceListCards.findIndex(lc => lc.id === c.id);
            return newIndex !== -1 ? { ...c, order: newIndex } : c;
          }
          if (c.listId === destinationListId) {
            const newIndex = destListCards.findIndex(lc => lc.id === c.id);
            return newIndex !== -1 ? { ...c, order: newIndex } : c;
          }
          return c;
        });
        setCards(updatedCards);

        try {
          sourceListCards.forEach((c, idx) => {
            const cardRef = doc(db, "cards", c.id!);
            batch.update(cardRef, { order: idx });
          });
          destListCards.forEach((c, idx) => {
            const cardRef = doc(db, "cards", c.id!);
            batch.update(cardRef, { order: idx, listId: destinationListId });
          });
          await batch.commit();
          
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
          console.error("Error updating cross-list batch:", error);
        }
      }
    }
  }, [lists, cards, boardId, user]);

  const currentBg = board?.background || "from-blue-600 to-blue-800";
  const isGradient = currentBg.startsWith("from-");

  // Filter Logic
  const getFilteredCards = (listId: string) => {
    return cards
      .filter(c => c.listId === listId)
      .map(card => {
        const matchesText = card.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (card.description?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesLabel = !filterLabel || card.colorLabel === filterLabel;
        const matchesMember = !filterMember || card.title.includes(`@${members.find(m => m.uid === filterMember)?.displayName}`); 
        
        const isCardOverdue = card.dueDate ? card.dueDate < Date.now() : false;
        const isCardToday = card.dueDate ? new Date(card.dueDate).toDateString() === new Date().toDateString() : false;
        
        const matchesDate = !filterDateStatus || 
                           (filterDateStatus === "overdue" && isCardOverdue) ||
                           (filterDateStatus === "today" && isCardToday);
        
        return {
          ...card,
          isFilteredOut: !(matchesText && matchesLabel && matchesMember && matchesDate)
        };
      });
  };

  return (
    <div 
      className={`h-screen flex flex-col transition-all duration-500 ${theme === 'dark' ? 'bg-theme-page' : (isGradient ? `bg-gradient-to-br ${currentBg}` : '')}`}
      style={!isGradient && theme !== 'dark' ? { backgroundColor: currentBg } : {}}
    >
      <nav className={`relative z-50 ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-black/20'} backdrop-blur-md px-4 py-3 flex justify-between items-center text-white shrink-0 border-b border-white/10 shadow-lg`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/")}
            className="hover:bg-white/20 p-1.5 rounded transition-colors"
            title="Voltar ao Dashboard"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <h1 className="font-bold text-lg hidden lg:block truncate max-w-[150px]">
            {board?.title || "Carregando..."}
          </h1>

          {/* Board Search Bar */}
          <div className="relative group ml-2">
            <input 
              type="text"
              placeholder="Buscar cartões..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-40 sm:w-64 bg-white/10 hover:bg-white/20 focus:bg-white text-white focus:text-gray-900 border border-white/20 focus:border-blue-500 rounded-lg pl-9 pr-3 py-1.5 transition-all outline-none text-sm placeholder-white/60 focus:placeholder-gray-400"
            />
            <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                filterLabel || searchTerm || filterMember || filterDateStatus ? "bg-yellow-400 text-yellow-900 shadow-lg" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              <span className="hidden sm:inline">Filtro</span>
              {(filterLabel || searchTerm || filterMember || filterDateStatus) && <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />}
            </button>

            {showFilterMenu && (
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-[100] p-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-gray-800 font-bold text-sm">Filtros Ativos</h4>
                  {(filterLabel || searchTerm || filterMember || filterDateStatus) && (
                    <button 
                      onClick={() => { 
                        setFilterLabel(null); 
                        setSearchTerm(""); 
                        setFilterMember(null);
                        setFilterDateStatus(null);
                      }}
                      className="text-[10px] text-blue-600 hover:underline font-bold"
                    >
                      Limpar Tudo
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Etiquetas</span>
                    <div className="grid grid-cols-4 gap-2">
                      {COLORS.map(c => (
                        <button 
                          key={c.value}
                          onClick={() => setFilterLabel(filterLabel === c.value ? null : c.value)}
                          className={`h-6 rounded border-2 transition-all ${filterLabel === c.value ? 'border-blue-600 scale-110 shadow-md' : 'border-transparent hover:scale-105'}`}
                          style={{ backgroundColor: c.value }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Membros</span>
                    <div className="flex flex-wrap gap-2">
                      {members.map(member => (
                        <button
                          key={member.uid}
                          onClick={() => setFilterMember(filterMember === member.uid ? null : member.uid)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${filterMember === member.uid ? 'border-blue-600 scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                          title={member.displayName}
                        >
                          {member.photoURL ? (
                            <img src={member.photoURL} alt={member.displayName} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-600 font-bold uppercase">
                              {member.displayName?.charAt(0)}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Data de Entrega</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setFilterDateStatus(filterDateStatus === "overdue" ? null : "overdue")}
                        className={`text-xs px-3 py-1 rounded-full border transition-all ${filterDateStatus === "overdue" ? 'bg-red-100 border-red-500 text-red-700 font-bold' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                      >
                        Atrasados
                      </button>
                      <button 
                        onClick={() => setFilterDateStatus(filterDateStatus === "today" ? null : "today")}
                        className={`text-xs px-3 py-1 rounded-full border transition-all ${filterDateStatus === "today" ? 'bg-yellow-100 border-yellow-500 text-yellow-700 font-bold' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                      >
                        Vence Hoje
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex -space-x-2 ml-2 hidden sm:flex">
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
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all active-shrink"
            title={theme === "light" ? "Mudar para Dark Mode" : "Mudar para Light Mode"}
          >
            {theme === "light" ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 18v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            )}
          </button>
          
          <button 
            onClick={() => { setCommandCenterTab("notifications"); setShowCommandCenter(true); }}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all relative active-shrink"
            title="Notificações"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </button>

          <button 
            onClick={() => { setCommandCenterTab("activities"); setShowCommandCenter(true); }}
            className={`p-2 rounded-full transition-all active-shrink ${showCommandCenter && commandCenterTab === 'activities' ? "bg-white text-blue-600" : "text-white/80 hover:text-white hover:bg-white/10"}`}
            title="Histórico de Atividades"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowBgMenu(!showBgMenu)}
              className={`p-2 rounded-full transition-all ${showBgMenu ? "bg-white text-blue-600" : "text-white/80 hover:text-white hover:bg-white/10"}`}
              title="Mudar Fundo"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </button>

            {showBgMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-[100] p-4 animate-in fade-in zoom-in-95 duration-200">
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
              onClick={() => { setCommandCenterTab("activities"); setShowCommandCenter(true); }}
              className={`p-2 rounded-full transition-all active-shrink ${showCommandCenter && commandCenterTab === 'activities' ? "bg-white text-blue-600" : "text-white/80 hover:text-white hover:bg-white/10"}`}
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
                    cards={getFilteredCards(list.id!)} 
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

      {showCommandCenter && boardId && (
        <CommandCenter 
          boardId={boardId} 
          initialTab={commandCenterTab}
          onClose={() => setShowCommandCenter(false)} 
        />
      )}
    </div>
  );
};
