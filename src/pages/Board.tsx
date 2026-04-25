import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const BoardPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-blue-500 flex flex-col">
      <nav className="bg-black/20 backdrop-blur-sm px-4 py-3 flex justify-between items-center text-white">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/")}
            className="hover:bg-white/20 p-1.5 rounded transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <span className="font-bold text-lg">Quadro {id}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm bg-white/20 px-2 py-1 rounded">
            {user?.displayName}
          </span>
        </div>
      </nav>
      
      <main className="flex-1 p-4 overflow-x-auto">
        <div className="flex gap-4 items-start h-full">
          {/* Lists will go here later */}
          <div className="w-72 flex-shrink-0">
            <button className="bg-white/20 hover:bg-white/30 text-white w-full text-left px-4 py-3 rounded-lg flex items-center gap-2 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Adicionar outra lista
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
