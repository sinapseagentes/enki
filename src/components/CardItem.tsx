import { Draggable } from "@hello-pangea/dnd";
import type { Card } from "../types";
import { deleteCard } from "../services/cardService";

interface CardItemProps {
  card: Card;
  index: number;
}

export const CardItem = ({ card, index }: CardItemProps) => {
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Evita conflitos com clique para abrir o modal no futuro
    if (confirm("Tem certeza que deseja excluir este cartão?")) {
      try {
        await deleteCard(card.id!);
      } catch (error) {
        console.error("Erro ao excluir cartão:", error);
      }
    }
  };

  return (
    <Draggable draggableId={card.id!} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`group bg-white p-3 rounded shadow-sm border border-gray-200 mb-2 cursor-grab active:cursor-grabbing hover:bg-gray-50 transition-colors relative ${
            snapshot.isDragging ? "shadow-lg rotate-2 scale-105" : ""
          }`}
        >
          <p className="text-sm text-gray-800 break-words pr-6">{card.title}</p>
          <button
            onClick={handleDelete}
            className="absolute top-2 right-2 p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 rounded transition-all"
            title="Excluir cartão"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      )}
    </Draggable>
  );
};
