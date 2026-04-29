import { doc, increment, writeBatch } from "firebase/firestore";
import { db } from "../lib/firebase";

/**
 * Incrementa ou decrementa os bytes de armazenamento consumidos por um arquivo.
 * Atualiza os documentos de Usuário, Board, List e Card simultaneamente usando um Batch.
 * 
 * @param bytes Número de bytes (positivo para upload, negativo para delete)
 * @param userId ID do usuário que fez o upload (ou quem é o "dono" do consumo)
 * @param boardId ID do quadro
 * @param listId ID da lista
 * @param cardId ID do cartão
 */
export const updateStorageMetrics = async (
  bytes: number,
  userId: string,
  boardId: string,
  listId: string,
  cardId: string
) => {
  if (!userId || !boardId || !listId || !cardId || bytes === 0) return;

  const batch = writeBatch(db);

  // 1. Atualizar o Usuário
  const userRef = doc(db, "users", userId);
  batch.update(userRef, {
    "storageMetrics.totalBytes": increment(bytes)
  });

  // 2. Atualizar o Board
  const boardRef = doc(db, "boards", boardId);
  batch.update(boardRef, {
    "storageMetrics.totalBytes": increment(bytes),
    [`storageMetrics.byUser.${userId}`]: increment(bytes)
  });

  // 3. Atualizar a List
  const listRef = doc(db, "lists", listId);
  batch.update(listRef, {
    "storageMetrics.totalBytes": increment(bytes),
    [`storageMetrics.byUser.${userId}`]: increment(bytes)
  });

  // 4. Atualizar o Card
  const cardRef = doc(db, "cards", cardId);
  batch.update(cardRef, {
    "storageMetrics.totalBytes": increment(bytes),
    [`storageMetrics.byUser.${userId}`]: increment(bytes)
  });

  try {
    await batch.commit();
  } catch (error) {
    // Falhas aqui podem ocorrer se o documento nunca teve o campo inicializado como map,
    // mas o `increment` do Firestore geralmente cria os campos aninhados se não existirem.
    // Em regras muito estritas, precisaríamos garantir que o doc base existe.
    console.error("Error updating storage metrics:", error);
  }
};
