import type { Board, List, Card } from "../types";

/**
 * Exports a board and its contents to a JSON string.
 */
export const exportBoardToJSON = (board: Board, lists: List[], cards: Card[]): string => {
  const data = {
    exportDate: new Date().toISOString(),
    board,
    lists,
    cards
  };
  return JSON.stringify(data, null, 2);
};

/**
 * Exports board cards to a CSV string.
 */
export const exportBoardToCSV = (board: Board, lists: List[], cards: Card[]): string => {
  const customFields = board.customFieldDefinitions || [];
  
  // Headers
  const headers = [
    "ID",
    "Titulo",
    "Descricao",
    "Lista",
    "Data de Entrega",
    "Etiqueta (Cor)",
    ...customFields.map(f => f.name)
  ];

  const rows = cards.map(card => {
    const listName = lists.find(l => l.id === card.listId)?.title || "";
    const dueDate = card.dueDate ? new Date(card.dueDate).toLocaleString() : "";
    
    const row = [
      card.id,
      card.title,
      card.description || "",
      listName,
      dueDate,
      card.colorLabel || "",
      ...customFields.map(f => {
        const val = card.customFieldValues?.[f.id];
        if (f.type === 'checkbox') return val ? "Sim" : "Nao";
        return val || "";
      })
    ];

    // Escape quotes and wrap in quotes
    return row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",");
  });

  return [headers.join(","), ...rows].join("\n");
};

/**
 * Triggers a file download in the browser.
 */
export const downloadFile = (content: string, fileName: string, contentType: string) => {
  const blob = new Blob([content], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
