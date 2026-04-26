import { useState, useEffect } from "react";
import type { Card } from "../types";
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
      });
      onClose();
    } catch (error) {
      console.error("Erro ao salvar cartão:", error);
    } finally {
      setIsSaving(false);
    }
  };

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
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
                />
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
