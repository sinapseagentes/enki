import React from "react";
import type { Card, List, Board, Tag } from "../types";

interface TableViewProps {
  cards: Card[];
  lists: List[];
  board: Board;
  tags?: Tag[];
  onCardClick: (card: Card) => void;
  scribeMode?: boolean;
}

export const TableView: React.FC<TableViewProps> = ({ cards, lists, board, tags, onCardClick, scribeMode }) => {
  return (
    <div className="flex-1 overflow-auto p-6 animate-in fade-in duration-500">
      <div className={`rounded-xl border shadow-xl overflow-hidden ${scribeMode ? 'bg-amber-50/90 border-amber-200' : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-white/5'}`}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className={`${scribeMode ? 'bg-amber-100/50' : 'bg-gray-50 dark:bg-slate-800/50'}`}>
              <th className="p-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Título</th>
              <th className="p-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Coluna</th>
              <th className="p-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Sinetes</th>
              <th className="p-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">Vencimento</th>
              {board.customFieldDefinitions?.map(field => (
                <th key={field.id} className="p-4 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                  {field.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {cards.map(card => {
              const listName = lists.find(l => l.id === card.listId)?.title || "Sem lista";
              const dueDate = card.dueDate ? new Date(card.dueDate).toLocaleDateString() : "-";
              
              return (
                <tr 
                  key={card.id} 
                  onClick={() => onCardClick(card)}
                  className="hover:bg-blue-50/50 dark:hover:bg-blue-900/10 cursor-pointer transition-colors group"
                >
                  <td className="p-4">
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-blue-600 transition-colors">{card.title}</span>
                  </td>
                  <td className="p-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400">{listName}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {card.tagIds?.map(tagId => {
                        const tag = tags?.find(t => t.id === tagId);
                        if (!tag) return null;
                        return (
                          <div key={tagId} className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} title={tag.name} />
                        );
                      })}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{dueDate}</span>
                  </td>
                  {board.customFieldDefinitions?.map(field => {
                    const value = card.customFieldValues?.[field.id];
                    let displayValue = value || "-";
                    if (field.type === 'checkbox') displayValue = value ? "✓" : "✗";
                    if (value && field.suffix) displayValue = `${value}${field.suffix}`;

                    return (
                      <td key={field.id} className="p-4 text-xs text-gray-500 dark:text-gray-400">
                        {displayValue}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        {cards.length === 0 && (
          <div className="p-12 text-center text-gray-400 italic">Nenhum cartão encontrado neste oráculo.</div>
        )}
      </div>
    </div>
  );
};
