export interface StorageMetrics {
  totalBytes: number;
  byUser: { [userId: string]: number };
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  bio?: string;
  title?: string;
  joinedAt?: number;
  lastSeen?: number;
  isOnline?: boolean;
  storageMetrics?: { totalBytes: number }; // How much total storage this user consumes across all boards
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Board {
  id?: string;
  title: string;
  ownerId: string;
  members: string[]; // array of user UIDs
  archived?: boolean;
  background?: string; // Color hex or gradient class
  tags?: Tag[]; // Board-specific tags
  permissions?: {
    [userId: string]: 'owner' | 'admin' | 'editor' | 'viewer';
  }; // Permission levels for board access
  createdAt: number;
  updatedAt: number;
  storageMetrics?: StorageMetrics; // Storage used by this board
}

export interface List {
  id?: string;
  boardId: string;
  title: string;
  order: number;
  archived?: boolean;
  createdAt: number;
  storageMetrics?: StorageMetrics; // Storage used by this list
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
  userPhoto?: string | null;
  text: string;
  createdAt: number;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  createdAt: number;
  size?: number; // Size in bytes
  uploaderId?: string; // User who uploaded it
}

export interface Card {
  id?: string;
  listId: string;
  boardId: string;
  title: string;
  description?: string;
  colorLabel?: string;
  tagIds?: string[];
  dueDate?: number;
  checklists?: ChecklistItem[];
  attachments?: Attachment[];
  coverUrl?: string;
  order: number;
  archived?: boolean;
  createdAt: number;
  permissions?: {
    [userId: string]: 'owner' | 'admin' | 'editor' | 'viewer';
  }; // Permission levels for card access (overrides board permissions)
  storageMetrics?: StorageMetrics; // Storage used by this card
}

export interface Message {
  id?: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  text: string;
  createdAt: number;
  conversationId: string;
}

export interface AppNotification {
  id?: string;
  userId: string; // Recipient
  senderName: string;
  message: string;
  cardId?: string;
  boardId: string;
  read: boolean;
  createdAt: number;
}
