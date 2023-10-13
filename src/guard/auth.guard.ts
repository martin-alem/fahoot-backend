import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from './../types/user.types';
import { ErrorMessages, Status } from './../utils/constant';
import { AuthService } from './../modules/shared/auth.service';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  private readonly authService: AuthService;
  private readonly reflector: Reflector;

  constructor(authService: AuthService, reflector: Reflector) {
    this.authService = authService;
    this.reflector = reflector;
  }

  private checkRoles(role: UserRole[]): boolean {
    return role.includes(this.authService.getRole());
  }

  private checkStatus(status: Status[]): boolean {
    return status.includes(this.authService.getStatus());
  }
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const role = this.reflector.get<UserRole[]>('role', context.getHandler());
    const status = this.reflector.get<Status[]>('status', context.getHandler());

    //Every route handler must provide a role and status decorator
    if (!role && !status) return true;
    if (role && status && this.checkRoles(role) && this.checkStatus(status)) return true;
    throw new UnauthorizedException(ErrorMessages.AUTH_GUARD_ERROR);
  }
}
