export enum PermissionLevel {
  VIEW = 'VIEW',
  SHARE = 'SHARE',
  EDIT = 'EDIT',
  ADMIN = 'ADMIN',
}

export enum ResourceType {
  FILE = 'file',
  FOLDER = 'folder',
}

export const Level = [
  PermissionLevel.VIEW, // 0 min
  PermissionLevel.SHARE, // 1
  PermissionLevel.EDIT, // 2
  PermissionLevel.ADMIN, // 3 max
];

export enum AccessLevel {
  READ = 'read',
  WRITE = 'write',
}
