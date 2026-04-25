import { collection, addDoc, query, where, orderBy, onSnapshot } from "firebase/firestore";
import type { DocumentData, QuerySnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Board } from "../types";

const BOARDS_COLLECTION = "boards";

export const createBoard = async (title: string, userId: string): Promise<string> => {
  const newBoard: Board = {
    title,
    ownerId: userId,
    members: [userId],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const docRef = await addDoc(collection(db, BOARDS_COLLECTION), newBoard);
  return docRef.id;
};

export const subscribeToBoards = (
  userId: string, 
  callback: (boards: Board[]) => void
) => {
  const q = query(
    collection(db, BOARDS_COLLECTION),
    where("members", "array-contains", userId),
    orderBy("updatedAt", "desc")
  );

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const boards: Board[] = [];
    snapshot.forEach((doc) => {
      boards.push({ id: doc.id, ...doc.data() } as Board);
    });
    callback(boards);
  }, (error) => {
    console.error("Error listening to boards:", error);
  });
};
