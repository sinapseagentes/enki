import { collection, addDoc, query, where, orderBy, onSnapshot, updateDoc, doc, deleteDoc } from "firebase/firestore";
import type { DocumentData, QuerySnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { List } from "../types";

const LISTS_COLLECTION = "lists";

export const createList = async (boardId: string, title: string, order: number): Promise<string> => {
  const newList: List = {
    boardId,
    title,
    order,
    createdAt: Date.now(),
  };

  const docRef = await addDoc(collection(db, LISTS_COLLECTION), newList);
  return docRef.id;
};

export const subscribeToLists = (
  boardId: string, 
  callback: (lists: List[]) => void
) => {
  const q = query(
    collection(db, LISTS_COLLECTION),
    where("boardId", "==", boardId),
    orderBy("order", "asc")
  );

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const lists: List[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (!data.archived) {
        lists.push({ id: doc.id, ...data } as List);
      }
    });
    callback(lists);
  }, (error) => {
    console.error("Error listening to lists:", error);
  });
};

export const updateListOrder = async (listId: string, newOrder: number) => {
  const listRef = doc(db, LISTS_COLLECTION, listId);
  await updateDoc(listRef, { order: newOrder });
};

export const updateListTitle = async (listId: string, title: string) => {
  const listRef = doc(db, LISTS_COLLECTION, listId);
  await updateDoc(listRef, { title });
};

export const archiveList = async (listId: string) => {
  const listRef = doc(db, LISTS_COLLECTION, listId);
  await updateDoc(listRef, { archived: true });
};

export const deleteList = async (listId: string) => {
  const listRef = doc(db, LISTS_COLLECTION, listId);
  await deleteDoc(listRef);
};
