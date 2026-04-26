import { useState, useEffect } from "react";
import type { Card, ChecklistItem, Comment, Attachment, Board } from "../types";
import { updateCard } from "../services/cardService";
import { addComment, subscribeToComments } from "../services/commentService";
import { uploadFile } from "../services/storageService";
import { logActivity } from "../services/activityService";
import { sendNotification } from "../services/notificationService";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import confetti from "canvas-confetti";

interface CardModalProps {
  card: Card;
  board?: Board;
  onClose: () => void;
}

const COLORS = [
  "#f87171", // red
  "#fb923c", // orange
  "#facc15", // yellow
  "#4ade80", // green
  "#60a5fa", // blue
  "#c084fc", // purple
  "#a8a29e", // gray
];

export const CardModal = ({ card, board, onClose }: CardModalProps) => {
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [colorLabel, setColorLabel] = useState(card.colorLabel || "");
  const [dueDate, setDueDate] = useState(
    card.dueDate ? new Date(card.dueDate).toISOString().slice(0, 16) : ""
  );
  const [checklists, setChecklists] = useState<ChecklistItem[]>(card.checklists || []);
  const [attachments, setAttachments] = useState<Attachment[]>(card.attachments || []);
  const [coverUrl, setCoverUrl] = useState(card.coverUrl || "");
  const [newItemTitle, setNewItemTitle] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Subscribe to comments
  useEffect(() => {
    if (!card.id) return;
    const unsubscribe = subscribeToComments(card.id, (fetched) => {
      setComments(fetched);
    });
    return () => unsubscribe();
  }, [card.id]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setIsSaving(true);
    try {
      await updateCard(card.id!, {
        title,
        description,
        colorLabel: colorLabel || "",
        dueDate: dueDate ? new Date(dueDate).getTime() : undefined,
        checklists,
        attachments,
        coverUrl,
      });
      showNotification("Cartão atualizado com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao salvar cartão:", error);
      showNotification("Falha ao salvar as alterações.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !card.id) return;

    try {
      await addComment({
        cardId: card.id,
        boardId: card.boardId,
        userId: user.uid,
        userName: user.displayName || "Usuário",
        userPhoto: user.photoURL || null,
        text: newComment.trim(),
      });

      await logActivity({
        boardId: card.boardId,
        userId: user.uid,
        userName: user.displayName || "Usuário",
        type: "comment_added",
        details: { 
          cardTitle: card.title,
          text: newComment.trim().substring(0, 50) + (newComment.length > 50 ? "..." : "")
        }
      });

      // Notify other members
      if (board?.members) {
        const others = board.members.filter(m => m !== user.uid);
        others.forEach(memberId => {
          sendNotification({
            userId: memberId,
            senderName: user.displayName || "Alguém",
            message: `comentou no cartão "${card.title}"`,
            cardId: card.id,
            boardId: card.boardId,
          });
        });
      }

      setNewComment("");
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !card.id || !user) return;

    setIsUploading(true);
    try {
      const url = await uploadFile(card.id, file);
      const newAttachment: Attachment = {
        id: crypto.randomUUID(),
        name: file.name,
        url,
        type: file.type,
        createdAt: Date.now(),
      };
      
      const updatedAttachments = [...attachments, newAttachment];
      setAttachments(updatedAttachments);
      
      // Auto-set as cover if it's the first image
      if (file.type.startsWith("image/") && !coverUrl) {
        setCoverUrl(url);
      }

      await logActivity({
        boardId: card.boardId,
        userId: user.uid,
        userName: user.displayName || "Usuário",
        type: "board_updated", // Using board_updated as a generic card change for now
        details: { cardTitle: card.title, text: `anexou ${file.name}` }
      });

      showNotification(`Arquivo "${file.name}" anexado.`);
    } catch (error) {
      console.error("Erro no upload:", error);
      showNotification("Falha ao enviar arquivo.", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = (id: string) => {
    const removed = attachments.find(a => a.id === id);
    if (removed?.url === coverUrl) setCoverUrl("");
    setAttachments(attachments.filter(a => a.id !== id));
  };

  const addChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;
    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      title: newItemTitle.trim(),
      completed: false,
    };
    setChecklists([...checklists, newItem]);
    setNewItemTitle("");
  };

  const toggleChecklistItem = (id: string) => {
    const updated = checklists.map(item => 
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setChecklists(updated);

    // Celebração ao completar 100%
    if (updated.length > 0 && updated.every(i => i.completed)) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#4ade80", "#60a5fa", "#facc15"]
      });
      showNotification("Checklist finalizado! 🎉");
    }
  };

  const removeChecklistItem = (id: string) => {
    setChecklists(checklists.filter(item => item.id !== id));
  };

  const completedCount = checklists.filter(i => i.completed).length;
  const progressPercent = checklists.length > 0 ? Math.round((completedCount / checklists.length) * 100) : 0;

  const formatCommentDate = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    if (diff < 60000) return "agora mesmo";
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min atrás`;
    return new Date(timestamp).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Card Cover */}
        {coverUrl ? (
          <div className="relative h-48 w-full group">
            <img src={coverUrl} alt="Capa" className="w-full h-full object-cover rounded-t-xl" />
            <button 
              onClick={() => setCoverUrl("")}
              className="absolute top-2 right-12 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remover Capa"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        ) : colorLabel && (
          <div 
            className="h-16 w-full rounded-t-xl" 
            style={{ backgroundColor: colorLabel }}
          />
        )}

        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="w-full mr-8">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-bold text-gray-800 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                placeholder="Título do Cartão"
              />
              <p className="text-sm text-gray-500 ml-1 mt-1">Na lista atual</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors absolute top-4 right-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Main Content */}
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                  Descrição
                </h3>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Adicione uma descrição mais detalhada..."
                  className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>

              {/* Checklist Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                    Checklist
                  </h3>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {progressPercent}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ease-out ${progressPercent === 100 ? "bg-green-500" : "bg-blue-500"}`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="space-y-2 mb-4">
                  {checklists.map(item => (
                    <div key={item.id} className="flex items-center gap-3 group">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleChecklistItem(item.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                      <span 
                        className={`flex-1 text-sm transition-all ${item.completed ? "text-gray-400 line-through" : "text-gray-700"}`}
                        onClick={() => toggleChecklistItem(item.id)}
                      >
                        {item.title}
                      </span>
                      <button
                        onClick={() => removeChecklistItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                        title="Remover item"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={addChecklistItem} className="flex gap-2">
                  <input
                    type="text"
                    value={newItemTitle}
                    onChange={(e) => setNewItemTitle(e.target.value)}
                    placeholder="Adicionar um item..."
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <button
                    type="submit"
                    disabled={!newItemTitle.trim()}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-md font-medium disabled:opacity-50 transition-colors"
                  >
                    Adicionar
                  </button>
                </form>
              </div>

              {/* Attachments Section */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                    Anexos
                  </h3>
                  <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs px-3 py-1.5 rounded-md font-medium transition-colors">
                    {isUploading ? "Enviando..." : "Adicionar"}
                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                  </label>
                </div>

                <div className="space-y-3">
                  {attachments.map((file) => (
                    <div key={file.id} className="flex gap-4 group bg-gray-50 hover:bg-gray-100 p-2 rounded-lg transition-colors">
                      {file.type.startsWith("image/") ? (
                        <div className="w-24 h-20 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                          <img src={file.url} alt={file.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className="w-24 h-20 bg-blue-100 rounded flex items-center justify-center text-blue-500 flex-shrink-0">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <p className="text-sm font-bold text-gray-800 truncate" title={file.name}>{file.name}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                          <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                          <button 
                            onClick={() => removeAttachment(file.id)}
                            className="underline hover:text-red-600"
                          >
                            Remover
                          </button>
                          {file.type.startsWith("image/") && (
                            <button 
                              onClick={() => setCoverUrl(file.url)}
                              className="underline hover:text-blue-600"
                            >
                              {coverUrl === file.url ? "Capa atual" : "Tornar capa"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {attachments.length === 0 && (
                    <p className="text-center text-gray-400 text-xs italic py-2">Nenhum anexo.</p>
                  )}
                </div>
              </div>

              {/* Comments Section */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                  Comentários
                </h3>

                <form onSubmit={handleAddComment} className="flex gap-3 mb-6">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center text-blue-600 font-bold text-xs uppercase overflow-hidden">
                    {user?.photoURL ? <img src={user.photoURL} alt="" /> : user?.displayName?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1 space-y-2">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Escreva um comentário..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none min-h-[80px]"
                    />
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-md font-semibold disabled:opacity-50 transition-colors"
                    >
                      Comentar
                    </button>
                  </div>
                </form>

                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-600 font-bold text-xs uppercase overflow-hidden">
                        {comment.userPhoto ? <img src={comment.userPhoto} alt="" /> : comment.userName.charAt(0)}
                      </div>
                      <div className="flex-1 bg-gray-50 rounded-lg p-3">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="font-bold text-sm text-gray-800">{comment.userName}</span>
                          <span className="text-[10px] text-gray-400">{formatCommentDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.text}</p>
                      </div>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-center text-gray-400 text-sm italic py-4">Sem comentários ainda.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar Actions */}
            <div className="w-full md:w-48 shrink-0 flex flex-col gap-4">
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Etiqueta (Cor)</h4>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => setColorLabel(color === colorLabel ? "" : color)}
                      className={`w-8 h-8 rounded-md transition-transform ${colorLabel === color ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : "hover:opacity-80 hover:scale-105"}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Data de Entrega</h4>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-sm border border-gray-200 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {dueDate && (
                  <button
                    onClick={() => setDueDate("")}
                    className="mt-1 text-xs text-red-500 hover:text-red-700"
                  >
                    Remover data
                  </button>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={handleSave}
                  disabled={isSaving || !title.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow-sm disabled:opacity-50 transition-colors"
                >
                  {isSaving ? "Salvando..." : "Salvar Cartão"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
