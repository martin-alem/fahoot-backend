import { BadRequestException, Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common';
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
        throw new UnauthorizedException('Access token not found');
      }

      const decodedPayload = await this.securityService.validateToken(tokenCookie);
      const decodedPayloadData = decodedPayload.getData();
      if (!decodedPayloadData) throw new BadRequestException('Unable to decode token');

      const user = await this.userService.getUser(decodedPayloadData.id);
      const userData = user.getData();
      if (!userData) {
        throw new BadRequestException(`User ${decodedPayloadData.id} not found`);
      }
      this.authService.setId(decodedPayloadData.id);
      this.authService.setStatus(userData.status);
      this.authService.setRole(decodedPayloadData.role);
      next();
    } catch (error) {
      throw error;
    }
  }
}
