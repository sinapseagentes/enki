import { collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, doc, updateDoc, arrayUnion, getDocs } from "firebase/firestore";
import type { DocumentData, QuerySnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Board, Tag } from "../types";

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

export const archiveBoard = async (boardId: string) => {
  const boardRef = doc(db, BOARDS_COLLECTION, boardId);
  await updateDoc(boardRef, { archived: true });
};

export const restoreBoard = async (boardId: string) => {
  const boardRef = doc(db, BOARDS_COLLECTION, boardId);
  await updateDoc(boardRef, { archived: false });
};

export const deleteBoard = async (boardId: string) => {
  const boardRef = doc(db, BOARDS_COLLECTION, boardId);
  await deleteDoc(boardRef);
};

export const updateBoardTitle = async (boardId: string, title: string) => {
  const boardRef = doc(db, BOARDS_COLLECTION, boardId);
  await updateDoc(boardRef, { title, updatedAt: Date.now() });
};

export const updateBoardBackground = async (boardId: string, background: string) => {
  const boardRef = doc(db, BOARDS_COLLECTION, boardId);
  await updateDoc(boardRef, { background });
};

export const updateBoardTags = async (boardId: string, tags: Tag[]) => {
  const boardRef = doc(db, BOARDS_COLLECTION, boardId);
  await updateDoc(boardRef, { tags });
};


export const subscribeToBoard = (boardId: string, callback: (board: Board) => void) => {
  const boardRef = doc(db, BOARDS_COLLECTION, boardId);
  return onSnapshot(boardRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() } as Board);
    }
  });
};

export const getMembersProfile = async (uids: string[]) => {
  if (uids.length === 0) return [];
  const q = query(collection(db, USERS_COLLECTION), where("uid", "in", uids));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => doc.data());
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

  return uid;
};

export const getBoards = async (userId?: string) => {
  const q = userId 
    ? query(collection(db, BOARDS_COLLECTION), where("members", "array-contains", userId))
    : collection(db, BOARDS_COLLECTION);
  
  const snapshot = await getDocs(q as any);
  return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as object) } as Board));
};
