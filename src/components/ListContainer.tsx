import { useState, useRef } from "react";
import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CardItem } from "./CardItem";
import type { List, Card, Tag, CustomFieldDefinition } from "../types";
import { archiveList, restoreList, updateListTitle, updateList } from "../services/listService";
import { COLORS } from "../constants/design";
import { useTheme } from "../contexts/ThemeContext";

interface ListContainerProps {
  list: List;
  cards: Card[];
  tags?: Tag[];
  onAddCard: (listId: string, title: string) => void;
  onCardClick: (card: Card) => void;
  currentUserProfile?: any;
  customFieldDefinitions?: CustomFieldDefinition[];
}

export const ListContainer = ({ list, cards, tags, onAddCard, onCardClick, currentUserProfile, customFieldDefinitions }: ListContainerProps) => {
  const [showColorPicker, setShowColorPicker] = useState(false);

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

  const handleToggleCollapse = async () => {
    try {
      await updateList(list.id!, { isCollapsed: !list.isCollapsed });
    } catch (error) {
      console.error("Erro ao colapsar lista:", error);
    }
  };

  const handleColorChange = async (color: string) => {
    try {
      await updateList(list.id!, { color });
      setShowColorPicker(false);
    } catch (error) {
      console.error("Erro ao mudar cor da lista:", error);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-theme-surface rounded-lg flex flex-col flex-shrink-0 max-h-full border border-theme shadow-sm transition-all duration-300 animate-slide-up ${
        list.isCollapsed ? 'w-12 h-[500px]' : 'w-72'
      } ${isDragging ? "opacity-30 border-blue-500 border-2" : ""} ${list.archived ? "opacity-75" : ""}`}
    >
      {/* Top Color Bar */}
      <div 
        className="h-1.5 w-full rounded-t-lg transition-colors cursor-pointer"
        style={{ backgroundColor: list.color || 'transparent' }}
        onClick={() => setShowColorPicker(!showColorPicker)}
      />

      {showColorPicker && (
        <div className="absolute top-8 left-2 z-50 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-2xl border border-gray-100 dark:border-white/5 flex flex-wrap gap-1.5 w-32 animate-in fade-in zoom-in-95">
          {COLORS.map(c => (
            <button 
              key={c.value} 
              className="w-6 h-6 rounded-full border border-black/5 hover:scale-110 transition-transform" 
              style={{ backgroundColor: c.value }}
              onClick={() => handleColorChange(c.value)}
            />
          ))}
          <button 
            className="w-full mt-1 text-[10px] font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            onClick={() => handleColorChange('')}
          >
            Limpar
          </button>
        </div>
      )}
      {/* List Header */}
      <div className={`p-3 flex items-center justify-between group/header ${list.isCollapsed ? 'flex-col h-full py-4' : ''}`}>
        <div className={`flex items-center gap-2 flex-1 ${list.isCollapsed ? 'flex-col' : ''}`}>
          <div 
            {...attributes} 
            {...listeners} 
            className={`cursor-grab text-gray-400 hover:text-blue-500 transition-colors ${list.isCollapsed ? 'mb-4' : ''}`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
          </div>
          
          {list.isCollapsed ? (
            <h2 
              className="text-sm font-bold text-gray-400 dark:text-gray-500 [writing-mode:vertical-lr] rotate-180 uppercase tracking-widest cursor-pointer"
              onClick={handleToggleCollapse}
            >
              {list.title}
            </h2>
          ) : (
            isEditingTitle ? (
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
                onClick={startEditTitle}
                className="text-sm font-bold text-gray-800 dark:text-white cursor-pointer hover:text-blue-600 transition-colors truncate max-w-[180px]"
              >
                {list.title}
              </h2>
            )
          )}
        </div>

        <div className={`flex items-center gap-1 opacity-0 group-hover/header:opacity-100 transition-opacity ${list.isCollapsed ? 'flex-col mt-auto' : ''}`}>
          {list.archived && (
            <button
              onClick={handleRestoreList}
              className="p-1 text-green-600 hover:bg-green-100 dark:hover:bg-green-500/10 rounded transition-all"
              title={scribeMode ? "Restaurar coluna" : "Restaurar lista"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          )}
          <button 
            onClick={handleToggleCollapse}
            className="p-1 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded transition-all"
            title={list.isCollapsed ? "Expandir" : "Colapsar"}
          >
            {list.isCollapsed ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7M19 19l-7-7 7-7" /></svg>
            )}
          </button>
          {!list.isCollapsed && !list.archived && (
            <button 
              onClick={handleArchiveList}
              className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-all"
              title={scribeMode ? "Arquivar coluna" : "Arquivar lista"}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          )}
        </div>
      </div>

      {/* Cards Area */}
      {!list.isCollapsed && (
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
                    customFieldDefinitions={customFieldDefinitions}
                    onClick={() => onCardClick(card)} 
                  />
                ))}
          </SortableContext>
        </div>
      )}

      {/* Add Card Footer */}
      {!list.isCollapsed && (
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
                  className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-colors"
                >
                  {scribeMode ? "Gravar" : "Adicionar"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingCard(false)}
                  className="px-3 py-1 text-gray-500 text-xs hover:text-gray-700 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
