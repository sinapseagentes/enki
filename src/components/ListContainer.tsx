import { useState, useRef } from "react";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CardItem } from "./CardItem";
import type { List, Card, Tag } from "../types";
import { archiveList, restoreList, updateListTitle } from "../services/listService";
import { useTheme } from "../contexts/ThemeContext";

interface ListContainerProps {
  list: List;
  cards: Card[];
  tags?: Tag[];
  onAddCard: (listId: string, title: string) => void;
  onCardClick: (card: Card) => void;
  currentUserProfile?: any;
}

export const ListContainer = ({ list, cards, tags, onAddCard, onCardClick, currentUserProfile }: ListContainerProps) => {

  const { scribeMode } = useTheme();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id!,
    data: {
      type: "list",
      list,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

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
    if (confirm(`Tem certeza que deseja arquivar esta ${scribeMode ? 'coluna' : 'lista'}? Ela não aparecerá mais no ${scribeMode ? 'centro' : 'quadro'}.`)) {
      try {
        await archiveList(list.id!);
      } catch (error) {
        console.error("Erro ao arquivar lista:", error);
      }
    }
  };

  const handleRestoreList = async () => {
    try {
      await restoreList(list.id!);
    } catch (error) {
      console.error("Erro ao restaurar lista:", error);
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
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-theme-surface w-72 rounded-lg flex flex-col flex-shrink-0 max-h-full border border-theme shadow-sm transition-colors animate-slide-up ${
        isDragging ? "opacity-30 border-blue-500 border-2" : ""
      } ${list.archived ? "opacity-75" : ""}`}
    >
      {/* List Header */}
      <div
        {...attributes}
        {...listeners}
        className={`p-3 font-semibold text-theme-main flex justify-between items-center group rounded-t-lg cursor-grab active:cursor-grabbing ${list.archived ? "opacity-50" : ""}`}
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
            className="text-sm cursor-pointer hover:bg-theme-card/50 rounded px-1 py-0.5 w-full truncate"
            onClick={startEditTitle}
            title={scribeMode ? "Clique para renomear coluna" : "Clique para renomear"}
          >
            {list.title}
          </h2>
        )}
        {!isEditingTitle && (
          <div className="flex items-center gap-1">
            {list.archived && (
              <button
                onClick={handleRestoreList}
                className="p-1 text-green-600 hover:bg-green-100 rounded transition-all shrink-0"
                title={scribeMode ? "Restaurar coluna" : "Restaurar lista"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </button>
            )}
            <button
              onClick={handleArchiveList}
              className={`ml-1 p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-blue-600 hover:bg-gray-200 rounded transition-all shrink-0 ${list.archived ? "opacity-100 text-blue-600" : ""}`}
              title={scribeMode ? "Arquivar coluna" : "Arquivar lista"}
              disabled={list.archived}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
            </button>
          </div>
        )}
      </div>

      {/* Cards Area */}
      <div className="px-2 py-1 flex-1 overflow-y-auto min-h-[50px]">
        <SortableContext
          items={cards.map((c) => c.id!)}
          strategy={verticalListSortingStrategy}
        >
              {cards.map((card) => (
                <CardItem 
                  key={card.id} 
                  card={card} 
                  tags={tags}
                  currentUserProfile={currentUserProfile}
                  onClick={() => onCardClick(card)} 
                />
              ))}

        </SortableContext>
      </div>

      {/* Add Card Footer */}
      <div className="p-2">
        {!isAddingCard ? (
          <button
            onClick={() => setIsAddingCard(true)}
            className="w-full text-left px-2 py-1.5 text-sm text-theme-secondary hover:bg-theme-card hover:text-theme-main rounded transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            {scribeMode ? "Gravar novo selo" : "Adicionar um cartão"}
          </button>
        ) : (
          <form onSubmit={handleAddCard} className="flex flex-col gap-2">
            <textarea
              autoFocus
              placeholder={scribeMode ? "Insira o conteúdo deste selo de argila..." : "Insira um título para este cartão..."}
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
                {scribeMode ? "Gravar Selo" : "Adicionar cartão"}
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
  );
};
