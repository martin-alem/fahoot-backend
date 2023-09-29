import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SecurityService } from './../modules/security/security.service';
import { AuthService } from './../modules/shared/auth.service';
import { UserService } from './../modules/user/user.service';
export declare class AuthenticationMiddleware implements NestMiddleware {
    private readonly securityService;
    private readonly userService;
    private readonly authService;
    constructor(securityService: SecurityService, userService: UserService, authService: AuthService);
    use(req: Request, res: Response, next: NextFunction): Promise<void>;
}
