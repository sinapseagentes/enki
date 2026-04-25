import { useAuth } from "../contexts/AuthContext";

export const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-blue-600 px-4 py-3 shadow-md flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <span className="text-xl font-bold">Ollert</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">{user?.displayName}</span>
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
        {/* Placeholder for boards list */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div className="bg-gray-200/50 hover:bg-gray-200 rounded-lg h-32 flex items-center justify-center cursor-pointer transition-colors border-2 border-dashed border-gray-300">
            <span className="text-gray-600 font-medium flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Criar novo quadro
            </span>
          </div>
        </div>
      </main>
    </div>
  );
};
