import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from './../shared/auth.service';
import { Reflector } from '@nestjs/core';
import { UserRole } from './../types/user.types';
import { Status } from './../utils/constant';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  private readonly authService: AuthService;
  private readonly reflector: Reflector;

  constructor(authService: AuthService, reflector: Reflector) {
    this.authService = authService;
    this.reflector = reflector;
  }
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const role = this.reflector.get<UserRole>('role', context.getHandler());
    const status = this.reflector.get<Status>('status', context.getHandler());

    if (role && this.authService.getRole() !== role) return false;

    if (status && this.authService.getStatus() !== status) return false;

    return true;
  }
}
