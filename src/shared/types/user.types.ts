export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface IAuthUser {
  id: string;
  emailAddress: string;
  role: UserRole;
}
