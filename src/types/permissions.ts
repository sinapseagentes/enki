export type PermissionLevel = 'owner' | 'admin' | 'editor' | 'viewer';

export interface BoardPermissions {
  [userId: string]: PermissionLevel;
}

export interface BoardWithPermissions extends Omit<Board, 'members'> {
  permissions: BoardPermissions;
}