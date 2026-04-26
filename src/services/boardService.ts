import { collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, doc, updateDoc, arrayUnion, getDocs } from "firebase/firestore";
import type { DocumentData, QuerySnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Board } from "../types";

const BOARDS_COLLECTION = "boards";
const USERS_COLLECTION = "users";

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

export const deleteBoard = async (boardId: string) => {
  const boardRef = doc(db, BOARDS_COLLECTION, boardId);
  await deleteDoc(boardRef);
};

export const updateBoardTitle = async (boardId: string, title: string) => {
  const boardRef = doc(db, BOARDS_COLLECTION, boardId);
  await updateDoc(boardRef, { title, updatedAt: Date.now() });
};

export const inviteUserToBoard = async (boardId: string, email: string) => {
  // Find user by email
  const q = query(collection(db, USERS_COLLECTION), where("email", "==", email));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    throw new Error("Usuário não encontrado. Ele precisa ter feito login no aplicativo pelo menos uma vez.");
  }
  
  const userDoc = snapshot.docs[0];
  const uid = userDoc.data().uid;

  // Add uid to board members
  const boardRef = doc(db, BOARDS_COLLECTION, boardId);
  await updateDoc(boardRef, {
    members: arrayUnion(uid)
  });
};
