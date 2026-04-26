export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
}

export interface Board {
  id?: string;
  title: string;
  ownerId: string;
  members: string[]; // array of user UIDs
  archived?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface List {
  id?: string;
  boardId: string;
  title: string;
  order: number;
  archived?: boolean;
  createdAt: number;
}

export interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
}

export interface Card {
  id?: string;
  listId: string;
  boardId: string;
  title: string;
  description?: string;
  colorLabel?: string; // Hex color code
  dueDate?: number;    // Unix timestamp (ms)
  checklists?: ChecklistItem[];
  order: number;
  archived?: boolean;
  createdAt: number;
}
