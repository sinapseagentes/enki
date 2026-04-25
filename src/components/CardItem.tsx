import { Draggable } from "@hello-pangea/dnd";
import type { Card } from "../types";

interface CardItemProps {
  card: Card;
  index: number;
}

export const CardItem = ({ card, index }: CardItemProps) => {
  return (
    <Draggable draggableId={card.id!} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`bg-white p-3 rounded shadow-sm border border-gray-200 mb-2 cursor-grab active:cursor-grabbing hover:bg-gray-50 transition-colors ${
            snapshot.isDragging ? "shadow-lg rotate-2 scale-105" : ""
          }`}
        >
          <p className="text-sm text-gray-800 break-words">{card.title}</p>
        </div>
      )}
    </Draggable>
  );
};
