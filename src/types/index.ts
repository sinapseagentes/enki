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
  createdAt: number;
  updatedAt: number;
}

export interface List {
  id?: string;
  boardId: string;
  title: string;
  order: number;
  createdAt: number;
}

export interface Card {
  id?: string;
  listId: string;
  boardId: string;
  title: string;
  description?: string;
  colorLabel?: string; // Hex color code
  order: number;
  createdAt: number;
}
