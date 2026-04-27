import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import { useTheme } from "../contexts/ThemeContext";
import { NotificationBell } from "../components/NotificationBell";
import { createBoard, subscribeToBoards, archiveBoard, restoreBoard, updateBoardTitle } from "../services/boardService";
import { subscribeToLists } from "../services/listService";
import { updateDashboardBackground, getUserSettings } from "../services/userService";
import { COLORS, GRADIENTS } from "../constants/design";
import type { Board, List } from "../types";

const BoardCard = ({ board, onArchive, onRestore }: { 
  board: Board, 
  onArchive: (e: React.MouseEvent, id: string) => void,
  onRestore: (e: React.MouseEvent, id: string) => void 
}) => {
  const navigate = useNavigate();
  const [lists, setLists] = useState<List[]>([]);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(board.title);
  const isSavingRef = useRef(false);

  useEffect(() => {
    if (!board.id) return;
    const unsubscribe = subscribeToLists(board.id, (fetchedLists) => {
      setLists(fetchedLists);
    });
    return () => unsubscribe();
  }, [board.id]);

  useEffect(() => {
    if (!isEditingTitle) setTitleDraft(board.title);
  }, [board.title, isEditingTitle]);

  const startEditTitle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    isSavingRef.current = false;
    setTitleDraft(board.title);
    setIsEditingTitle(true);
  };

  const saveTitle = async (draft: string) => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setIsEditingTitle(false);
    const trimmed = draft.trim();
    if (!trimmed || trimmed === board.title) { isSavingRef.current = false; return; }
    try {
      await updateBoardTitle(board.id!, trimmed);
    } catch (error) {
      console.error("Erro ao renomear quadro:", error);
    } finally {
      isSavingRef.current = false;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); saveTitle(e.currentTarget.value); }
    if (e.key === "Escape") { setIsEditingTitle(false); setTitleDraft(board.title); }
  };

  const boardBg = board.background || "bg-blue-600";
  const isGradient = boardBg.startsWith("from-");

  return (
    <div 
      onClick={() => !isEditingTitle && navigate(`/board/${board.id}`)}
      className={`${board.archived ? "bg-theme-surface grayscale opacity-75" : (isGradient ? `bg-gradient-to-br ${boardBg}` : "bg-blue-600")} rounded-lg h-32 p-4 cursor-pointer transition-all shadow-sm group relative flex flex-col justify-between overflow-hidden border border-theme hover-lift active-shrink animate-slide-up`}
      style={!isGradient && !board.archived && board.background ? { backgroundColor: board.background } : {}}
    >
      <div>
        {isEditingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={(e) => saveTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-lg font-bold bg-white/20 text-white border border-white/30 rounded px-2 py-0.5 w-full focus:outline-none focus:ring-2 focus:ring-white"
          />
        ) : (
          <div className="flex items-start gap-1 pr-8">
            <h3 className="text-white font-bold text-lg truncate flex-1">{board.title}</h3>
            {!board.archived && (
              <button
                onClick={startEditTitle}
                className="shrink-0 p-1 text-white/50 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-white/20 rounded transition-all mt-0.5"
                title="Renomear quadro"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
          </div>
        )}
        {lists.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1 opacity-80">
            {lists.slice(0, 3).map(list => (
              <span key={list.id} className="text-xs bg-white/20 text-white px-2 py-0.5 rounded truncate max-w-full">
                {list.title}
              </span>
            ))}
          </div>
        )}
        {board.archived && <span className="text-[10px] bg-black/20 text-white px-2 py-0.5 rounded mt-2 inline-block">Arquivado</span>}
      </div>

      {!isEditingTitle && (
        <div className="absolute top-3 right-3 flex gap-1">
          {board.archived ? (
            <button
              onClick={(e) => onRestore(e, board.id!)}
              className="p-1.5 text-white bg-green-600 hover:bg-green-700 rounded transition-all shadow-sm"
              title="Restaurar quadro"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </button>
          ) : (
            <button
              onClick={(e) => onArchive(e, board.id!)}
              className="p-1.5 text-white/50 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-white/20 rounded transition-all"
              title="Arquivar quadro"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const { showNotification } = useNotification();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [boards, setBoards] = useState<Board[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [searchBoard, setSearchBoard] = useState("");
  const [dashboardBg, setDashboardBg] = useState<string>("");
  const [showBgMenu, setShowBgMenu] = useState(false);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToBoards(user.uid, (fetchedBoards) => {
      setBoards(fetchedBoards);
    });
    
    // Load user settings
    getUserSettings(user.uid).then(settings => {
      if (settings?.dashboardBackground) {
        setDashboardBg(settings.dashboardBackground);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim() || !user) return;
    
    try {
      const boardId = await createBoard(newBoardTitle, user.uid);
      setIsCreating(false);
      setNewBoardTitle("");
      showNotification(`Quadro "${newBoardTitle}" criado!`);
      navigate(`/board/${boardId}`);
    } catch (error) {
      console.error("Error creating board:", error);
      showNotification("Falha ao criar quadro.", "error");
    }
  };

  const handleArchiveBoard = async (e: React.MouseEvent, boardId: string) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja arquivar este quadro? Ele não aparecerá mais na sua lista padrão.")) {
      try {
        await archiveBoard(boardId);
        showNotification("Quadro arquivado.");
      } catch (error) {
        console.error("Erro ao arquivar quadro:", error);
      }
    }
  };

  const handleRestoreBoard = async (e: React.MouseEvent, boardId: string) => {
    e.stopPropagation();
    try {
      await restoreBoard(boardId);
      showNotification("Quadro restaurado!");
    } catch (error) {
      console.error("Erro ao restaurar quadro:", error);
    }
  };

  const handleUpdateDashboardBg = async (bg: string) => {
    if (!user) return;
    setDashboardBg(bg);
    setShowBgMenu(false);
    try {
      await updateDashboardBackground(user.uid, bg);
      showNotification("Plano de fundo do Dashboard atualizado!");
    } catch (error) {
      console.error("Erro ao atualizar fundo:", error);
    }
  };

  const visibleBoards = boards
    .filter(b => showArchived || !b.archived)
    .filter(b => b.title.toLowerCase().includes(searchBoard.toLowerCase()));
  const isGradient = dashboardBg.startsWith("from-");

  return (
    <div 
      className={`min-h-screen transition-all duration-500 ${theme === 'dark' ? 'bg-theme-page' : (isGradient ? `bg-gradient-to-br ${dashboardBg}` : 'bg-theme-page')}`}
      style={!isGradient && theme !== 'dark' && dashboardBg ? { backgroundColor: dashboardBg } : {}}
    >
      <nav className={`relative z-50 ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-blue-600'} backdrop-blur-md px-4 py-3 shadow-md flex justify-between items-center text-white transition-colors duration-300`}>
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span className="text-xl font-bold tracking-wide">Enki</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all active-shrink"
            title={theme === "light" ? "Mudar para Dark Mode" : "Mudar para Light Mode"}
          >
            {theme === "light" ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 18v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            )}
          </button>
          
          <NotificationBell />

          <div className="relative">
            <button 
              onClick={() => setShowBgMenu(!showBgMenu)}
              className={`p-2 rounded-full transition-all ${showBgMenu ? "bg-white text-blue-600" : "text-white/80 hover:text-white hover:bg-white/10"}`}
              title="Personalizar Dashboard"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </button>

            {showBgMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-[100] p-4 animate-in fade-in zoom-in-95 duration-200">
                <h4 className="text-gray-800 font-bold text-sm mb-3">Fundo do Dashboard</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-gray-400 text-center font-medium uppercase tracking-widest">Enki Premium v0.8.0.0</p>
                    <span className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Gradientes Premium</span>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleUpdateDashboardBg("")}
                        className={`h-12 rounded-lg bg-gray-100 border-2 ${!dashboardBg ? 'border-blue-500' : 'border-transparent'} transition-all text-gray-400 text-[10px] font-bold`}
                      >
                        PADRÃO
                      </button>
                      {GRADIENTS.map(g => (
                        <button
                          key={g.value}
                          onClick={() => handleUpdateDashboardBg(g.value)}
                          className={`h-12 rounded-lg bg-gradient-to-br ${g.value} border-2 ${dashboardBg === g.value ? 'border-blue-500 scale-95' : 'border-transparent hover:scale-105'} transition-all`}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Cores Sólidas</span>
                    <div className="grid grid-cols-4 gap-2">
                      {COLORS.map(c => (
                        <button
                          key={c.value}
                          onClick={() => handleUpdateDashboardBg(c.value)}
                          className={`h-8 rounded-md border-2 ${dashboardBg === c.value ? 'border-blue-500 scale-95' : 'border-transparent hover:scale-110'} transition-all`}
                          style={{ backgroundColor: c.value }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <span className="text-sm font-medium hidden sm:block">{user?.displayName}</span>
          {user?.photoURL && (
            <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-white/30" />
          )}
          <button 
            onClick={logout}
            className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-md transition-colors active-shrink"
          >
            Sair
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
            <h1 className={`text-3xl font-bold transition-colors ${isGradient || (dashboardBg && theme !== 'dark') ? 'text-white drop-shadow-md' : 'text-theme-main'}`}>
              Seus Quadros
            </h1>
            
            {/* Search Input */}
            <div className="relative w-full sm:w-64 group">
              <input 
                type="text"
                placeholder="Buscar quadros..."
                value={searchBoard}
                onChange={(e) => setSearchBoard(e.target.value)}
                className="w-full bg-white/10 hover:bg-white/20 focus:bg-white text-white focus:text-gray-900 border border-white/20 focus:border-blue-500 rounded-lg pl-9 pr-3 py-2 transition-all outline-none text-sm placeholder-white/60 focus:placeholder-gray-400"
              />
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/60 group-focus-within:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchBoard && (
                <button 
                  onClick={() => setSearchBoard("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white focus:text-gray-400"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
          </div>

          <button 
            onClick={() => setShowArchived(!showArchived)}
            className={`text-sm px-4 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
              showArchived ? "bg-white/90 text-blue-700 shadow-lg" : "bg-white/20 text-white border border-white/30 hover:bg-white/30"
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
            {showArchived ? "Ocultar Arquivados" : "Mostrar Arquivados"}
          </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {!isCreating && !showArchived && (
            <div 
              onClick={() => setIsCreating(true)}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg h-32 flex items-center justify-center cursor-pointer transition-all border-2 border-dashed border-white/30 group hover-lift active-shrink animate-slide-up"
            >
              <span className="text-white font-medium flex items-center gap-2 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Criar novo quadro
              </span>
            </div>
          )}
          {isCreating && !showArchived && (
            <div className="bg-white p-4 rounded-lg shadow-xl h-32 border border-gray-100 flex flex-col justify-between animate-in zoom-in-95 duration-200">
              <form onSubmit={handleCreateBoard} className="flex flex-col h-full justify-between">
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Título do quadro" 
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button 
                    type="button" 
                    onClick={() => setIsCreating(false)}
                    className="text-gray-500 hover:text-gray-700 text-sm px-2"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={!newBoardTitle.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1.5 rounded-md disabled:opacity-50"
                  >
                    Criar
                  </button>
                </div>
              </form>
            </div>
          )}

          {visibleBoards.map(board => (
            <BoardCard key={board.id} board={board} onArchive={handleArchiveBoard} onRestore={handleRestoreBoard} />
          ))}
        </div>
      </main>
    </div>
  );
};
