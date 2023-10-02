import { Body, Controller, Delete, Get, Patch, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { UpdateUserDTO } from './dto/update_user.dto';
import { AuthService } from '../shared/auth.service';
import { Active, Role } from './../../decorator/auth.decorator';
import { AuthorizationGuard } from './../../guard/auth.guard';
import { DELETE_USER_REQUEST, GET_USER_REQUEST, Status, UPDATE_USER_REQUEST } from './../../utils/constant';
import { UserRole } from './../../types/user.types';
import { LoggerService } from '../logger/logger.service';
import { handleResult, log } from './../../utils/helper';
import { LEVEL } from './../../types/log.types';
import { UserDocument } from './schema/user.schema';
import { ResponseInterceptor } from './../../interceptor/response.interceptor';
import { UserShape } from '../authentication/response/UserShape';

@Controller('user')
export class UserController {
  private readonly userService: UserService;
  private readonly authService: AuthService;
  private readonly loggerService: LoggerService;

  constructor(userService: UserService, authService: AuthService, loggerService: LoggerService) {
    this.userService = userService;
    this.authService = authService;
    this.loggerService = loggerService;
  }

  @Throttle(GET_USER_REQUEST.LIMIT, GET_USER_REQUEST.TTL)
  @Role(UserRole.USER)
  @UseGuards(AuthorizationGuard)
  @UseInterceptors(new ResponseInterceptor(UserShape))
  @Get()
  public async getUser(@Req() request: Request): Promise<UserDocument> {
    try {
      const id = this.authService.getId();

      const result = await this.userService.getUser(id);

      return handleResult<UserDocument>(result);
    } catch (error) {
      log(this.loggerService, 'get_user_error', error.message, request, LEVEL.CRITICAL);
      throw error;
    }
  }

  @Throttle(UPDATE_USER_REQUEST.LIMIT, UPDATE_USER_REQUEST.TTL)
  @Role(UserRole.USER)
  @Active(Status.ACTIVE)
  @UseGuards(AuthorizationGuard)
  @UseInterceptors(new ResponseInterceptor(UserShape))
  @Patch()
  public async updateUser(@Body() payload: UpdateUserDTO, @Req() request: Request): Promise<UserDocument> {
    try {
      const id = this.authService.getId();

      const result = await this.userService.updateUser(payload, id);

      return handleResult<UserDocument>(result);
    } catch (error) {
      log(this.loggerService, 'update_user_error', error.message, request, LEVEL.CRITICAL);
      throw error;
    }
  }

  @Throttle(DELETE_USER_REQUEST.LIMIT, DELETE_USER_REQUEST.TTL)
  @Role(UserRole.USER)
  @UseGuards(AuthorizationGuard)
  @UseInterceptors(new ResponseInterceptor(UserShape))
  @Delete()
  public async deleteUser(@Req() request: Request): Promise<UserDocument> {
    try {
      const id = this.authService.getId();

      const result = await this.userService.deleteUser(id);

      return handleResult<UserDocument>(result);
    } catch (error) {
      log(this.loggerService, 'update_user_error', error.message, request, LEVEL.CRITICAL);
      throw error;
    }
  }
}
