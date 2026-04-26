import { useState, useEffect } from "react";
import type { Card, ChecklistItem } from "../types";
import { updateCard } from "../services/cardService";

interface CardModalProps {
  card: Card;
  onClose: () => void;
}

const COLORS = [
  "#f87171", // red
  "#fb923c", // orange
  "#facc15", // yellow
  "#4ade80", // green
  "#60a5fa", // blue
  "#c084fc", // purple
  "#a8a29e", // gray
];

export const CardModal = ({ card, onClose }: CardModalProps) => {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [colorLabel, setColorLabel] = useState(card.colorLabel || "");
  const [dueDate, setDueDate] = useState(
    card.dueDate ? new Date(card.dueDate).toISOString().slice(0, 16) : ""
  );
  const [checklists, setChecklists] = useState<ChecklistItem[]>(card.checklists || []);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsSaving(true);
    try {
      await updateCard(card.id!, {
        title,
        description,
        colorLabel: colorLabel || "",
        dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
        checklists,
      });
      onClose();
    } catch (error) {
      console.error("Erro ao salvar cartão:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const addChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      title: newItemTitle.trim(),
      completed: false,
    };
    setChecklists([...checklists, newItem]);
    setNewItemTitle("");
  };

  const toggleChecklistItem = (id: string) => {
    setChecklists(checklists.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const removeChecklistItem = (id: string) => {
    setChecklists(checklists.filter(item => item.id !== id));
  };

  const completedCount = checklists.filter(i => i.completed).length;
  const progressPercent = checklists.length > 0 ? Math.round((completedCount / checklists.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header Color Bar */}
        {colorLabel && (
          <div 
            className="h-16 w-full rounded-t-xl" 
            style={{ backgroundColor: colorLabel }}
          />
        )}

        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="w-full mr-8">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold text-gray-800 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                placeholder="Título do Cartão"
              />
              <p className="text-sm text-gray-500 ml-1 mt-1">Na lista atual</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors absolute top-4 right-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Main Content */}
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                  Descrição
                </h3>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Adicione uma descrição mais detalhada..."
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>

              {/* Checklist Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                    Checklist
                  </h3>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {progressPercent}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ease-out ${progressPercent === 100 ? "bg-green-500" : "bg-blue-500"}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="space-y-2 mb-4">
                  {checklists.map(item => (
                    <div key={item.id} className="flex items-center gap-3 group">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleChecklistItem(item.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                      <span 
                        className={`flex-1 text-sm transition-all ${item.completed ? "text-gray-400 line-through" : "text-gray-700"}`}
                        onClick={() => toggleChecklistItem(item.id)}
                      >
                        {item.title}
                      </span>
                      <button
                        onClick={() => removeChecklistItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                        title="Remover item"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={addChecklistItem} className="flex gap-2">
                  <input
                    type="text"
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    placeholder="Adicionar um item..."
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!newItemTitle.trim()}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-md font-medium disabled:opacity-50 transition-colors"
                  >
                    Adicionar
                  </button>
                </form>
              </div>
            </div>

            {/* Sidebar Actions */}
            <div className="w-full md:w-48 shrink-0 flex flex-col gap-4">
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Etiqueta (Cor)</h4>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setColorLabel(color === colorLabel ? "" : color)}
                      className={`w-8 h-8 rounded-md transition-transform ${colorLabel === color ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "hover:opacity-80 hover:scale-105"}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Data de Entrega</h4>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {dueDate && (
                  <button
                    onClick={() => setDueDate("")}
                    className="mt-1 text-xs text-red-500 hover:text-red-700"
                  >
                    Remover data
                  </button>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={handleSave}
                  disabled={isSaving || !title.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow-sm disabled:opacity-50 transition-colors"
                >
                  {isSaving ? "Salvando..." : "Salvar Cartão"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
