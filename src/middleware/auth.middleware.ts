import { BadRequestException, ForbiddenException, Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SecurityService } from './../modules/security/security.service';
import { AuthService } from './../modules/shared/auth.service';
import { UserService } from './../modules/user/user.service';

@Injectable()
export class AuthenticationMiddleware implements NestMiddleware {
  private readonly securityService: SecurityService;
  private readonly userService: UserService;
  private readonly authService: AuthService;

  constructor(securityService: SecurityService, userService: UserService, authService: AuthService) {
    this.securityService = securityService;
    this.userService = userService;
    this.authService = authService;
  }

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tokenCookie = req.cookies['_access_token'];
      if (!tokenCookie) {
        throw new ForbiddenException('Token cookie not found');
      }

      const decodedPayload = await this.securityService.validateToken(tokenCookie);

      const user = await this.userService.getUser(decodedPayload.id);
      if (!user) {
        throw new NotFoundException(`User ${decodedPayload.id} not found`);
      }
      this.authService.setId(decodedPayload.id);
      this.authService.setStatus(user.status);
      this.authService.setRole(decodedPayload.role);
      next();
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw new ForbiddenException('Invalid token or user');
      }
      throw error;
    }
  }
}
