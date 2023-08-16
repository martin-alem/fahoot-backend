import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../shared/auth.service';

@Injectable()
export class APIKeyMiddleware implements NestMiddleware {
  private readonly configService: ConfigService;
  private readonly authService: AuthService;
  constructor(configService: ConfigService, authService: AuthService) {
    this.configService = configService;
    this.authService = authService;
  }
  use(req: Request, res: Response, next: NextFunction): void {
    const authorizationHeader = req.headers['authorization'] ?? null;
    if (!authorizationHeader) throw new ForbiddenException('No authorization header');

    const apiKey = authorizationHeader.split(' ')[1];
    if (!apiKey) throw new ForbiddenException('No API key');
    if (apiKey !== this.configService.get<string>('CLIENT_API_KEY')) throw new ForbiddenException('Invalid API key');

    this.authService.setUserAgent(req.get('user-agent') ?? '');
    this.authService.setIpAddress(req.ip);
    this.authService.setPath(req.path);
    this.authService.setHostName(req.hostname);
    this.authService.setOriginalUrl(req.originalUrl);
    next();
  }
}
