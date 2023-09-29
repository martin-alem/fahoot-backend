import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from './../modules/shared/auth.service';
export declare class AuthorizationGuard implements CanActivate {
    private readonly authService;
    private readonly reflector;
    constructor(authService: AuthService, reflector: Reflector);
    canActivate(context: ExecutionContext): boolean | Promise<boolean>;
}
