import { useState, useEffect } from "react";
import { getAllUsers, updateUserRoleAndLimit, deleteUserDocument } from "../services/userService";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import type { UserProfile } from "../types";

export const AdminPanel = () => {
  const { user } = useAuth();
  const { scribeMode } = useTheme();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Hardcode a check for admins, or just allow the current user to promote themselves for testing
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const allUsers = await getAllUsers();
        setUsers(allUsers);
        
        // Check if current user is admin
        const currentUserProfile = allUsers.find(u => u.uid === user?.uid);
        if (currentUserProfile?.role === 'admin') {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchUsers();
    }
  }, [user]);

  const handleSaveLimit = async (targetUserId: string, role: 'admin' | 'user', limitMB: number) => {
    setSavingId(targetUserId);
    try {
      const bytes = limitMB * 1024 * 1024; // convert MB to Bytes
      await updateUserRoleAndLimit(targetUserId, role, bytes);
      
      // Update local state
      setUsers(users.map(u => u.uid === targetUserId ? { ...u, role, storageLimit: bytes } : u));
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Erro ao salvar limites.");
    } finally {
      setSavingId(null);
    }
  };

  const handleSelfPromote = async () => {
    if (!user) return;
    try {
      await updateUserRoleAndLimit(user.uid, 'admin', 50 * 1024 * 1024);
      setIsAdmin(true);
      // Re-fetch users so the table is populated correctly
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (err: unknown) {
      alert("Erro ao se promover: " + (err instanceof Error ? err.message : "Erro desconhecido"));
    }
  };

  const handleDelete = async (targetUserId: string) => {
    if (confirm("Tem certeza que deseja apagar os dados deste usuário? Esta ação não pode ser desfeita.")) {
      try {
        await deleteUserDocument(targetUserId);
        setUsers(users.filter(u => u.uid !== targetUserId));
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Erro ao excluir usuário.");
      }
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando painel...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Acesso Restrito</h1>
        <p className="text-gray-600 mb-6">Você precisa ser um Administrador (Dono da Conta) para acessar esta área.</p>
        
        {/* Helper for testing */}
        <button 
          onClick={handleSelfPromote}
          className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700"
        >
          Tornar-me Admin (Apenas para Testes)
        </button>
        <button 
          onClick={() => navigate('/')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Voltar ao Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${scribeMode ? 'text-theme-main' : 'text-gray-900'}`}>
            Gestão de Usuários (Limites de Armazenamento)
          </h1>
          <button 
            onClick={() => navigate('/')}
            className="text-blue-600 hover:underline font-medium"
          >
            Voltar
          </button>
        </div>

        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consumo Atual</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cota (Limite)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Papel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(u => (
                <UserRow 
                  key={u.uid} 
                  userProfile={u} 
                  isSaving={savingId === u.uid}
                  onSave={handleSaveLimit} 
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const UserRow = ({ 
  userProfile, 
  isSaving,
  onSave,
  onDelete
}: { 
  userProfile: UserProfile, 
  isSaving: boolean,
  onSave: (uid: string, role: 'admin'|'user', limitMB: number) => void,
  onDelete: (uid: string) => void
}) => {
  const [role, setRole] = useState<'admin'|'user'>(userProfile.role || 'user');
  const currentLimitMB = userProfile.storageLimit ? Math.round(userProfile.storageLimit / (1024 * 1024)) : 0;
  const [limitMB, setLimitMB] = useState<number>(currentLimitMB || 50); // Default 50MB in UI

  const currentUsageBytes = userProfile.storageMetrics?.totalBytes || 0;
  const currentUsageMB = (currentUsageBytes / (1024 * 1024)).toFixed(2);
  
  let percentage = 0;
  if (userProfile.storageLimit && userProfile.storageLimit > 0) {
    percentage = Math.min(100, Math.round((currentUsageBytes / userProfile.storageLimit) * 100));
  }

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            {userProfile.photoURL ? (
              <img className="h-10 w-10 rounded-full" src={userProfile.photoURL} alt="" />
            ) : (
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold uppercase">
                {userProfile.displayName.charAt(0)}
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{userProfile.displayName}</div>
            <div className="text-sm text-gray-500">{userProfile.email}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{currentUsageMB} MB</div>
        <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
          <div className={`h-1.5 rounded-full ${percentage > 90 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${percentage}%` }}></div>
        </div>
        <div className="text-[10px] text-gray-500 mt-0.5">{percentage}% do limite</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-1">
          <input 
            type="number" 
            value={limitMB}
            onChange={(e) => setLimitMB(Number(e.target.value))}
            className="w-20 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
          />
          <span className="text-sm text-gray-500">MB</span>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <select 
          value={role}
          onChange={(e) => setRole(e.target.value as 'admin'|'user')}
          className="text-sm border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="user">Usuário</option>
          <option value="admin">Administrador</option>
        </select>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-2">
        <button 
          onClick={() => onSave(userProfile.uid, role, limitMB)}
          disabled={isSaving}
          className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded hover:bg-blue-100 transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Salvando...' : 'Salvar'}
        </button>
        <button 
          onClick={() => onDelete(userProfile.uid)}
          className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded hover:bg-red-100 transition-colors"
          title="Excluir Usuário"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </td>
    </tr>
  );
};
