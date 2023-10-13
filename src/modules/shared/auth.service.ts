import { Injectable } from '@nestjs/common';
import { UserRole } from 'src/types/user.types';
import { Status } from 'src/utils/constant';

@Injectable()
export class AuthService {
  private id: string;
  private status: Status;
  private role: UserRole;
  private room: string;

  public setId(id: string): void {
    this.id = id;
  }

  public getId(): string {
    return this.id;
  }

  public setStatus(status: Status): void {
    this.status = status;
  }

  public getStatus(): Status {
    return this.status;
  }

  public setRole(role: UserRole): void {
    this.role = role;
  }

  public getRole(): UserRole {
    return this.role;
  }

  public setRoom(room: string): void {
    this.room = room;
  }

  public getRoom(): string {
    return this.room;
  }
}
