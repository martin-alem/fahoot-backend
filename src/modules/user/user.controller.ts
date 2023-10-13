import { Body, Controller, Delete, Get, Patch, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { Throttle } from '@nestjs/throttler';
import { UpdateUserDTO } from './dto/update_user.dto';
import { AuthService } from '../shared/auth.service';
import { Active, Role } from './../../decorator/auth.decorator';
import { AuthorizationGuard } from './../../guard/auth.guard';
import { DELETE_USER_REQUEST, GET_USER_REQUEST, Status, UPDATE_USER_REQUEST } from './../../utils/constant';
import { UserRole } from './../../types/user.types';
import { handleResult } from './../../utils/helper';
import { ResponseInterceptor } from './../../interceptor/response.interceptor';
import { UserShape } from '../authentication/response/UserShape';
import { User } from './schema/user.schema';

@Controller('user')
export class UserController {
  private readonly userService: UserService;
  private readonly authService: AuthService;

  constructor(userService: UserService, authService: AuthService) {
    this.userService = userService;
    this.authService = authService;
  }

  @Throttle(GET_USER_REQUEST.LIMIT, GET_USER_REQUEST.TTL)
  @Role([UserRole.CREATOR])
  @Active([Status.INACTIVE, Status.ACTIVE])
  @UseGuards(AuthorizationGuard)
  @UseInterceptors(new ResponseInterceptor(UserShape))
  @Get()
  public async getUser(): Promise<User> {
    try {
      const id = this.authService.getId();

      const result = await this.userService.getUser(id);

      return handleResult<User>(result);
    } catch (error) {
      throw error;
    }
  }

  @Throttle(UPDATE_USER_REQUEST.LIMIT, UPDATE_USER_REQUEST.TTL)
  @Role([UserRole.CREATOR])
  @Active([Status.ACTIVE])
  @UseGuards(AuthorizationGuard)
  @UseInterceptors(new ResponseInterceptor(UserShape))
  @Patch()
  public async updateUser(@Body() payload: UpdateUserDTO): Promise<User> {
    try {
      const id = this.authService.getId();

      const result = await this.userService.updateUser(payload, id);

      return handleResult<User>(result);
    } catch (error) {
      throw error;
    }
  }

  @Throttle(DELETE_USER_REQUEST.LIMIT, DELETE_USER_REQUEST.TTL)
  @Role([UserRole.CREATOR])
  @Active([Status.ACTIVE])
  @UseGuards(AuthorizationGuard)
  @Delete()
  public async deleteUser(): Promise<boolean> {
    try {
      const id = this.authService.getId();

      const result = await this.userService.deleteUser(id);

      return handleResult<boolean>(result);
    } catch (error) {
      throw error;
    }
  }
}
