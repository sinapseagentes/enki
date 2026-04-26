import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { subscribeToLists, createList, updateListOrder } from "../services/listService";
import { subscribeToCards, createCard, updateCard } from "../services/cardService";
import { subscribeToBoard, getMembersProfile } from "../services/boardService";
import { ListContainer } from "../components/ListContainer";
import { CardModal } from "../components/CardModal";
import { InviteModal } from "../components/InviteModal";
import type { List, Card, Board } from "../types";

export const BoardPage = () => {
  const { id: boardId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [board, setBoard] = useState<Board | null>(null);
  const [lists, setLists] = useState<List[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [isAddingList, setIsAddingList] = useState(false);
  const [newListTitle, setNewListTitle] = useState("");
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [isInviting, setIsInviting] = useState(false);

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

  // Fetch member profiles when board members list changes
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
    } catch (error) {
      console.error("Error creating card:", error);
    }
  };

  const onDragEnd = useCallback(async (result: DropResult) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === "list") {
      // Optimistic update
      const newLists = Array.from(lists);
      const [movedList] = newLists.splice(source.index, 1);
      newLists.splice(destination.index, 0, movedList);
      setLists(newLists);

      // Save to db
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
        } catch (error) {
          console.error("Error updating cross-list cards:", error);
        }
      }
    }
  }, [lists, cards]);

  return (
    <div className="h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex flex-col">
      <nav className="bg-black/20 backdrop-blur-sm px-4 py-3 flex justify-between items-center text-white shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/")}
            className="hover:bg-white/20 p-1.5 rounded transition-colors"
            title="Voltar ao Dashboard"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <h1 className="font-bold text-lg hidden sm:block">
            {board?.title || "Carregando..."}
          </h1>
          
          {/* Members Avatars List */}
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
                    className="w-8 h-8 rounded-full border-2 border-blue-600 object-cover bg-white"
                    title={member.displayName}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full border-2 border-blue-600 bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-bold uppercase">
                    {member.displayName?.charAt(0) || "?"}
                  </div>
                )}
                {/* Tooltip on hover */}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  {member.displayName}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsInviting(true)}
            className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
            Compartilhar
          </button>
        </div>
      </nav>
      
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="board" type="list" direction="horizontal">
            {(provided) => (
              <div 
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="flex gap-4 items-start h-full"
              >
                {lists.map((list, index) => {
                  const listCards = cards.filter(c => c.listId === list.id).sort((a,b) => a.order - b.order);
                  return (
                    <ListContainer 
                      key={list.id} 
                      list={list} 
                      cards={listCards} 
                      index={index} 
                      onAddCard={handleAddCard}
                      onCardClick={setActiveCard}
                    />
                  );
                })}
                {provided.placeholder}
                
                {/* Add List Button */}
                <div className="w-72 shrink-0">
                  {!isAddingList ? (
                    <button 
                      onClick={() => setIsAddingList(true)}
                      className="bg-white/20 hover:bg-white/30 text-white w-full text-left px-4 py-3 rounded-lg flex items-center gap-2 transition-colors font-medium"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      Adicionar outra lista
                    </button>
                  ) : (
                    <form 
                      onSubmit={handleAddList}
                      className="bg-gray-100 p-2 rounded-lg"
                    >
                      <input 
                        autoFocus
                        type="text" 
                        placeholder="Insira o título da lista..." 
                        value={newListTitle}
                        onChange={(e) => setNewListTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm mb-2"
                      />
                      <div className="flex items-center gap-2">
                        <button 
                          type="submit" 
                          disabled={!newListTitle.trim()}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded font-medium disabled:opacity-50"
                        >
                          Adicionar lista
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setIsAddingList(false)}
                          className="text-gray-500 hover:text-gray-800 p-1"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </main>

      {/* Card Detail Modal */}
      {activeCard && (
        <CardModal 
          card={activeCard} 
          onClose={() => setActiveCard(null)} 
        />
      )}

      {/* Invite Modal */}
      {isInviting && boardId && (
        <InviteModal
          boardId={boardId}
          onClose={() => setIsInviting(false)}
        />
      )}
    </div>
  );
};
