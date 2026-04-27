import React from "react";
import { useTheme } from "../contexts/ThemeContext";

interface SettingsModalProps {
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ onClose }) => {
  const { theme, toggleTheme, scribeMode, toggleScribeMode } = useTheme();

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-white/10 animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50 dark:bg-slate-800/50">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Configurações
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Apelo Visual / Tema */}
          <section>
            <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Aparência</h3>
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
                  <p className="font-bold text-gray-700 dark:text-gray-200">Modo Escuro</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Alternar visual da interface</p>
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

          {/* Modo Escriba Sumeriano */}
          <section>
            <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">Experiência</h3>
            <div className={`p-4 rounded-xl border transition-all ${scribeMode ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-500/30' : 'bg-gray-50 dark:bg-slate-800 border-gray-100 dark:border-white/5'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${scribeMode ? 'bg-amber-500/20 text-amber-600' : 'bg-gray-500/20 text-gray-500'}`}>
                    <span className="text-xl">🏺</span>
                  </div>
                  <div>
                    <p className="font-bold text-gray-700 dark:text-gray-200 uppercase tracking-tight">Modo Escriba Sumeriano</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Ativar nomenclatura e visual de Argila (Antigravity)</p>
                  </div>
                </div>
                <button 
                  onClick={toggleScribeMode}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${scribeMode ? 'bg-amber-500' : 'bg-gray-300'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${scribeMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              {scribeMode && (
                <div className="mt-4 p-3 bg-white/50 dark:bg-slate-900/50 rounded-lg text-[10px] text-amber-800 dark:text-amber-300 font-mono leading-relaxed border border-amber-100 dark:border-amber-900/30 animate-in fade-in slide-in-from-top-1 duration-300">
                  <div className="flex justify-between items-center mb-1 pb-1 border-b border-amber-100 dark:border-amber-800/50">
                    <span className="font-bold italic">Dicionário de Puzriš-Dagān</span>
                    <span className="opacity-50 tracking-widest">UR III</span>
                  </div>
                  <ul className="grid grid-cols-2 gap-x-4 gap-y-1">
                    <li><span className="opacity-60">Board:</span> <strong>Tábua</strong></li>
                    <li><span className="opacity-60">Card:</span> <strong>Selo</strong></li>
                    <li><span className="opacity-60">List:</span> <strong>Coluna de Ur</strong></li>
                    <li><span className="opacity-60">Notification:</span> <strong>Decreto</strong></li>
                  </ul>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="p-6 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-white/5 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all shadow-lg active-shrink"
          >
            Pronto
          </button>
        </div>
      </div>
    </div>
  );
};
