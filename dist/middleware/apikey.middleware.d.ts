import { NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './../modules/shared/auth.service';
export declare class APIKeyMiddleware implements NestMiddleware {
    private readonly configService;
    private readonly authService;
    constructor(configService: ConfigService, authService: AuthService);
    use(req: Request, res: Response, next: NextFunction): void;
}
