import { collection, addDoc, query, where, orderBy, onSnapshot, updateDoc, doc, deleteDoc, getDoc } from "firebase/firestore";
import type { DocumentData, QuerySnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Card } from "../types";
import { executeAutomations } from "./automationService";

const CARDS_COLLECTION = "cards";

export const getCard = async (cardId: string): Promise<Card | null> => {
  const cardRef = doc(db, CARDS_COLLECTION, cardId);
  const snapshot = await getDoc(cardRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...snapshot.data() } as Card;
  }
  return null;
};

export const createCard = async (boardId: string, listId: string, title: string, order: number): Promise<string> => {
  const newCard: Card = {
    boardId,
    listId,
    title,
    order,
    createdAt: Date.now(),
  };

  const docRef = await addDoc(collection(db, CARDS_COLLECTION), newCard);
  
  // Trigger automation
  executeAutomations(boardId, 'card_created', { ...newCard, id: docRef.id });
  
  return docRef.id;
};

export const subscribeToCards = (
  boardId: string, 
  callback: (cards: Card[]) => void
) => {
  const q = query(
    collection(db, CARDS_COLLECTION),
    where("boardId", "==", boardId),
    orderBy("order", "asc")
  );

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const cards: Card[] = [];
    snapshot.forEach((doc) => {
      cards.push({ id: doc.id, ...doc.data() } as Card);
    });
    callback(cards);
  }, (error) => {
    console.error("Error listening to cards:", error);
  });
};

export const updateCard = async (cardId: string, updates: Partial<Card>) => {
  const cardRef = doc(db, CARDS_COLLECTION, cardId);
  await updateDoc(cardRef, updates);

  if (updates.listId || updates.boardId) {
    const card = await getCard(cardId);
    if (card) {
      executeAutomations(card.boardId, 'card_moved', card);
    }
  }
};

export const archiveCard = async (cardId: string) => {
  const cardRef = doc(db, CARDS_COLLECTION, cardId);
  await updateDoc(cardRef, { archived: true });

  const card = await getCard(cardId);
  if (card) {
    executeAutomations(card.boardId, 'card_archived', card);
  }
};

export const restoreCard = async (cardId: string) => {
  const cardRef = doc(db, CARDS_COLLECTION, cardId);
  await updateDoc(cardRef, { archived: false });
};

export const deleteCard = async (cardId: string) => {
  const cardRef = doc(db, CARDS_COLLECTION, cardId);
  await deleteDoc(cardRef);
};

/**
 * Move um cartão para um novo quadro e/ou nova lista
 */
export const moveCard = async (cardId: string, targetBoardId: string, targetListId: string, newOrder: number = 0) => {
  const cardRef = doc(db, CARDS_COLLECTION, cardId);
  await updateDoc(cardRef, {
    boardId: targetBoardId,
    listId: targetListId,
    order: newOrder
  });

  const card = await getCard(cardId);
  if (card) {
    executeAutomations(targetBoardId, 'card_moved', card);
  }
};

/**
 * Cria uma cópia de um cartão em um destino específico
 */
export const copyCard = async (card: Card, targetBoardId: string, targetListId: string, newOrder: number = 0) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, ...cardData } = card;
  const newCard = {
    ...cardData,
    boardId: targetBoardId,
    listId: targetListId,
    order: newOrder,
    createdAt: Date.now(),
    title: `${card.title} (Cópia)`
  };

  const docRef = await addDoc(collection(db, CARDS_COLLECTION), newCard);
  return docRef.id;
};
