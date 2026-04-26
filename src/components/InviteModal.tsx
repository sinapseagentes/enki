import { useState, useEffect } from "react";
import { inviteUserToBoard } from "../services/boardService";

interface InviteModalProps {
  boardId: string;
  onClose: () => void;
}

export const InviteModal = ({ boardId, onClose }: InviteModalProps) => {
  const [email, setEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Por favor, insira um e-mail válido.");
      return;
    }

    setIsInviting(true);
    setError("");
    setSuccess(false);

    try {
      await inviteUserToBoard(boardId, email.trim());
      setSuccess(true);
      setEmail("");
      setTimeout(() => onClose(), 2000);
    } catch (err: any) {
      setError(err.message || "Erro ao convidar usuário. Verifique se o e-mail está correto.");
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="absolute inset-0" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Convidar Membro</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <form onSubmit={handleInvite} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Endereço de E-mail
              </label>
              <input
                id="email"
                type="email"
                required
                autoFocus
                placeholder="nome@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <p className="text-xs text-gray-500 mt-2">
                O usuário precisa já ter feito login neste aplicativo pelo menos uma vez para ser encontrado pelo sistema.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
                Convite enviado com sucesso! O quadro agora aparecerá no Dashboard desse usuário.
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={isInviting || !email.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow-sm disabled:opacity-50 transition-colors"
              >
                {isInviting ? "Buscando..." : "Enviar Convite"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
