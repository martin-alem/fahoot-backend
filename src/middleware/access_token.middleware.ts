import { Injectable, NestMiddleware, BadRequestException, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Response, Request, NextFunction } from 'express';
import { SecurityService } from 'src/modules/security/security.service';
import { AuthService } from 'src/modules/shared/auth.service';
import { UserService } from 'src/modules/user/user.service';
import { IAuthUser } from 'src/types/user.types';
import { ACCESS_TOKEN_COOKIE_NAME, Status } from 'src/utils/constant';

@Injectable()
export class AccessTokenMiddleware implements NestMiddleware, OnModuleInit {
  private readonly moduleRef: ModuleRef;
  private userService: UserService;
  private securityService: SecurityService;
  private authService: AuthService;

  constructor(moduleRef: ModuleRef) {
    this.moduleRef = moduleRef;
  }

  onModuleInit(): void {
    this.userService = this.moduleRef.get<UserService>(UserService, { strict: false });
    this.securityService = this.moduleRef.get<SecurityService>(SecurityService, { strict: false });
    this.authService = this.moduleRef.get<AuthService>(AuthService, { strict: false });
  }

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    try {
      const tokenCookie = req.cookies[ACCESS_TOKEN_COOKIE_NAME];
      if (!tokenCookie) {
        throw new UnauthorizedException('Unauthorized access: please login to continue');
      }

      const decodedPayload = await this.securityService.validateToken<IAuthUser>(tokenCookie);
      const decodedPayloadData = decodedPayload.getData();

      if (!decodedPayloadData) throw new BadRequestException('Session expired: Your authentication token has expired. Please log in again');

      const user = await this.userService.getUser(decodedPayloadData.id);
      const userData = user.getData();

      if (!userData) {
        throw new BadRequestException('You are not authorized to access this resource: Access Token');
      }

      this.authService.setId(decodedPayloadData.id);
      this.authService.setStatus(userData.status as Status);
      this.authService.setRole(decodedPayloadData.role);

      next();
    } catch (error) {
      throw error;
    }
  }
}
