import React, { useState } from "react";
import type { CustomFieldDefinition, CustomFieldType } from "../types";
import { updateBoardCustomFields } from "../services/boardService";

interface CustomFieldsManagerProps {
  boardId: string;
  definitions: CustomFieldDefinition[];
  onUpdate?: () => void;
}

const FIELD_TYPES: { value: CustomFieldType; label: string; icon: string }[] = [
  { value: 'text', label: 'Texto', icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z' },
  { value: 'number', label: 'Número', icon: 'M7 20l4-16m2 16l4-16M6 9h14M4 15h14' },
  { value: 'date', label: 'Data', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { value: 'select', label: 'Seleção', icon: 'M4 6h16M4 12h16M4 18h7' },
  { value: 'checkbox', label: 'Checklist', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
];

export const CustomFieldsManager: React.FC<CustomFieldsManagerProps> = ({ boardId, definitions, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState<CustomFieldType>('text');
  const [newOptions, setNewOptions] = useState<string>("");
  const [newSuffix, setNewSuffix] = useState<string>("");

  const handleAddField = async () => {
    if (!newName.trim()) return;

    const newField: CustomFieldDefinition = {
      id: Date.now().toString(),
      name: newName.trim(),
      type: newType,
      suffix: newSuffix.trim() || undefined,
      showOnCover: true
    };

    if (newType === 'select') {
      newField.options = newOptions.split(',').map(o => o.trim()).filter(o => o);
    }

    try {
      const updated = [...definitions, newField];
      await updateBoardCustomFields(boardId, updated);
      
      setNewName("");
      setNewOptions("");
      setNewSuffix("");
      setIsAdding(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error("Error adding custom field:", error);
      alert("Erro ao criar o campo personalizado.");
    }
  };

  const handleRemoveField = async (fieldId: string) => {
    const updated = definitions.filter(f => f.id !== fieldId);
    await updateBoardCustomFields(boardId, updated);
    if (onUpdate) onUpdate();
  };

  const handleToggleCover = async (fieldId: string) => {
    const updated = definitions.map(f => 
      f.id === fieldId ? { ...f, showOnCover: !f.showOnCover } : f
    );
    await updateBoardCustomFields(boardId, updated);
    if (onUpdate) onUpdate();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Definições de Campos</h4>
        {!isAdding && (
          <button 
            type="button"
            onClick={() => setIsAdding(true)}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Novo Campo
          </button>
        )}
      </div>

      {isAdding && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30 space-y-3 animate-in slide-in-from-top-2 duration-200">
          <div>
            <label className="block text-[10px] font-bold text-blue-600 uppercase mb-1">Nome do Campo</label>
            <input 
              type="text" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex: Prioridade, Estimativa..."
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-900/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-blue-600 uppercase mb-1">Tipo</label>
              <select 
                value={newType}
                onChange={(e) => setNewType(e.target.value as CustomFieldType)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-900/50 text-sm focus:outline-none"
              >
                {FIELD_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-blue-600 uppercase mb-1">Sufixo/Unidade</label>
              <input 
                type="text" 
                value={newSuffix}
                onChange={(e) => setNewSuffix(e.target.value)}
                placeholder="Ex: h, pts, $"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-900/50 text-sm focus:outline-none"
              />
            </div>
          </div>

          {newType === 'select' && (
            <div>
              <label className="block text-[10px] font-bold text-blue-600 uppercase mb-1">Opções (separadas por vírgula)</label>
              <input 
                type="text" 
                value={newOptions}
                onChange={(e) => setNewOptions(e.target.value)}
                placeholder="Baixa, Média, Alta"
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-900/50 text-sm focus:outline-none"
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setIsAdding(false)} className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-700">Cancelar</button>
            <button type="button" onClick={handleAddField} className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm transition-all">Criar Campo</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {definitions.length === 0 && !isAdding && (
          <p className="text-center py-6 text-gray-400 text-sm italic border-2 border-dashed border-gray-100 dark:border-white/5 rounded-xl">
            Nenhum campo personalizado definido ainda.
          </p>
        )}
        {definitions.map(field => (
          <div key={field.id} className="group flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-white/5 shadow-sm hover:border-blue-200 dark:hover:border-blue-900 transition-all">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 dark:bg-slate-700 rounded-lg text-gray-400 group-hover:text-blue-500 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={FIELD_TYPES.find(t => t.value === field.type)?.icon} />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                  {field.name} {field.suffix && <span className="text-xs font-normal text-gray-400">({field.suffix})</span>}
                </p>
                <p className="text-[10px] text-gray-400 uppercase font-medium">{FIELD_TYPES.find(t => t.value === field.type)?.label}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleToggleCover(field.id)}
                className={`p-1.5 rounded-lg transition-colors ${field.showOnCover ? 'text-amber-500 bg-amber-50' : 'text-gray-400 hover:bg-gray-100'}`}
                title={field.showOnCover ? "Remover da Capa" : "Exibir na Capa"}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
              </button>
              <button 
                onClick={() => handleRemoveField(field.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Excluir Campo"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
