import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { createBoard, subscribeToBoards, deleteBoard } from "../services/boardService";
import type { Board } from "../types";

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [boards, setBoards] = useState<Board[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToBoards(user.uid, (fetchedBoards) => {
      setBoards(fetchedBoards);
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
      navigate(`/board/${boardId}`);
    } catch (error) {
      console.error("Error creating board:", error);
    }
  };

  const handleDeleteBoard = async (e: React.MouseEvent, boardId: string) => {
    e.stopPropagation();
    if (confirm("Tem certeza que deseja excluir este quadro? Todos os dados serão perdidos.")) {
      try {
        await deleteBoard(boardId);
      } catch (error) {
        console.error("Erro ao excluir quadro:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 px-4 py-3 shadow-md flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span className="text-xl font-bold tracking-wide">Ollert</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium hidden sm:block">{user?.displayName}</span>
          {user?.photoURL && (
            <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-blue-400" />
          )}
          <button 
            onClick={logout}
            className="text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1.5 rounded-md transition-colors"
          >
            Sair
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Seus Quadros</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* Create Board Card */}
          {!isCreating ? (
            <div 
              onClick={() => setIsCreating(true)}
              className="bg-gray-200/50 hover:bg-gray-200 rounded-lg h-32 flex items-center justify-center cursor-pointer transition-colors border-2 border-dashed border-gray-300"
            >
              <span className="text-gray-600 font-medium flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Criar novo quadro
              </span>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg shadow-md h-32 border border-gray-200 flex flex-col justify-between">
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

          {/* List existing boards */}
          {boards.map(board => (
            <div 
              key={board.id}
              onClick={() => navigate(`/board/${board.id}`)}
              className="bg-blue-600 hover:bg-blue-700 rounded-lg h-32 p-4 cursor-pointer transition-colors shadow-sm group relative flex flex-col justify-between"
            >
              <h3 className="text-white font-bold text-lg group-hover:underline pr-8">{board.title}</h3>
              <button
                onClick={(e) => handleDeleteBoard(e, board.id!)}
                className="absolute top-3 right-3 p-1.5 text-blue-200 opacity-0 group-hover:opacity-100 hover:text-white hover:bg-blue-800/50 rounded transition-all"
                title="Excluir quadro"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};
