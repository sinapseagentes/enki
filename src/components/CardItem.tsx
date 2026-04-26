import { Draggable } from "@hello-pangea/dnd";
import type { Card } from "../types";
import { archiveCard, restoreCard } from "../services/cardService";

interface CardItemProps {
  card: Card;
  index: number;
  onClick: () => void;
}

const formatDueDate = (ts: number) => {
  const date = new Date(ts);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
};

export const CardItem = ({ card, index, onClick }: CardItemProps) => {
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

  const isOverdue = card.dueDate ? card.dueDate < Date.now() : false;

  return (
    <Draggable draggableId={card.id!} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`group rounded shadow-sm border mb-2 cursor-grab active:cursor-grabbing transition-all relative overflow-hidden ${
            card.archived ? "bg-gray-200 border-gray-300 opacity-75 grayscale" : "bg-white border-gray-200 hover:bg-gray-50"
          } ${snapshot.isDragging ? "shadow-lg rotate-2 scale-105" : ""}`}
        >
          {card.colorLabel && !card.coverUrl && (
            <div className="h-2 w-full" style={{ backgroundColor: card.colorLabel }} />
          )}
          {card.coverUrl && (
            <img src={card.coverUrl} alt="" className="w-full h-32 object-cover border-b" />
          )}
          <div className="p-3">
            <p className="text-sm text-gray-800 break-words pr-6">{card.title}</p>

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
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                    isOverdue ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    {formatDueDate(card.dueDate)}
                    {isOverdue && " · Atrasado"}
                  </span>
                )}
                {card.checklists && card.checklists.length > 0 && (
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
                    card.checklists.every(i => i.completed) ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
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
        </div>
      )}
    </Draggable>
  );
};
