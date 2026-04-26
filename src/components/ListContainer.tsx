import { useState, useRef } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { CardItem } from "./CardItem";
import type { List, Card } from "../types";
import { archiveList, updateListTitle } from "../services/listService";

interface ListContainerProps {
  list: List;
  cards: Card[];
  index: number;
  onAddCard: (listId: string, title: string) => void;
  onCardClick: (card: Card) => void;
}

export const ListContainer = ({ list, cards, index, onAddCard, onCardClick }: ListContainerProps) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState("");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(list.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    onAddCard(list.id!, newCardTitle);
    setNewCardTitle("");
    setIsAddingCard(false);
  };

  const handleArchiveList = async () => {
    if (confirm("Tem certeza que deseja arquivar esta lista? Ela não aparecerá mais no quadro.")) {
      try {
        await archiveList(list.id!);
      } catch (error) {
        console.error("Erro ao arquivar lista:", error);
      }
    }
  };

  const startEditTitle = () => {
    setTitleDraft(list.title);
    setIsEditingTitle(true);
    setTimeout(() => titleInputRef.current?.select(), 0);
  };

  const saveTitle = async () => {
    setIsEditingTitle(false);
    const trimmed = titleDraft.trim();
    if (!trimmed || trimmed === list.title) return;
    try {
      await updateListTitle(list.id!, trimmed);
    } catch (error) {
      console.error("Erro ao renomear lista:", error);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") saveTitle();
    if (e.key === "Escape") { setIsEditingTitle(false); setTitleDraft(list.title); }
  };

  return (
    <Draggable draggableId={list.id!} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`bg-gray-100 w-72 rounded-lg flex flex-col flex-shrink-0 max-h-full ${
            snapshot.isDragging ? "shadow-2xl opacity-80" : "shadow-sm"
          }`}
        >
          {/* List Header (Drag Handle) */}
          <div
            {...(!isEditingTitle ? provided.dragHandleProps : {})}
            className="p-3 font-semibold text-gray-800 flex justify-between items-center group"
          >
            {isEditingTitle ? (
              <input
                ref={titleInputRef}
                autoFocus
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={handleTitleKeyDown}
                className="text-sm font-semibold bg-white border border-blue-400 rounded px-2 py-0.5 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <h2
                className="text-sm cursor-pointer hover:bg-gray-200 rounded px-1 py-0.5 w-full truncate"
                onClick={startEditTitle}
                title="Clique para renomear"
              >
                {list.title}
              </h2>
            )}
            {!isEditingTitle && (
              <button
                onClick={handleArchiveList}
                className="ml-1 p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-blue-600 hover:bg-gray-200 rounded transition-all shrink-0"
                title="Arquivar lista"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
              </button>
            )}
          </div>

          {/* Cards Droppable Area */}
          <Droppable droppableId={list.id!} type="card">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`px-2 py-1 flex-1 overflow-y-auto min-h-[10px] ${
                  snapshot.isDraggingOver ? "bg-blue-50/50" : ""
                }`}
              >
                {cards.map((card, cardIndex) => (
                  <CardItem key={card.id} card={card} index={cardIndex} onClick={() => onCardClick(card)} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          {/* Add Card Footer */}
          <div className="p-2">
            {!isAddingCard ? (
              <button
                onClick={() => setIsAddingCard(true)}
                className="w-full text-left px-2 py-1.5 text-sm text-gray-600 hover:bg-gray-200 hover:text-gray-800 rounded transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Adicionar um cartão
              </button>
            ) : (
              <form onSubmit={handleAddCard} className="flex flex-col gap-2">
                <textarea
                  autoFocus
                  placeholder="Insira um título para este cartão..."
                  value={newCardTitle}
                  onChange={(e) => setNewCardTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddCard(e);
                    }
                  }}
                  className="w-full p-2 text-sm border border-gray-300 rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none h-16"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="bg-blue-600 text-white text-sm px-3 py-1.5 rounded hover:bg-blue-700 font-medium"
                  >
                    Adicionar cartão
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingCard(false)}
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
    </Draggable>
  );
};
