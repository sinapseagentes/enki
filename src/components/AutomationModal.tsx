import React, { useState, useEffect, useCallback } from "react";
import { useTheme } from "../contexts/ThemeContext";
import type { Automation, AutomationTriggerType, AutomationActionType } from "../types/automation";
import { getAutomations, createAutomation, deleteAutomation, toggleAutomation } from "../services/automationService";
import { getLists } from "../services/listService";
import type { List } from "../types";

interface AutomationModalProps {
  boardId: string;
  onClose: () => void;
}

export const AutomationModal: React.FC<AutomationModalProps> = ({ boardId, onClose }) => {
  const { scribeMode } = useTheme();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);

  
  const [trigger, setTrigger] = useState<AutomationTriggerType>("card_created");
  const [action, setAction] = useState<AutomationActionType>("move");
  const [config, setConfig] = useState<{
    targetListId?: string;
    destinationListId?: string;
    label?: string;
    daysToDue?: number;
  }>({});

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [autoData, listData] = await Promise.all([
        getAutomations(boardId),
        getLists(boardId)
      ]);
      setAutomations(autoData);
      setLists(listData);
    } catch (error) {
      console.error("Error loading automation data:", error);
    } finally {
      setLoading(false);
    }
  }, [boardId]);

  useEffect(() => {
    loadData();
  }, [loadData]);


  const handleAddAutomation = async () => {
    const newAuto: Omit<Automation, 'id'> = {
      boardId,
      trigger,
      action,
      config,
      active: true
    };

    await createAutomation(newAuto);
    loadData();
    // Reset form
    setConfig({});
  };

  const handleDelete = async (id: string) => {
    await deleteAutomation(id);
    loadData();
  };

  const handleToggle = async (id: string, active: boolean) => {
    await toggleAutomation(id, active);
    loadData();
  };

  const labels = [
    { name: "Prioritário", color: "#ef4444" },
    { name: "Em foco", color: "#f59e0b" },
    { name: "Concluído", color: "#10b981" },
    { name: "Estudo", color: "#3b82f6" },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-white/10 my-8">
        <div className={`p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center ${scribeMode ? 'bg-amber-100/50 dark:bg-amber-900/40' : 'bg-gray-50 dark:bg-slate-800/50'}`}>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <span className="text-2xl">{scribeMode ? '📜' : '🤖'}</span>
            {scribeMode ? 'Decretos de Enki' : 'Automações'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Nouveau Decreto Form */}
          <section className={`p-4 rounded-xl border-2 border-dashed ${scribeMode ? 'border-amber-300 bg-amber-50/30' : 'border-blue-200 bg-blue-50/30'}`}>
            <h3 className="text-sm font-bold opacity-60 uppercase tracking-widest mb-4">
              {scribeMode ? 'Nova Invocação de Vontade' : 'Adicionar Nova Regra'}
            </h3>
            
            <div className="space-y-4">
              {/* Trigger */}
              <div>
                <label className="block text-xs font-bold mb-1 opacity-70">
                  {scribeMode ? 'INVOCAÇÃO (Gatilho)' : 'QUANDO'}
                </label>
                <div className="flex gap-2 flex-wrap">
                  <select 
                    value={trigger}
                    onChange={(e) => setTrigger(e.target.value as AutomationTriggerType)}
                    className="flex-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="card_created">{scribeMode ? 'Um Selo é entalhado' : 'Um cartão é criado'}</option>
                    <option value="card_moved">{scribeMode ? 'Um Selo é movido para Coluna...' : 'Um cartão é movido para lista...'}</option>
                    <option value="card_archived">{scribeMode ? 'Um Selo é banido (Arquivado)' : 'Um cartão é arquivado'}</option>
                  </select>

                  {trigger === 'card_moved' && (
                    <select 
                      value={config.targetListId || ''}
                      onChange={(e) => setConfig({ ...config, targetListId: e.target.value })}
                      className="flex-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">{scribeMode ? 'Qualquer Coluna' : 'Qualquer lista'}</option>
                      {lists.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                    </select>
                  )}
                </div>
              </div>

              {/* Action */}
              <div>
                <label className="block text-xs font-bold mb-1 opacity-70">
                  {scribeMode ? 'CONSUMAÇÃO (Ação)' : 'ENTÃO'}
                </label>
                <div className="flex gap-2 flex-wrap">
                  <select 
                    value={action}
                    onChange={(e) => setAction(e.target.value as AutomationActionType)}
                    className="flex-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="move">{scribeMode ? 'Transportar para' : 'Mover para'}</option>
                    <option value="add_label">{scribeMode ? 'Marcar com Sinete' : 'Adicionar etiqueta'}</option>
                    <option value="set_due_date">{scribeMode ? 'Decretar prazo de' : 'Definir vencimento em'}</option>
                  </select>

                  {action === 'move' && (
                    <select 
                      value={config.destinationListId || ''}
                      onChange={(e) => setConfig({ ...config, destinationListId: e.target.value })}
                      className="flex-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">{scribeMode ? 'Escolha a Coluna' : 'Escolher lista'}</option>
                      {lists.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                    </select>
                  )}

                  {action === 'add_label' && (
                    <select 
                      value={config.label || ''}
                      onChange={(e) => setConfig({ ...config, label: e.target.value })}
                      className="flex-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">{scribeMode ? 'Escolha o Sinete' : 'Escolher cor'}</option>
                      {labels.map(l => <option key={l.color} value={l.color}>{l.name}</option>)}
                    </select>
                  )}

                  {action === 'set_due_date' && (
                    <div className="flex items-center gap-2 flex-1">
                      <input 
                        type="number"
                        min="1"
                        value={config.daysToDue || 1}
                        onChange={(e) => setConfig({ ...config, daysToDue: parseInt(e.target.value) })}
                        className="w-20 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <span className="text-xs font-bold opacity-60 uppercase">{scribeMode ? 'Soluções (Dias)' : 'Dias'}</span>
                    </div>
                  )}
                </div>
              </div>

              <button 
                onClick={handleAddAutomation}
                className={`w-full py-2 rounded-lg font-bold text-white transition-all shadow-md active-shrink ${scribeMode ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-900/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20'}`}
              >
                {scribeMode ? 'Decretar Vontade' : 'Criar Automação'}
              </button>
            </div>
          </section>

          {/* List of Automations */}
          <section>
            <h3 className="text-sm font-bold opacity-60 uppercase tracking-widest mb-4">
              {scribeMode ? 'Decretos Ativos' : 'Suas Regras'}
            </h3>
            
            {loading ? (
              <div className="text-center py-10 opacity-50 italic">Sondando os registros...</div>
            ) : automations.length === 0 ? (
              <div className="text-center py-10 border border-gray-100 dark:border-white/5 rounded-xl opacity-50 italic">
                {scribeMode ? 'Nenhum decreto foi proclamado ainda.' : 'Nenhuma automação configurada.'}
              </div>
            ) : (
              <div className="space-y-3">
                {automations.map(auto => (
                  <div 
                    key={auto.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all ${auto.active ? 'bg-white dark:bg-slate-800 border-gray-200 dark:border-white/10' : 'bg-gray-50/50 dark:bg-slate-900/50 border-gray-100 dark:border-white/5 grayscale opacity-60'}`}
                  >
                    <div className="flex-1">
                      <div className="text-sm">
                        <span className="font-bold text-blue-500 mr-2">IF</span>
                        <span className="opacity-70 italic mr-2">
                          {auto.trigger === 'card_created' && (scribeMode ? 'Selo entalhado' : 'Cartão criado')}
                          {auto.trigger === 'card_moved' && (scribeMode ? `Movido para ${lists.find(l => l.id === auto.config.targetListId)?.title || 'Qualquer Coluna'}` : `Movido para ${lists.find(l => l.id === auto.config.targetListId)?.title || 'Qualquer lista'}`)}
                          {auto.trigger === 'card_archived' && (scribeMode ? 'Selo banido' : 'Cartão arquivado')}
                        </span>
                        <span className="font-bold text-amber-500 mr-2">THEN</span>
                        <span className="font-bold">
                          {auto.action === 'move' && (scribeMode ? `Transportar para ${lists.find(l => l.id === auto.config.destinationListId)?.title}` : `Mover para ${lists.find(l => l.id === auto.config.destinationListId)?.title}`)}
                          {auto.action === 'add_label' && (scribeMode ? `Sinetar ${labels.find(l => l.color === auto.config.label)?.name}` : `Etiquetar ${labels.find(l => l.color === auto.config.label)?.name}`)}
                          {auto.action === 'set_due_date' && (scribeMode ? `Prazo: ${auto.config.daysToDue} dias` : `Prazo: ${auto.config.daysToDue} dias`)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleToggle(auto.id!, !auto.active)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${auto.active ? 'bg-green-500' : 'bg-gray-300'}`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${auto.active ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                      <button 
                        onClick={() => handleDelete(auto.id!)}
                        className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className={`p-6 border-t border-gray-100 dark:border-white/5 flex justify-end ${scribeMode ? 'bg-amber-100/30' : 'bg-gray-50'}`}>
          <button 
            onClick={onClose}
            className={`px-8 py-2 rounded-lg font-bold text-white shadow-lg transition-all active-shrink ${scribeMode ? 'bg-amber-800 hover:bg-amber-900 shadow-amber-950/20' : 'bg-slate-700 hover:bg-slate-800 shadow-slate-900/20'}`}
          >
            {scribeMode ? 'Assim seja' : 'Fechar'}
          </button>
        </div>
      </div>
    </div>
  );
};
