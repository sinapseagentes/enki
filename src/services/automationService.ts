import { collection, addDoc, query, where, getDocs, updateDoc, doc, deleteDoc, orderBy } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Automation, AutomationTriggerType } from "../types/automation";
import type { Card } from "../types";

const AUTOMATIONS_COLLECTION = "automations";
const CARDS_COLLECTION = "cards";

export const createAutomation = async (automation: Omit<Automation, 'id'>): Promise<string> => {
  const docRef = await addDoc(collection(db, AUTOMATIONS_COLLECTION), {
    ...automation,
    createdAt: Date.now(),
  });
  return docRef.id;
};

export const getAutomations = async (boardId: string): Promise<Automation[]> => {
  const q = query(
    collection(db, AUTOMATIONS_COLLECTION),
    where("boardId", "==", boardId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  const automations: Automation[] = [];
  snapshot.forEach((doc) => {
    automations.push({ id: doc.id, ...doc.data() } as Automation);
  });
  return automations;
};

export const deleteAutomation = async (automationId: string) => {
  const docRef = doc(db, AUTOMATIONS_COLLECTION, automationId);
  await deleteDoc(docRef);
};

export const toggleAutomation = async (automationId: string, active: boolean) => {
  const docRef = doc(db, AUTOMATIONS_COLLECTION, automationId);
  await updateDoc(docRef, { active });
};

export const executeAutomations = async (
  boardId: string,
  eventType: AutomationTriggerType,
  card: Card
) => {
  const q = query(
    collection(db, AUTOMATIONS_COLLECTION),
    where("boardId", "==", boardId),
    where("active", "==", true),
    where("trigger", "==", eventType)
  );

  const snapshot = await getDocs(q);
  const matchedAutomations: Automation[] = [];
  
  snapshot.forEach((doc) => {
    const auto = { id: doc.id, ...doc.data() } as Automation;
    
    // Check if configuration matches
    let matches = true;
    if (eventType === 'card_moved' && auto.config.targetListId) {
      if (card.listId !== auto.config.targetListId) {
        matches = false;
      }
    }
    
    if (matches) {
      matchedAutomations.push(auto);
    }
  });

  for (const auto of matchedAutomations) {
    await executeAction(auto, card);
  }
};

const executeAction = async (automation: Automation, card: Card) => {
  if (!card.id) return;
  
  const cardRef = doc(db, CARDS_COLLECTION, card.id);
  
  switch (automation.action) {
    case 'move':
      if (automation.config.destinationListId) {
        await updateDoc(cardRef, { listId: automation.config.destinationListId });
      }
      break;
    case 'add_label':
      if (automation.config.label) {
        await updateDoc(cardRef, { colorLabel: automation.config.label });
      }
      break;
    case 'set_due_date':
      if (automation.config.daysToDue !== undefined) {
        const dueDate = Date.now() + (automation.config.daysToDue * 24 * 60 * 60 * 1000);
        await updateDoc(cardRef, { dueDate });
      }
      break;
    default:
      console.warn(`Unknown action type: ${automation.action}`);
  }
};
