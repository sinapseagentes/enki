import { collection, addDoc, query, where, orderBy, onSnapshot, updateDoc, doc, deleteDoc } from "firebase/firestore";
import type { DocumentData, QuerySnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Card } from "../types";

const CARDS_COLLECTION = "cards";

export const createCard = async (boardId: string, listId: string, title: string, order: number): Promise<string> => {
  const newCard: Card = {
    boardId,
    listId,
    title,
    order,
    createdAt: Date.now(),
  };

  const docRef = await addDoc(collection(db, CARDS_COLLECTION), newCard);
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
};

export const archiveCard = async (cardId: string) => {
  const cardRef = doc(db, CARDS_COLLECTION, cardId);
  await updateDoc(cardRef, { archived: true });
};

export const restoreCard = async (cardId: string) => {
  const cardRef = doc(db, CARDS_COLLECTION, cardId);
  await updateDoc(cardRef, { archived: false });
};

export const deleteCard = async (cardId: string) => {
  const cardRef = doc(db, CARDS_COLLECTION, cardId);
  await deleteDoc(cardRef);
};
