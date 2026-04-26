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

export interface Activity {
  id?: string;
  boardId: string;
  userId: string;
  userName: string;
  type: "card_created" | "card_moved" | "card_archived" | "list_created" | "list_archived" | "board_updated" | "comment_added";
  details: {
    cardTitle?: string;
    listTitle?: string;
    fromList?: string;
    toList?: string;
    text?: string;
  };
  createdAt: number;
}

export interface Comment {
  id?: string;
  cardId: string;
  boardId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  createdAt: number;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  createdAt: number;
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
  attachments?: Attachment[];
  coverUrl?: string;
  order: number;
  archived?: boolean;
  createdAt: number;
}
