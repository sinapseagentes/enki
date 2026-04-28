import React, { useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import type { Tag, Board } from "../types";
import { updateBoardTags, updateBoardPermissions } from "../services/boardService";
import { COLORS } from "../constants/design";

interface SettingsModalProps {
  onClose: () => void;
  board?: Board;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose, board }) => {
  const { theme, toggleTheme, scribeMode, toggleScribeMode } = useTheme();
  const [newTagName, setNewTagName] = useState("");
  const [selectedColor, setSelectedColor] = useState(COLORS[0].value);

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
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-white/10 animate-in fade-in zoom-in-95 duration-200 my-8">
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {scribeMode ? 'Configurações de Ur' : 'Configurações'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Apelo Visual / Tema */}
          <section>
            <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">{scribeMode ? 'Estética' : 'Aparência'}</h3>
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-blue-500/20 text-blue-400' : 'bg-yellow-500/20 text-yellow-600'}`}>
                  {theme === 'dark' ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 18v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  )}
                </div>
                <div>
                  <p className="font-bold text-gray-700 dark:text-gray-200">{scribeMode ? 'Crepúsculo' : 'Modo Escuro'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{scribeMode ? 'Alternar claridade da Tábua' : 'Alternar visual da interface'}</p>
                </div>
              </div>
              <button 
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${theme === 'dark' ? 'bg-blue-600' : 'bg-gray-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </section>

          {/* Tags Management */}
          {board && (
            <section>
              <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">{scribeMode ? 'Sinetes (Etiquetas)' : 'Gerenciar Tags'}</h3>
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
                  {(board.tags || []).map(tag => (
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
                  {(board.tags || []).length === 0 && (
                    <p className="text-[10px] italic opacity-40">{scribeMode ? 'Nenhum sinete esculpido.' : 'Sem tags criadas.'}</p>
                  )}
                </div>
              </div>
            </section>
          )}
          
          {/* Permissions Management */}
          {board && (
            <section>
              <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">{scribeMode ? 'Hierarquia de Ur' : 'Gerenciar Permissões'}</h3>
              <div className="space-y-4">
                {board.permissions && Object.entries(board.permissions).map(([userId, permission]) => (
                  <div key={userId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-white/10">
                    <div className="flex items-center gap-3">
                      {/* User Avatar/Initials */}
                      <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                        {userId.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-200">Usuário {userId.substring(0, 8)}...</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{permission}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handlePermissionChange(userId, 'owner')}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all ${permission === 'owner' ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-600 hover:bg-blue-200'}`}
                        disabled={permission === 'owner' && Object.values(board.permissions || {}).filter(p => p === 'owner').length <= 1}
                        title={permission === 'owner' && Object.values(board.permissions || {}).filter(p => p === 'owner').length <= 1 ? 'Deixar apenas um owner' : 'Definir como Dono'}
                      >
                        Dono
                      </button>
                      <button
                        onClick={() => handlePermissionChange(userId, 'admin')}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all ${permission === 'admin' ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'}`}
                        title={permission === 'admin' ? 'Definir como Administrador' : 'Definir como Administrador'}
                      >
                        Admin
                      </button>
                      <button
                        onClick={() => handlePermissionChange(userId, 'editor')}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all ${permission === 'editor' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
                        title={permission === 'editor' ? 'Definir como Editor' : 'Definir como Editor'}
                      >
                        Editor
                      </button>
                      <button
                        onClick={() => handlePermissionChange(userId, 'viewer')}
                        className={`px-2 py-1 rounded text-xs font-medium transition-all ${permission === 'viewer' ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        title={permission === 'viewer' ? 'Definir como Visualizador' : 'Definir como Visualizador'}
                      >
                        Viewer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Modo Escriba Sumeriano */}
          <section>
            <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">{scribeMode ? 'Ancestralidade' : 'Experiência'}</h3>
            <div className={`p-4 rounded-xl border transition-all ${scribeMode ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-500/30' : 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-white/5'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${scribeMode ? 'bg-amber-500/20 text-amber-600' : 'bg-gray-500/20 text-gray-500'}`}>
                    <span className="text-xl">🏺</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight">Modo Escriba</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{scribeMode ? 'Retornar ao presente' : 'Ativar alma de Ur'}</p>
                  </div>
                </div>
                <button 
                  onClick={toggleScribeMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${scribeMode ? 'bg-amber-500' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${scribeMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          </section>
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
  );
};

