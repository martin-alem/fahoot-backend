import { BadRequestException, ForbiddenException, Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SecurityService } from './../security/security.service';
import { UserService } from './../user/user.service';
import { AuthService } from '../shared/auth.service';

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
    const tokenCookie = req.cookies['_access_token'];

    if (!tokenCookie) {
      throw new ForbiddenException('Token cookie not found');
    }

    const decodedPayload = await this.securityService.validateToken(tokenCookie);

    // Check if the user exists
    try {
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
        throw new ForbiddenException('Invalid user');
      }
      throw error;
    }
  }
}
