import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { getUserProfile, updateUserProfile, getUserStats, type UserStats } from "../services/userService";
import { isUserOnline } from "../services/presenceService";
import type { UserProfile } from "../types";

export const Profile = () => {
  const { uid } = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme, scribeMode } = useTheme();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // Edit forms
  const [bio, setBio] = useState("");
  const [title, setTitle] = useState("");

  const isOwnProfile = user?.uid === uid;

  useEffect(() => {
    if (!uid) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [profileData, statsData] = await Promise.all([
          getUserProfile(uid),
          getUserStats(uid)
        ]);
        
        if (profileData) {
          setProfile(profileData);
          setBio(profileData.bio || "");
          setTitle(profileData.title || "");
        }
        setStats(statsData);
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [uid]);

  const handleSave = async () => {
    if (!uid || !isOwnProfile) return;
    try {
      await updateUserProfile(uid, { bio, title });
      if (profile) {
        setProfile({ ...profile, bio, title });
      }
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${scribeMode ? 'bg-theme-page text-theme-main' : (theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900')}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${scribeMode ? 'bg-theme-page text-theme-main' : (theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900')}`}>
        <h2 className="text-2xl font-bold mb-4">{scribeMode ? 'Escriba Não Encontrado' : 'Usuário Não Encontrado'}</h2>
        <button onClick={() => navigate('/')} className="text-blue-600 hover:underline">
          {scribeMode ? 'Retornar ao Centro de Ur' : 'Voltar ao Dashboard'}
        </button>
      </div>
    );
  }

  const online = isUserOnline(profile.lastSeen, profile.isOnline);

  return (
    <div className={`min-h-screen transition-all duration-500 ${scribeMode ? 'bg-theme-page text-theme-main' : (theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-gray-50 text-gray-900')}`}>
      {/* Navbar */}
      <nav className={`relative z-50 ${scribeMode ? 'bg-amber-900/60' : (theme === 'dark' ? 'bg-slate-800' : 'bg-blue-600')} backdrop-blur-md px-4 py-3 shadow-md flex items-center text-white`}>
        <button 
          onClick={() => navigate("/")}
          className="hover:bg-white/20 p-1.5 rounded transition-colors mr-4"
          title={scribeMode ? "Voltar ao Centro de Ur" : "Voltar ao Dashboard"}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <h1 className="font-bold text-lg">{scribeMode ? 'Crônica do Escriba' : 'Perfil do Usuário'}</h1>
      </nav>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className={`rounded-xl shadow-lg p-6 md:p-8 mb-8 ${scribeMode ? 'bg-theme-surface border border-theme' : (theme === 'dark' ? 'bg-slate-800' : 'bg-white')}`}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              {profile.photoURL ? (
                <img src={profile.photoURL} alt={profile.displayName} className="w-32 h-32 rounded-full object-cover border-4 border-blue-100 shadow-md" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-4xl font-bold uppercase shadow-md border-4 border-white">
                  {profile.displayName.charAt(0)}
                </div>
              )}
              {/* Presence Indicator */}
              <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-4 ${scribeMode ? 'border-theme-surface' : (theme === 'dark' ? 'border-slate-800' : 'border-white')} ${online ? 'bg-green-500' : 'bg-gray-400'}`} title={online ? 'Online' : 'Offline'} />
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left w-full">
              <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
                <div>
                  <h1 className="text-3xl font-bold mb-1">{profile.displayName}</h1>
                  <p className={`text-sm mb-4 ${scribeMode ? 'text-theme-secondary' : 'text-gray-500'}`}>{profile.email}</p>
                </div>
                
                {isOwnProfile && !isEditing && (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${scribeMode ? 'bg-amber-100 text-amber-900 hover:bg-amber-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {scribeMode ? 'Reescrever Crônica' : 'Editar Perfil'}
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4 max-w-lg mx-auto md:mx-0 mt-4 animate-in fade-in slide-in-from-top-2">
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-1 ${scribeMode ? 'text-theme-secondary' : 'text-gray-500'}`}>
                      {scribeMode ? 'Título de Ofício' : 'Título'}
                    </label>
                    <input 
                      type="text" 
                      value={title} 
                      onChange={e => setTitle(e.target.value)} 
                      placeholder={scribeMode ? "Ex: Sumo Sacerdote, Aprendiz..." : "Ex: Desenvolvedor, Designer..."}
                      className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${scribeMode ? 'bg-theme-card border-theme text-theme-main' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase mb-1 ${scribeMode ? 'text-theme-secondary' : 'text-gray-500'}`}>
                      {scribeMode ? 'História' : 'Biografia'}
                    </label>
                    <textarea 
                      value={bio} 
                      onChange={e => setBio(e.target.value)} 
                      rows={3}
                      placeholder={scribeMode ? "Escreva sua história nas tábuas..." : "Fale um pouco sobre você..."}
                      className={`w-full px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${scribeMode ? 'bg-theme-card border-theme text-theme-main' : 'bg-gray-50 border border-gray-200 text-gray-900'}`}
                    />
                  </div>
                  <div className="flex gap-2 justify-center md:justify-start">
                    <button 
                      onClick={handleSave}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-md"
                    >
                      {scribeMode ? 'Selar Palavras' : 'Salvar Alterações'}
                    </button>
                    <button 
                      onClick={() => {
                        setBio(profile.bio || "");
                        setTitle(profile.title || "");
                        setIsEditing(false);
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${scribeMode ? 'hover:bg-theme-card text-theme-secondary' : 'hover:bg-gray-100 text-gray-500'}`}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-2">
                  {profile.title && (
                    <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 ${scribeMode ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                      {profile.title}
                    </div>
                  )}
                  {profile.bio ? (
                    <p className={`whitespace-pre-wrap ${scribeMode ? 'text-theme-main' : 'text-gray-700'}`}>
                      {profile.bio}
                    </p>
                  ) : (
                    <p className={`italic ${scribeMode ? 'text-theme-secondary' : 'text-gray-400'}`}>
                      {scribeMode ? 'Nenhum registro encontrado nas ruínas.' : 'Nenhuma biografia fornecida.'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <h2 className={`text-xl font-bold mb-4 px-2 ${scribeMode ? 'text-theme-main' : 'text-gray-800'}`}>
          {scribeMode ? 'Visões do Zigurate' : 'Estatísticas'}
        </h2>
        
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className={`p-4 rounded-xl shadow-sm border ${scribeMode ? 'bg-theme-surface border-theme' : (theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100')}`}>
              <div className="flex items-center gap-2 mb-2">
                <svg className={`w-5 h-5 ${scribeMode ? 'text-amber-600' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                <h3 className={`text-xs font-bold uppercase tracking-wider ${scribeMode ? 'text-theme-secondary' : 'text-gray-500'}`}>
                  {scribeMode ? 'Tábuas' : 'Quadros'}
                </h3>
              </div>
              <p className="text-3xl font-extrabold">{stats.boardsCount}</p>
            </div>

            <div className={`p-4 rounded-xl shadow-sm border ${scribeMode ? 'bg-theme-surface border-theme' : (theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100')}`}>
              <div className="flex items-center gap-2 mb-2">
                <svg className={`w-5 h-5 ${scribeMode ? 'text-amber-600' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                <h3 className={`text-xs font-bold uppercase tracking-wider ${scribeMode ? 'text-theme-secondary' : 'text-gray-500'}`}>
                  {scribeMode ? 'Selos Criados' : 'Cartões Criados'}
                </h3>
              </div>
              <p className="text-3xl font-extrabold">{stats.cardsCreated}</p>
            </div>

            <div className={`p-4 rounded-xl shadow-sm border ${scribeMode ? 'bg-theme-surface border-theme' : (theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100')}`}>
              <div className="flex items-center gap-2 mb-2">
                <svg className={`w-5 h-5 ${scribeMode ? 'text-amber-600' : 'text-purple-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                <h3 className={`text-xs font-bold uppercase tracking-wider ${scribeMode ? 'text-theme-secondary' : 'text-gray-500'}`}>
                  {scribeMode ? 'Selos Cumpridos' : 'Cartões Concluídos'}
                </h3>
              </div>
              <p className="text-3xl font-extrabold">{stats.cardsCompleted}</p>
            </div>

            <div className={`p-4 rounded-xl shadow-sm border ${scribeMode ? 'bg-theme-surface border-theme' : (theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100')}`}>
              <div className="flex items-center gap-2 mb-2">
                <svg className={`w-5 h-5 ${scribeMode ? 'text-amber-600' : 'text-orange-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h3 className={`text-xs font-bold uppercase tracking-wider ${scribeMode ? 'text-theme-secondary' : 'text-gray-500'}`}>
                  {scribeMode ? 'Dias de Serviço' : 'Dias Ativos'}
                </h3>
              </div>
              <p className="text-3xl font-extrabold">{stats.daysActive}</p>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};
