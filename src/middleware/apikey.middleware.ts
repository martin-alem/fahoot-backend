import { ForbiddenException, Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class APIKeyMiddleware implements NestMiddleware {
  private readonly configService: ConfigService;
  constructor(configService: ConfigService) {
    this.configService = configService;
  }
  use(req: Request, res: Response, next: NextFunction): void {

    next();
  }
}
