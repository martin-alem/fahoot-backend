import { Injectable, Scope } from '@nestjs/common';

@Injectable({ scope: Scope.REQUEST })
export class AuthService {
  private id: string;
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
