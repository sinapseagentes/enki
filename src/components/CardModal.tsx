import { useState, useEffect } from "react";
import type { Card, ChecklistItem, Comment, Attachment, Board, UserProfile, List } from "../types";
import { updateCard, moveCard, copyCard } from "../services/cardService";
import { addComment, subscribeToComments, updateComment, deleteComment } from "../services/commentService";
import { uploadFile } from "../services/storageService";
import { logActivity } from "../services/activityService";
import { sendNotification } from "../services/notificationService";
import { getBoards } from "../services/boardService";
import { subscribeToLists } from "../services/listService";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import confetti from "canvas-confetti";

interface CardModalProps {
  card: Card;
  board?: Board;
  boardMembers?: UserProfile[];
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

export const CardModal = ({ card, board, boardMembers, onClose }: CardModalProps) => {
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
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");
  
  // V9 Move/Copy States
  const [showMoveUI, setShowMoveUI] = useState(false);
  const [showCopyUI, setShowCopyUI] = useState(false);
  const [availableBoards, setAvailableBoards] = useState<Board[]>([]);
  const [targetBoardId, setTargetBoardId] = useState(card.boardId);
  const [targetListId, setTargetListId] = useState(card.listId);
  const [availableLists, setAvailableLists] = useState<List[]>([]);

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

  // V9: Fetch boards for move/copy
  useEffect(() => {
    if (showMoveUI || showCopyUI) {
      getBoards().then(setAvailableBoards);
    }
  }, [showMoveUI, showCopyUI]);

  // V9: Fetch lists when board selection changes
  useEffect(() => {
    if (!targetBoardId) return;
    const unsubscribe = subscribeToLists(targetBoardId, (lists) => {
      setAvailableLists(lists);
      if (lists.length > 0 && !lists.find(l => l.id === targetListId)) {
        setTargetListId(lists[0].id!);
      }
    });
    return () => unsubscribe();
  }, [targetBoardId]);

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

  const handleCommentChange = (text: string) => {
    setNewComment(text);
    
    // Detect trigger '@'
    const lastAtIdx = text.lastIndexOf("@");
    if (lastAtIdx !== -1 && (lastAtIdx === 0 || text[lastAtIdx - 1] === " ")) {
      const query = text.slice(lastAtIdx + 1);
      // Only trigger if no space after @
      if (!query.includes(" ")) {
        setMentionFilter(query);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const selectMention = (name: string) => {
    const lastAtIdx = newComment.lastIndexOf("@");
    const prefix = newComment.slice(0, lastAtIdx);
    setNewComment(prefix + "@" + name + " ");
    setShowMentions(false);
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
        
        // Detect mentions
        const mentionRegex = /@(\w+)/g;
        const matches = [...newComment.matchAll(mentionRegex)];
        const mentionedUserIds = new Set<string>();

        if (boardMembers) {
          matches.forEach(match => {
            const name = match[1].toLowerCase();
            const mentioned = boardMembers.find(m => 
              m.displayName?.toLowerCase().includes(name) || 
              m.email?.toLowerCase().includes(name)
            );
            if (mentioned && mentioned.uid !== user.uid) {
              mentionedUserIds.add(mentioned.uid);
            }
          });
        }

        others.forEach(memberId => {
          const isMentioned = mentionedUserIds.has(memberId);
          sendNotification({
            userId: memberId,
            senderName: user.displayName || "Alguém",
            message: isMentioned 
              ? `mencionou você no cartão "${card.title}"` 
              : `comentou no cartão "${card.title}"`,
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

  const handleUpdateComment = async (id: string) => {
    if (!editingCommentText.trim()) return;
    try {
      await updateComment(id, editingCommentText.trim());
      setEditingCommentId(null);
      showNotification("Comentário atualizado!");
    } catch (error) {
      console.error("Erro ao editar comentário:", error);
      showNotification("Falha ao editar comentário.", "error");
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este comentário?")) {
      try {
        await deleteComment(id);
        showNotification("Comentário excluído.");
      } catch (error) {
        console.error("Erro ao excluir comentário:", error);
        showNotification("Falha ao excluir comentário.", "error");
      }
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

  const handleMove = async () => {
    if (!card.id) return;
    setIsSaving(true);
    try {
      await moveCard(card.id, targetBoardId, targetListId);
      showNotification("Cartão movido com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao mover:", error);
      showNotification("Falha ao mover cartão.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = async () => {
    setIsSaving(true);
    try {
      await copyCard(card, targetBoardId, targetListId);
      showNotification("Cartão copiado com sucesso!");
      onClose();
    } catch (error) {
      console.error("Erro ao copiar:", error);
      showNotification("Falha ao copiar cartão.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Click outside to close */}
      <div className="absolute inset-0" onClick={onClose}></div>

      <div className="relative bg-theme-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col border border-theme">
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
                className="text-2xl font-bold text-theme-main w-full bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 rounded p-1"
                placeholder="Título do Cartão"
              />
              <p className="text-sm text-gray-500 ml-1 mt-1">Na lista atual</p>
            </div>
            <button
              onClick={onClose}
              className="text-theme-secondary hover:text-theme-main bg-theme-surface hover:bg-theme-card/80 rounded-full p-2 transition-colors absolute top-4 right-4"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Main Content */}
            <div className="flex-1 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-theme-main mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                  Descrição
                </h3>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Adicione uma descrição mais detalhada..."
                  className="w-full h-32 px-3 py-2 bg-theme-surface text-theme-main border border-theme rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
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
                  <div className="flex-1 relative">
                    <textarea
                      value={newComment}
                      onChange={(e) => handleCommentChange(e.target.value)}
                      placeholder="Escreva um comentário (use @ para mencionar)..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none min-h-[80px]"
                    />
                    
                    {showMentions && boardMembers && (
                      <div className="absolute bottom-full left-0 mb-1 w-64 bg-white rounded-lg shadow-xl border border-gray-100 z-10 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-150">
                        <div className="p-2 bg-gray-50 border-b border-gray-100">
                          <span className="text-[10px] font-bold text-gray-500 uppercase">Mencionar membro</span>
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {boardMembers
                            .filter(m => 
                              m.displayName?.toLowerCase().includes(mentionFilter.toLowerCase()) || 
                              m.email?.toLowerCase().includes(mentionFilter.toLowerCase())
                            )
                            .map(m => (
                              <div
                                key={m.uid}
                                onClick={() => selectMention(m.displayName || "Usuário")}
                                className="flex items-center gap-2 p-2 hover:bg-blue-50 cursor-pointer transition-colors"
                              >
                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600 uppercase overflow-hidden">
                                  {m.photoURL ? <img src={m.photoURL} alt="" /> : m.displayName?.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-gray-800">{m.displayName}</span>
                                  <span className="text-[9px] text-gray-400">{m.email}</span>
                                </div>
                              </div>
                            ))}
                          {boardMembers.filter(m => 
                              m.displayName?.toLowerCase().includes(mentionFilter.toLowerCase()) || 
                              m.email?.toLowerCase().includes(mentionFilter.toLowerCase())
                            ).length === 0 && (
                            <div className="p-4 text-center text-xs text-gray-400 italic">Nenhum membro encontrado</div>
                          )}
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-md font-semibold disabled:opacity-50 transition-colors mt-2"
                    >
                      Comentar
                    </button>
                  </div>
                </form>

                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3 group">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-600 font-bold text-xs uppercase overflow-hidden">
                        {comment.userPhoto ? <img src={comment.userPhoto} alt="" /> : comment.userName.charAt(0)}
                      </div>
                      <div className="flex-1 bg-theme-surface rounded-lg p-3 relative border border-theme">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="font-bold text-sm text-theme-main">{comment.userName}</span>
                          <span className="text-[10px] text-theme-secondary">{formatCommentDate(comment.createdAt)}</span>
                        </div>
                        
                        {editingCommentId === comment.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={editingCommentText}
                              onChange={(e) => setEditingCommentText(e.target.value)}
                              className="w-full p-2 text-sm border border-blue-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button 
                                onClick={() => handleUpdateComment(comment.id!)}
                                className="text-[10px] bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                              >
                                Salvar
                              </button>
                              <button 
                                onClick={() => setEditingCommentId(null)}
                                className="text-[10px] bg-gray-200 text-gray-600 px-2 py-1 rounded hover:bg-gray-300"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-sm text-theme-main whitespace-pre-wrap">{comment.text}</p>
                            {user?.uid === comment.userId && (
                              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                  onClick={() => {
                                    setEditingCommentId(comment.id!);
                                    setEditingCommentText(comment.text);
                                  }}
                                  className="text-xs text-gray-400 hover:text-blue-600"
                                  title="Editar"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                </button>
                                <button 
                                  onClick={() => handleDeleteComment(comment.id!)}
                                  className="text-xs text-gray-400 hover:text-red-600"
                                  title="Excluir"
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                              </div>
                            )}
                          </>
                        )}
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

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ações</h4>
                
                {/* Move Action */}
                {!showMoveUI && !showCopyUI ? (
                  <>
                    <button 
                      onClick={() => setShowMoveUI(true)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2 px-4 rounded flex items-center gap-2 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                      Mover
                    </button>
                    <button 
                      onClick={() => setShowCopyUI(true)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-2 px-4 rounded flex items-center gap-2 transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                      Copiar
                    </button>
                  </>
                ) : (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 space-y-3 animate-in slide-in-from-right-2 duration-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-600">{showMoveUI ? "Mover para..." : "Copiar para..."}</span>
                      <button onClick={() => { setShowMoveUI(false); setShowCopyUI(false); }} className="text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Quadro</label>
                      <select 
                        value={targetBoardId}
                        onChange={(e) => setTargetBoardId(e.target.value)}
                        className="w-full text-xs border border-gray-300 rounded p-1 bg-white"
                      >
                        {availableBoards.map(b => (
                          <option key={b.id} value={b.id}>{b.title}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 font-bold uppercase">Lista</label>
                      <select 
                        value={targetListId}
                        onChange={(e) => setTargetListId(e.target.value)}
                        className="w-full text-xs border border-gray-300 rounded p-1 bg-white"
                      >
                        {availableLists.map(l => (
                          <option key={l.id} value={l.id}>{l.title}</option>
                        ))}
                      </select>
                    </div>

                    <button 
                      onClick={showMoveUI ? handleMove : handleCopy}
                      disabled={isSaving}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded shadow-sm transition-all"
                    >
                      {isSaving ? "Processando..." : (showMoveUI ? "Confirmar Movimentação" : "Confirmar Cópia")}
                    </button>
                  </div>
                )}

                <button
                  onClick={handleSave}
                  disabled={isSaving || !title.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow-sm disabled:opacity-50 transition-colors mt-4"
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
