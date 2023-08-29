import { AuthenticationMethod, Status } from '../utils/constant';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export interface IAuthUser {
  id: string;
  emailAddress: string;
  role: UserRole;
}

export interface IInternalUser {
  firstName: string;
  lastName: string;
  emailAddress: string;
  authenticationMethod: AuthenticationMethod;
  avatarUrl?: string;
  password?: string;
  verified?: boolean;
  status?: Status;
}

export interface IInternalUpdate {
  password?: string;
  verified?: boolean;
  status?: Status;
}

export interface IPlainUser {
  firstName: string;
  lastName: string;
  emailAddress: string;
  authenticationMethod: AuthenticationMethod;
  avatarUrl: string;
  verified: boolean;
  status: Status;
}

export interface IUser {
  firstName: string;
  lastName: string;
  emailAddress: string;
  avatarUrl: string;
  verified: boolean;
  status: Status;
}
