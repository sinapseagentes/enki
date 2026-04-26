import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot 
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

export const subscribeToComments = (cardId: string, callback: (comments: Comment[]) => void) => {
  const q = query(
    collection(db, COMMENTS_COLLECTION),
    where("cardId", "==", cardId),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const comments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Comment[];
    callback(comments);
  });
};
