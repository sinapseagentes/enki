import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  limit
} from "firebase/firestore";
import type { QuerySnapshot, DocumentData } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Activity } from "../types";

const ACTIVITIES_COLLECTION = "activities";

export const logActivity = async (activity: Omit<Activity, "id" | "createdAt">) => {
  try {
    await addDoc(collection(db, ACTIVITIES_COLLECTION), {
      ...activity,
      createdAt: Date.now(),
    });
  } catch (error) {
    console.error("Erro ao registrar atividade:", error);
  }
};

export const subscribeToActivities = (boardId: string, callback: (activities: Activity[]) => void) => {
  const q = query(
    collection(db, ACTIVITIES_COLLECTION),
    where("boardId", "==", boardId),
    orderBy("createdAt", "desc"),
    limit(50)
  );

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const activities = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Activity[];
    callback(activities);
  });
};
