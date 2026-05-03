import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { subscribeToLists, createList } from "../services/listService";
import { subscribeToCards, createCard } from "../services/cardService";
import { subscribeToBoard, getMembersProfile, updateBoardBackground } from "../services/boardService";
import { logActivity } from "../services/activityService";
import { subscribeToPresence, isUserOnline } from "../services/presenceService";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { ListContainer } from "../components/ListContainer";
import { CardItem } from "../components/CardItem";
import { CardModal } from "../components/CardModal";
import { InviteModal } from "../components/InviteModal";
import { SettingsModal } from "../components/SettingsModal";
import { AutomationModal } from "../components/AutomationModal";
import { CommandCenter } from "../components/CommandCenter";
import { TableView } from "../components/TableView";
import { CalendarView } from "../components/CalendarView";
import type { List, Card, Board, UserProfile } from "../types";
import { COLORS, GRADIENTS } from "../constants/design";

export const BoardPage = () => {
  const { id: boardId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, scribeMode } = useTheme();

  const [board, setBoard] = useState<Board | null>(null);
  const [boardError, setBoardError] = useState<string | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [presenceMap, setPresenceMap] = useState<Record<string, UserProfile>>({});
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [isInviting, setIsInviting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAutomationModal, setShowAutomationModal] = useState(false);
  const [showCommandCenter, setShowCommandCenter] = useState(false);
  const [commandCenterTab, setCommandCenterTab] = useState<"activities" | "notifications">("activities");
  const [showBgMenu, setShowBgMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLabel, setFilterLabel] = useState<string | null>(null);
  const [filterMember, setFilterMember] = useState<string | null>(null);
  const [filterDateStatus, setFilterDateStatus] = useState<"overdue" | "today" | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [filterTagSearch, setFilterTagSearch] = useState("");
  const [showFilterTagDropdown, setShowFilterTagDropdown] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'table' | 'calendar'>('kanban');

  useEffect(() => {
    if (!boardId) return;

    const unsubscribeBoard = subscribeToBoard(
      boardId, 
      (fetchedBoard) => {
        setBoard(fetchedBoard);
        setBoardError(null);
      },
      () => {
        setBoardError("access_denied");
      }
    );

    const unsubscribeLists = subscribeToLists(boardId, (fetchedLists) => {
      if (!isDraggingRef.current) setLists(fetchedLists);
    });

    const unsubscribeCards = subscribeToCards(boardId, (fetchedCards) => {
      if (!isDraggingRef.current) setCards(fetchedCards);
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
        setMembers(profiles as UserProfile[]);
      });
      
      const unsubscribePresence = subscribeToPresence(board.members, (profiles) => {
        setPresenceMap(profiles);
      });
      
      return () => unsubscribePresence();
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
    if (!boardId) {
      alert("Erro: Board não encontrado.");
      return;
    }
    if (!user) {
      alert("Erro: Você precisa estar logado para criar um cartão.");
      return;
    }
    try {
      const listCards = cards.filter(c => c.listId === listId);
      const order = listCards.length;
      await createCard(boardId, listId, title, order, user.uid);

      if (user) {
        await logActivity({
          boardId,
          userId: user.uid,
          userName: user.displayName || "Usuário",
          type: "card_created",
          details: { cardTitle: title }
        });
      }
    } catch (error: unknown) {
      console.error("Error creating card:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      alert(`Falha ao criar o cartão. Motivo: ${errorMessage}`);
    }
  };

  // ═══════════════════════════════════════════
  // DRAG AND DROP — Implementação do Zero v2
  // ═══════════════════════════════════════════
  const isDraggingRef = useRef(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Encontra a lista que contém um cartão
  const findListOfCard = useCallback((cardId: string, currentCards: Card[]) => {
    return currentCards.find(c => c.id === cardId)?.listId;
  }, []);

  const activeDragCard = activeDragId ? cards.find(c => c.id === activeDragId) : null;
  const activeDragList = activeDragId ? lists.find(l => l.id === activeDragId) : null;

  const onDragStart = (event: DragStartEvent) => {
    isDraggingRef.current = true;
    setActiveDragId(event.active.id as string);
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType !== "card") return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Determina a lista destino
    let overListId: string | undefined;
    if (overType === "card") {
      overListId = findListOfCard(overId, cards);
    } else if (overType === "list") {
      overListId = overId;
    }

    const activeListId = findListOfCard(activeId, cards);
    if (!overListId || !activeListId) return;

    // Só atualiza se mudou de lista (cross-list move)
    if (activeListId !== overListId) {
      setCards(prev => {
        const next = prev.map(c =>
          c.id === activeId ? { ...c, listId: overListId! } : c
        );
        return next;
      });
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    setActiveDragId(null);

    const { active, over } = event;
    if (!over) {
      isDraggingRef.current = false;
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;
    const activeType = active.data.current?.type;

    try {
      if (activeType === "list") {
        if (activeId === overId) { isDraggingRef.current = false; return; }
        const oldIdx = lists.findIndex(l => l.id === activeId);
        const newIdx = lists.findIndex(l => l.id === overId);
        if (oldIdx === -1 || newIdx === -1) { isDraggingRef.current = false; return; }

        const reordered = arrayMove(lists, oldIdx, newIdx);
        setLists(reordered); // Optimistic

        const { updateListsOrderBatch } = await import("../services/listService");
        await updateListsOrderBatch(reordered.map((l, i) => ({ id: l.id!, order: i })));
      } else if (activeType === "card") {
        // Pega o estado ATUAL (já com listId atualizado pelo onDragOver)
        const currentCards = [...cards];
        const movedCard = currentCards.find(c => c.id === activeId);
        if (!movedCard) { isDraggingRef.current = false; return; }

        const targetListId = movedCard.listId;

        // Reordena dentro da lista destino
        const listCards = currentCards.filter(c => c.listId === targetListId);
        const activeIdx = listCards.findIndex(c => c.id === activeId);

        if (over.data.current?.type === "card") {
          const overIdx = listCards.findIndex(c => c.id === overId);
          if (overIdx !== -1 && activeIdx !== overIdx) {
            const reordered = arrayMove(listCards, activeIdx, overIdx);
            setCards(prev => {
              const others = prev.filter(c => c.listId !== targetListId);
              return [...others, ...reordered];
            });
            // Persiste atomicamente
            const { updateCardsOrderBatch } = await import("../services/cardService");
            await updateCardsOrderBatch(reordered.map((c, i) => ({ id: c.id!, order: i, listId: targetListId })));
          } else {
            // Mesmo índice ou só mudou de lista sem reordenar
            const { updateCardsOrderBatch } = await import("../services/cardService");
            await updateCardsOrderBatch(listCards.map((c, i) => ({ id: c.id!, order: i, listId: targetListId })));
          }
        } else {
          // Dropped sobre uma lista (não sobre um cartão)
          const { updateCardsOrderBatch } = await import("../services/cardService");
          await updateCardsOrderBatch(listCards.map((c, i) => ({ id: c.id!, order: i, listId: targetListId })));
        }
      }
    } catch (e: any) {
      console.error("Drag persist error:", e);
      if (e?.code === 'permission-denied') {
        alert("Acesso Negado: Você não tem permissão para reorganizar itens.");
      } else {
        alert("Falha ao salvar reorganização.");
      }
      // Rollback: força refresh dos dados do servidor
      window.location.reload();
    } finally {
      isDraggingRef.current = false;
    }
  };

  const currentBg = board?.background || "from-blue-600 to-blue-800";
  const isGradient = currentBg.startsWith("from-");

  // Filter Logic
  const getFilteredCards = (listId?: string) => {
    return cards
      .filter(c => !listId || c.listId === listId)
      .map(card => {
        const matchesText = card.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (card.description?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesLabel = !filterLabel || card.colorLabel === filterLabel;
        const matchesTag = !filterTag || card.tagIds?.includes(filterTag);
        const matchesMember = !filterMember || card.title.includes(`@${members.find(m => m.uid === filterMember)?.displayName}`); 
        
        const isCardOverdue = card.dueDate ? card.dueDate < Date.now() : false;
        const isCardToday = card.dueDate ? new Date(card.dueDate).toDateString() === new Date().toDateString() : false;
        
        const matchesDate = !filterDateStatus || 
                           (filterDateStatus === "overdue" && isCardOverdue) ||
                           (filterDateStatus === "today" && isCardToday);
        
        return {
          ...card,
          isFilteredOut: !(matchesText && matchesLabel && matchesTag && matchesMember && matchesDate)
        };
      });
  };

  const currentUserProfile = members.find(m => m.uid === user?.uid);

  if (boardError === "access_denied") {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50 flex-col gap-4">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-2">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Acesso Negado</h1>
        <p className="text-gray-500 max-w-md text-center">Você não tem permissão para visualizar este quadro. Solicite acesso ao administrador ou retorne ao painel principal.</p>
        <button 
          onClick={() => navigate("/")} 
          className="mt-4 bg-blue-600 hover:bg-blue-700 transition-colors text-white font-bold px-6 py-2 rounded-lg shadow-sm"
        >
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  return (
    <div 
      className={`h-screen flex flex-col transition-all duration-500 ${
        scribeMode 
          ? 'bg-theme-page text-theme-main' 
          : (theme === 'dark' ? 'bg-theme-page' : (isGradient ? `bg-gradient-to-br ${currentBg}` : ''))
      }`}
      style={!scribeMode && !isGradient && theme !== 'dark' ? { backgroundColor: currentBg } : {}}
    >
      <nav className={`relative z-50 ${
        scribeMode 
          ? 'bg-amber-900/40' 
          : (theme === 'dark' ? 'bg-slate-900/50' : 'bg-black/20')
      } backdrop-blur-md px-4 py-3 flex justify-between items-center text-white shrink-0 border-b border-white/10 shadow-lg`}>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/")}
            className="hover:bg-white/20 p-1.5 rounded transition-colors"
            title={scribeMode ? "Voltar ao Centro de Ur" : "Voltar ao Dashboard"}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <h1 className="font-bold text-lg hidden lg:block truncate max-w-[150px]">
            {board?.title || (scribeMode ? "Invocando Escriba..." : "Carregando...")}
          </h1>

          {/* View Switcher (Oráculo) */}
          <div className="flex bg-black/20 backdrop-blur-sm p-1 rounded-lg border border-white/10 ml-2">
            <button 
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded transition-all ${viewMode === 'kanban' ? 'bg-white text-blue-600 shadow-md' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
              title="Quadro Kanban"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 01-2-2h-2a2 2 0 01-2 2" /></svg>
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-all ${viewMode === 'table' ? 'bg-white text-blue-600 shadow-md' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
              title="Visão de Tabela"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </button>
            <button 
              onClick={() => setViewMode('calendar')}
              className={`p-1.5 rounded transition-all ${viewMode === 'calendar' ? 'bg-white text-blue-600 shadow-md' : 'text-white/60 hover:text-white hover:bg-white/10'}`}
              title="Visão de Calendário"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </button>
          </div>

          {/* Board Search Bar */}
          <div className="relative group ml-2">
            <input 
              type="text"
              placeholder={scribeMode ? "Buscar selos de argila..." : "Buscar cartões..."}
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
                filterLabel || searchTerm || filterMember || filterDateStatus || filterTag ? "bg-yellow-400 text-yellow-900 shadow-lg" : "bg-white/10 text-white hover:bg-white/20"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              <span className="hidden sm:inline">{scribeMode ? "Crivo" : "Filtro"}</span>
              {(filterLabel || searchTerm || filterMember || filterDateStatus || filterTag) && <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse" />}
            </button>

            {showFilterMenu && (
              <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-[100] p-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-gray-800 font-bold text-sm">Filtros Ativos</h4>
                  {(filterLabel || searchTerm || filterMember || filterDateStatus || filterTag) && (
                    <button 
                      onClick={() => { 
                        setFilterLabel(null); 
                        setSearchTerm(""); 
                        setFilterMember(null);
                        setFilterDateStatus(null);
                        setFilterTag(null);
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
                    <span className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Sinetes (Tags)</span>
                    
                    {/* Selected Filter Tag */}
                    {filterTag && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {(() => {
                          const tag = board?.tags?.find(t => t.id === filterTag);
                          if (!tag) return null;
                          return (
                            <div 
                              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm"
                              style={{ backgroundColor: tag.color }}
                            >
                              {tag.name}
                              <button onClick={() => setFilterTag(null)} className="hover:bg-black/20 rounded-full p-0.5">
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    )}

                    {/* Tag Search/Picker for Filter */}
                    <div className="relative">
                      <input
                        type="text"
                        value={filterTagSearch}
                        onChange={(e) => {
                          setFilterTagSearch(e.target.value);
                          setShowFilterTagDropdown(true);
                        }}
                        onFocus={() => setShowFilterTagDropdown(true)}
                        placeholder="Filtrar por sinete..."
                        className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-[10px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      
                      {showFilterTagDropdown && board?.tags && (
                        <>
                          <div className="fixed inset-0 z-[110]" onClick={() => setShowFilterTagDropdown(false)}></div>
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 z-[120] max-h-40 overflow-y-auto">
                            {board.tags
                              .filter(tag => 
                                tag.id !== filterTag &&
                                tag.name.toLowerCase().includes(filterTagSearch.toLowerCase())
                              )
                              .map(tag => (
                                <button
                                  key={tag.id}
                                  onClick={() => {
                                    setFilterTag(tag.id);
                                    setFilterTagSearch("");
                                    setShowFilterTagDropdown(false);
                                  }}
                                  className="w-full flex items-center justify-between px-3 py-1.5 hover:bg-gray-50 text-[10px] transition-colors text-left"
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tag.color }}></div>
                                    <span>{tag.name}</span>
                                  </div>
                                </button>
                              ))}
                            {board.tags.filter(tag => tag.id !== filterTag && tag.name.toLowerCase().includes(filterTagSearch.toLowerCase())).length === 0 && (
                              <div className="px-3 py-2 text-center text-[10px] text-gray-400 italic">
                                Nenhum sinete encontrado
                              </div>
                            )}
                          </div>
                        </>
                      )}
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
            {members.map((member, i) => {
              const profileData = presenceMap[member.uid];
              const online = isUserOnline(profileData?.lastSeen, profileData?.isOnline);
              return (
                <div 
                  key={member.uid} 
                  className="relative group cursor-pointer"
                  style={{ zIndex: members.length - i }}
                  onClick={() => navigate(`/profile/${member.uid}`)}
                >
                  {member.photoURL ? (
                    <img 
                      src={member.photoURL} 
                      alt={member.displayName}
                      className={`w-8 h-8 rounded-full border-2 border-white/20 object-cover bg-white transition-transform group-hover:-translate-y-1 ${online ? 'ring-2 ring-green-400 ring-offset-1 ring-offset-transparent' : ''}`}
                      title={`${member.displayName} ${online ? '(Online)' : '(Offline)'}`}
                    />
                  ) : (
                    <div className={`w-8 h-8 rounded-full border-2 border-white/20 bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-bold uppercase transition-transform group-hover:-translate-y-1 ${online ? 'ring-2 ring-green-400 ring-offset-1 ring-offset-transparent' : ''}`} title={`${member.displayName} ${online ? '(Online)' : '(Offline)'}`}>
                      {member.displayName?.charAt(0) || "?"}
                    </div>
                  )}
                  <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white/50 ${online ? 'bg-green-500' : 'bg-gray-400'}`} />
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowAutomationModal(true)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all shadow-lg active-shrink ${
              scribeMode 
                ? "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/40" 
                : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/40"
            }`}
            title={scribeMode ? "Vontade de Enki" : "Automações"}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="hidden md:inline">{scribeMode ? "Vontade de Enki" : "Automações"}</span>
          </button>

          <button 
            onClick={() => setShowSettings(true)}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all active-shrink"
            title="Configurações"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          
          <button 
            onClick={() => { setCommandCenterTab("notifications"); setShowCommandCenter(true); }}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all relative active-shrink"
            title={scribeMode ? "Decretos" : "Notificações"}
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
            onClick={() => setIsInviting(true)}
            className="bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-md flex items-center gap-2 transition-all"
          >
            {scribeMode ? "Convocar" : "Convidar"}
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
        <div className="flex-1 flex overflow-x-auto overflow-y-hidden p-4 items-start gap-4 custom-scrollbar">
          {viewMode === 'kanban' && (
            <>
              <SortableContext
                items={lists.map(l => l.id!)}
                strategy={horizontalListSortingStrategy}
              >
                {lists.map((list) => (
                  <ListContainer 
                    key={list.id} 
                    list={list} 
                    cards={getFilteredCards(list.id!)} 
                    tags={board?.tags}
                    onAddCard={handleAddCard}
                    onCardClick={setActiveCard}
                    currentUserProfile={currentUserProfile}
                    customFieldDefinitions={board?.customFieldDefinitions}
                  />
                ))}
              </SortableContext>

                {/* Add List Button */}
                <div className="w-72 shrink-0">
                  {!isAddingList ? (
                    <button
                      onClick={() => setIsAddingList(true)}
                      className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-semibold p-3 rounded-lg flex items-center gap-2 transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      {scribeMode ? "Adicionar Coluna de Ur" : "Adicionar outra lista"}
                    </button>
                  ) : (
                    <div className="bg-theme-surface p-3 rounded-lg shadow-xl border border-theme animate-in fade-in slide-in-from-top-2 duration-200">
                      <form onSubmit={handleAddList}>
                        <input
                          autoFocus
                          type="text"
                          placeholder={scribeMode ? "Título da Coluna..." : "Insira o título da lista..."}
                          value={newListTitle}
                          onChange={(e) => setNewListTitle(e.target.value)}
                          className="w-full px-3 py-2 bg-theme-card text-theme-main border border-theme rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <div className="flex items-center gap-2 mt-3">
                          <button
                            type="submit"
                            className="bg-blue-600 text-white text-sm px-4 py-1.5 rounded-md hover:bg-blue-700 font-semibold shadow-sm transition-all"
                          >
                            {scribeMode ? "Erguer Coluna" : "Adicionar lista"}
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
              </>
            )}

            {viewMode === 'table' && board && (
              <TableView 
                cards={getFilteredCards()} 
                lists={lists} 
                board={board}
                tags={board.tags}
                onCardClick={setActiveCard}
                scribeMode={scribeMode}
              />
            )}

            {viewMode === 'calendar' && board && (
              <CalendarView 
                cards={getFilteredCards()} 
                board={board}
                onCardClick={setActiveCard}
                scribeMode={scribeMode}
              />
            )}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeDragCard ? (
            <CardItem
              card={activeDragCard}
              onClick={() => {}}
              isDragOverlay
            />
          ) : null}
          {activeDragList ? (
            <div className="w-72 bg-theme-surface rounded-lg shadow-2xl border-2 border-blue-500 p-3 opacity-80 rotate-3">
              <span className="font-bold text-sm">{activeDragList.title}</span>
            </div>
          ) : null}
        </DragOverlay>
        </DndContext>
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
          members={members}
          initialTab={commandCenterTab}
          onClose={() => setShowCommandCenter(false)} 
          scribeMode={scribeMode}
        />
      )}

      {showSettings && (
        <SettingsModal 
          board={board || undefined} 
          cards={cards} 
          lists={lists}
          onClose={() => setShowSettings(false)} 
        />
      )}
      
      {showAutomationModal && boardId && (
        <AutomationModal boardId={boardId} onClose={() => setShowAutomationModal(false)} />
      )}
    </div>
  );
};
