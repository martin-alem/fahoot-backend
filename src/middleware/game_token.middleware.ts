import { Injectable, NestMiddleware, BadRequestException, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Response, Request, NextFunction } from 'express';
import { PlayerService } from 'src/modules/player/player.service';
import { SecurityService } from 'src/modules/security/security.service';
import { AuthService } from 'src/modules/shared/auth.service';
import { UserService } from 'src/modules/user/user.service';
import { ISocketAuth, UserRole } from 'src/types/user.types';
import { PLAY_TOKEN_COOKIE_NAME, Status } from 'src/utils/constant';

@Injectable()
export class GameTokenMiddleware implements NestMiddleware, OnModuleInit {
  private readonly moduleRef: ModuleRef;
  private playerService: PlayerService;
  private securityService: SecurityService;
  private userService: UserService;
  private authService: AuthService;

  constructor(moduleRef: ModuleRef) {
    this.moduleRef = moduleRef;
  }

  onModuleInit(): void {
    this.userService = this.moduleRef.get<UserService>(UserService, { strict: false });
    this.playerService = this.moduleRef.get<PlayerService>(PlayerService, { strict: false });
    this.securityService = this.moduleRef.get<SecurityService>(SecurityService, { strict: false });
    this.authService = this.moduleRef.get<AuthService>(AuthService, { strict: false });
  }

  async use(req: Request, _res: Response, next: NextFunction): Promise<void> {
    try {
      const tokenCookie = req.cookies[PLAY_TOKEN_COOKIE_NAME];
      if (!tokenCookie) {
        throw new UnauthorizedException('Unauthorized access: please join the game to continue');
      }

      const decodedPayload = await this.securityService.validateToken<ISocketAuth>(tokenCookie);
      const decodedPayloadData = decodedPayload.getData();

      if (!decodedPayloadData) throw new BadRequestException('Session expired: Your play token has expired');

      let userData = null;

      if (decodedPayloadData.role === UserRole.ORGANIZER) {
        const user = await this.userService.getUser(decodedPayloadData.id);
        userData = user.getData();
      } else {
        const user = await this.playerService.getPlayerById(decodedPayloadData.id);
        userData = user.getData();
      }

      if (!userData) {
        throw new BadRequestException('You are not authorized to access this resource');
      }

      this.authService.setId(decodedPayloadData.id);
      this.authService.setStatus(userData.status as Status);
      this.authService.setRole(decodedPayloadData.role);
      this.authService.setRoom(decodedPayloadData.room);

      next();
    } catch (error) {
      throw error;
    }
  }
}
