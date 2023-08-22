import { Injectable, Scope } from '@nestjs/common';
import { UserRole } from 'src/types/user.types';
import { Status } from 'src/utils/constant';

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  private id: string;
  private status: Status;
  private role: UserRole;
  private userAgent: string;
  private ipAddress: string;
  private method: string;
  private path: string;
  private hostName: string;
  private originalUrl: string;

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

  public setUserAgent(userAgent: string): void {
    this.userAgent = userAgent;
  }

  public getUserAgent(): string {
    return this.userAgent;
  }

  public setIpAddress(ipAddress: string): void {
    this.ipAddress = ipAddress;
  }

  public getIpAddress(): string {
    return this.ipAddress;
  }

  public setMethod(method: string): void {
    this.method = method;
  }

  public getMethod(): string {
    return this.method;
  }

  public setPath(path: string): void {
    this.path = path;
  }

  public getPath(): string {
    return this.path;
  }

  public setHostName(hostName: string): void {
    this.hostName = hostName;
  }

  public getHostName(): string {
    return this.hostName;
  }

  public setOriginalUrl(originalUrl: string): void {
    this.originalUrl = originalUrl;
  }

  public getOriginalUrl(): string {
    return this.originalUrl;
  }
}
