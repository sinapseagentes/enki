import React, { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { updateBoardTags, updateBoardPermissions, getMembersProfile } from "../services/boardService";
import { COLORS } from "../constants/design";
import { CustomFieldsManager } from "./CustomFieldsManager";
import { generateICalString, downloadICalFile } from "../utils/calendarUtils";
import { exportBoardToJSON, exportBoardToCSV, downloadFile } from "../utils/exportUtils";
import type { Board, Card, List, Tag, UserProfile } from "../types";

interface SettingsModalProps {
  onClose: () => void;
  board?: Board;
  cards?: Card[];
  lists?: List[];
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, board, cards, lists }) => {
  const { scribeMode, toggleScribeMode } = useTheme();
  const [activeTab, setActiveTab] = useState<"general" | "tags" | "members" | "fields" | "sync" | "data">("general");
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);
  const [memberProfiles, setMemberProfiles] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (!board?.id) return;
    const fetchMembers = async () => {
      if (!board.members || board.members.length === 0) {
        setMemberProfiles([]);
        return;
      }
      const profiles = await getMembersProfile(board.members) as UserProfile[];
      setMemberProfiles(profiles);
    };
    fetchMembers();
  }, [board]);

  const handleAddTag = async () => {
    if (!board?.id || !newTagName.trim()) return;
    const newTag: Tag = {
      id: Date.now().toString(),
      name: newTagName.trim(),
      color: selectedColor
    };
    const updatedTags = [...(board.tags || []), newTag];
    await updateBoardTags(board.id, updatedTags);
    setNewTagName("");
  };

  const handleRemoveTag = async (id: string) => {
    if (!board?.id) return;
    const updatedTags = (board.tags || []).filter(t => t.id !== id);
    await updateBoardTags(board.id, updatedTags);
  };

  const handlePermissionChange = async (userId: string, permission: 'owner' | 'admin' | 'editor' | 'viewer') => {
    if (!board?.id) return;
    const updatedPermissions = {
      ...(board.permissions || {}),
      [userId]: permission
    };
    await updateBoardPermissions(board.id, updatedPermissions);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-white/10 animate-in fade-in zoom-in-95 duration-200 my-8 flex h-[600px]">
        
        <div className="w-1/4 border-r border-gray-100 dark:border-white/5 p-4 flex flex-col gap-2 bg-gray-50 dark:bg-slate-800/50">
            <button onClick={() => setActiveTab("general")} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'general' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>Geral</button>
            <button onClick={() => setActiveTab("tags")} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'tags' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>Etiquetas</button>
            <button onClick={() => setActiveTab("members")} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'members' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>Membros</button>
            <button onClick={() => setActiveTab("fields")} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'fields' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>Campos</button>
            <button onClick={() => setActiveTab("sync")} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'sync' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>Sincronização</button>
            <button onClick={() => setActiveTab("data")} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'data' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800'}`}>Dados & Exportação</button>
        </div>

        <div className="flex-1 flex flex-col h-full">
          <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              {scribeMode ? 'Configurações de Ur' : 'Configurações'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === "general" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-4">Preferências Visual</h3>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-white/5">
                      <div>
                        <p className="text-sm font-bold text-gray-700 dark:text-gray-200">Modo Escriba</p>
                        <p className="text-[10px] text-gray-400">Ativa tipografia e estética suméria ancestral</p>
                      </div>
                      <button 
                        onClick={toggleScribeMode}
                        className={`w-12 h-6 rounded-full transition-colors relative ${scribeMode ? 'bg-amber-600' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${scribeMode ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "tags" && (
              <div className="space-y-6">
                <div className="flex flex-col gap-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder={scribeMode ? 'Nome do Sinete...' : 'Nome da tag...'}
                      className="flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 dark:text-white"
                    />
                    <button
                      onClick={handleAddTag}
                      className="px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-bold text-sm"
                    >
                      {scribeMode ? 'Esculpir' : 'Criar'}
                    </button>
                  </div>
                  
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 block">
                      {scribeMode ? 'Cores Sagradas' : 'Cor da Tag'}
                    </span>
                    <div className="flex flex-wrap gap-2 p-1">
                      {COLORS.map(c => (
                        <button
                          key={c.value}
                          onClick={() => setSelectedColor(c.value)}
                          className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColor === c.value ? 'border-theme-main scale-110 shadow-lg' : 'border-transparent hover:scale-105 opacity-70 hover:opacity-100'}`}
                          style={{ backgroundColor: c.value }}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                    {(board?.tags || []).map(tag => (
                      <div
                        key={tag.id}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-md text-white text-xs font-bold shadow-sm"
                        style={{ backgroundColor: tag.color }}
                      >
                        {tag.name}
                        <button onClick={() => handleRemoveTag(tag.id)} className="hover:scale-110 opacity-70 hover:opacity-100">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "members" && (
              <div className="space-y-4">
                {board?.permissions && Object.entries(board.permissions).map(([userId, permission]) => {
                  const member = memberProfiles.find(m => m.uid === userId);
                  const displayName = member?.displayName || userId;
                  return (
                    <div key={userId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                          {displayName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-gray-700 dark:text-gray-200 text-sm">{displayName}</p>
                          <p className="text-[10px] text-gray-500 uppercase">{permission}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePermissionChange(userId, 'owner')}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${permission === 'owner' ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          Dono
                        </button>
                        <button
                          onClick={() => handlePermissionChange(userId, 'editor')}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${permission === 'editor' ? 'bg-green-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          Editor
                        </button>
                        <button
                          onClick={() => handlePermissionChange(userId, 'viewer')}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${permission === 'viewer' ? 'bg-purple-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                          Leitor
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === "fields" && board && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                <CustomFieldsManager 
                  boardId={board.id!} 
                  definitions={board.customFieldDefinitions || []} 
                />
              </div>
            )}

            {activeTab === "sync" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/30">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-600 text-white rounded-lg">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-blue-900 dark:text-blue-200">Exportar para Calendário</h3>
                      <p className="text-xs text-blue-700/60 dark:text-blue-300/60">Sincronize seus cartões com Apple, Google ou Outlook.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      if (board && cards) {
                        const ics = generateICalString(board, cards);
                        downloadICalFile(board.title, ics);
                      }
                    }}
                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Baixar Arquivo .ics
                  </button>
                  <p className="mt-3 text-[10px] text-center text-blue-500 font-medium">
                    * Importe este arquivo no seu aplicativo de calendário favorito.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "data" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-1 gap-4">
                  {/* JSON Export */}
                  <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-white/5">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-1">Backup Completo (JSON)</h3>
                    <p className="text-xs text-gray-500 mb-4">Exporta toda a estrutura do quadro, incluindo listas, cards e configurações.</p>
                    <button 
                      onClick={() => {
                        if (board && lists && cards) {
                          const json = exportBoardToJSON(board, lists, cards);
                          downloadFile(json, `${board.title}_backup.json`, "application/json");
                        }
                      }}
                      className="w-full py-2 bg-slate-700 text-white rounded-lg font-bold text-xs hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                    >
                      Exportar JSON
                    </button>
                  </div>

                  {/* CSV Export */}
                  <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-white/5">
                    <h3 className="text-sm font-bold text-gray-800 dark:text-white mb-1">Planilha de Cartões (CSV)</h3>
                    <p className="text-xs text-gray-500 mb-4">Ideal para análise no Excel ou Google Sheets. Inclui campos customizados.</p>
                    <button 
                      onClick={() => {
                        if (board && lists && cards) {
                          const csv = exportBoardToCSV(board, lists, cards);
                          downloadFile(csv, `${board.title}_cartoes.csv`, "text/csv");
                        }
                      }}
                      className="w-full py-2 bg-green-600 text-white rounded-lg font-bold text-xs hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                    >
                      Exportar CSV
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-white/5 flex justify-end">
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-lg active-shrink"
            >
              {scribeMode ? 'Assim seja' : 'Pronto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

