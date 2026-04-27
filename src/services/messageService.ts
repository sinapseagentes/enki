import { collection, addDoc, query, where, orderBy, onSnapshot, limit } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface Message {
  id?: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  text: string;
  createdAt: number;
  conversationId: string;
}

const MESSAGES_COLLECTION = "messages";

export const sendMessage = async (message: Omit<Message, "id" | "createdAt" | "conversationId">) => {
  const conversationId = [message.senderId, message.receiverId].sort().join("_");
  const newMessage = {
    ...message,
    conversationId,
    createdAt: Date.now(),
  };
  return await addDoc(collection(db, MESSAGES_COLLECTION), newMessage);
};

export const subscribeToMessages = (userId1: string, userId2: string, callback: (messages: Message[]) => void) => {
  const conversationId = [userId1, userId2].sort().join("_");
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where("conversationId", "==", conversationId),
    orderBy("createdAt", "asc"),
    limit(100)
  );

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = [];
    snapshot.forEach((doc) => {
      messages.push({ id: doc.id, ...doc.data() } as Message);
    });
    callback(messages);
  });
};
