import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";
import type { QuerySnapshot, DocumentData } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Comment } from "../types";

const COMMENTS_COLLECTION = "comments";

export const addComment = async (comment: Omit<Comment, "id" | "createdAt">) => {
  return addDoc(collection(db, COMMENTS_COLLECTION), {
    ...comment,
    createdAt: Date.now(),
  });
};

export const subscribeToComments = (cardId: string, boardId: string, callback: (comments: Comment[]) => void) => {
  const q = query(
    collection(db, COMMENTS_COLLECTION),
    where("boardId", "==", boardId),
    where("cardId", "==", cardId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Comment[];
    callback(comments);
  }, (error) => {
    console.error("Erro ao escutar comentários:", error);
  });
};

export const updateComment = async (id: string, text: string) => {
  const docRef = doc(db, COMMENTS_COLLECTION, id);
  return updateDoc(docRef, { text });
};

export const deleteComment = async (id: string) => {
  const docRef = doc(db, COMMENTS_COLLECTION, id);
  return deleteDoc(docRef);
};
