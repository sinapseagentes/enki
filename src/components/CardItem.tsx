import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Card, Tag } from "../types";
import { archiveCard, restoreCard } from "../services/cardService";

interface CardItemProps {
  card: Card & { isFilteredOut?: boolean };
  tags?: Tag[];
  currentUserProfile?: any;
  onClick: () => void;
}

export const CardItem = ({ card, tags, currentUserProfile, onClick }: CardItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id!,
    data: {
      type: "card",
      card,
    },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  const isOverdue = card.dueDate ? card.dueDate < Date.now() : false;
  const isDueSoon = card.dueDate ? (card.dueDate - Date.now() < 24 * 60 * 60 * 1000) && !isOverdue : false;
  const isCompleted = card.checklists && card.checklists.length > 0 && card.checklists.every(i => i.completed);
  const isToday = card.dueDate ? new Date(card.dueDate).toDateString() === new Date().toDateString() : false;

  const getDueDateBadgeClass = () => {
    if (isCompleted) return "bg-green-500/20 text-green-600";
    if (isOverdue) return "bg-red-500/20 text-red-600 animate-pulse";
    if (isDueSoon) return "bg-orange-500/20 text-orange-600";
    return "bg-theme-surface text-theme-secondary";
  };

  const handleArchive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja arquivar este cartão?")) {
      try {
        await archiveCard(card.id!);
      } catch (error) {
        console.error("Erro ao arquivar cartão:", error);
      }
    }
  };

  const handleRestore = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await restoreCard(card.id!);
    } catch (error) {
      console.error("Erro ao restaurar cartão:", error);
    }
  };

  const formatDueDate = (ts: number) => {
    const date = new Date(ts);
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={`group rounded shadow-sm border mb-2 cursor-pointer transition-shadow relative overflow-hidden ${
        card.archived ? "bg-theme-surface/50 border-theme opacity-75 grayscale" : "bg-theme-card border-theme"
      } ${isDragging ? "opacity-30 border-blue-500 border-2" : "hover:shadow-md"} ${
        card.isFilteredOut ? "opacity-10 scale-95 pointer-events-none blur-[1px]" : "opacity-100"
      }`}
      {...attributes}
      {...listeners}
    >
      {card.colorLabel && !card.coverUrl && (
        <div className="h-2 w-full" style={{ backgroundColor: card.colorLabel }} />
      )}
      {card.coverUrl && (
        <img src={card.coverUrl} alt="" className="w-full h-32 object-cover border-b" />
      )}
      
      {/* Display tags in list view */}
      {card.tagIds && card.tagIds.length > 0 && tags && (
        <div className="flex flex-wrap gap-1 p-2 pb-0">
          {card.tagIds.map(tagId => {
            const tag = tags.find(t => t.id === tagId);
            if (!tag) return null;
            return (
              <div 
                key={tagId} 
                className="h-1.5 w-8 rounded-full shadow-sm" 
                style={{ backgroundColor: tag.color }}
                title={tag.name}
              />
            );
          })}
        </div>
      )}

      <div className="p-3">
        <p className="text-sm text-theme-main break-words pr-6">{card.title}</p>

        {/* Badges: description icon + due date + attachments */}
        {(card.description || card.dueDate || (card.attachments && card.attachments.length > 0)) && (
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {card.description && (
              <div className="text-gray-400" title="Este cartão possui uma descrição">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
              </div>
            )}
            {card.attachments && card.attachments.length > 0 && (
              <div className="text-gray-400 flex items-center gap-0.5" title={`${card.attachments.length} anexos`}>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                <span className="text-[10px] font-bold">{card.attachments.length}</span>
              </div>
            )}
            {card.dueDate && (
              <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${getDueDateBadgeClass()}`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {formatDueDate(card.dueDate)}
                {isToday && !isCompleted && " · HOJE"}
                {isOverdue && !isCompleted && " · ATRASADO"}
              </span>
            )}
            {card.checklists && card.checklists.length > 0 && (
              <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-bold ${
                isCompleted ? "bg-green-600 text-white" : "bg-theme-surface text-theme-secondary"
              }`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                {card.checklists.filter(i => i.completed).length}/{card.checklists.length}
              </span>
            )}
          </div>
        )}

        <div className="absolute top-2 right-2 flex gap-1">
          {card.archived && (
            <button
              onClick={handleRestore}
              className="p-1 text-green-600 hover:bg-green-100 rounded transition-all"
              title="Restaurar cartão"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          )}
          <button
            onClick={handleArchive}
            className={`p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-blue-600 hover:bg-blue-50 rounded transition-all ${card.archived ? "opacity-100 text-blue-600" : ""}`}
            title={card.archived ? "Cartão Arquivado" : "Arquivar cartão"}
            disabled={card.archived}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
          </button>
        </div>
      </div>

      {/* Storage limit progress bar (Option A: relative to logged-in user limit) */}
      {currentUserProfile?.storageLimit && currentUserProfile.storageLimit > 0 && (card.storageMetrics?.byUser?.[currentUserProfile.uid] || 0) > 0 && (
        <div className="px-3 pb-2 pt-1 border-t border-gray-50 bg-gray-50/50">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] font-bold text-gray-500 uppercase">Seu Consumo</span>
            <span className="text-[10px] font-bold text-blue-600">
              {(() => {
                const bytes = card.storageMetrics?.byUser?.[currentUserProfile.uid] || 0;
                if (bytes === 0) return '0 B';
                const k = 1024;
                const sizes = ['B', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
              })()}
              <span className="text-gray-400 font-normal ml-1">
                ({Math.min(100, Math.round(((card.storageMetrics?.byUser?.[currentUserProfile.uid] || 0) / currentUserProfile.storageLimit) * 100))}%)
              </span>
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1 overflow-hidden">
            <div 
              className={`h-1 rounded-full ${Math.min(100, Math.round(((card.storageMetrics?.byUser?.[currentUserProfile.uid] || 0) / currentUserProfile.storageLimit) * 100)) > 90 ? 'bg-red-500' : 'bg-blue-500'}`} 
              style={{ width: `${Math.min(100, Math.round(((card.storageMetrics?.byUser?.[currentUserProfile.uid] || 0) / currentUserProfile.storageLimit) * 100))}%` }}
            ></div>
          </div>
        </div>
      )}
    </div>
  );
};
