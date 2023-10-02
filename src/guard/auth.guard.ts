import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from './../types/user.types';
import { Status } from './../utils/constant';
import { AuthService } from './../modules/shared/auth.service';

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

    if (!role && !status) return true;
    else if (role && !status) return this.authService.getRole() == role;
    else if (this.authService.getRole() == role && this.authService.getStatus() == status) return true;
    throw new UnauthorizedException('Unauthorized access');
  }
}
