import { Body, Controller, Delete, Get, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { Throttle } from '@nestjs/throttler';
import { DELETE_USER_REQUEST, GET_USER_REQUEST, UPDATE_USER_REQUEST } from '../utils/constant';
import { IPlainUser } from '../types/user.types';
import { UpdateUserDTO } from './dto/update_user.dto';
import { AuthService } from '../shared/auth.service';

@Controller('user')
export class UserController {
  private readonly userService: UserService;
  private readonly authService: AuthService;

  constructor(userService: UserService, authService: AuthService) {
    this.userService = userService;
    this.authService = authService;
  }

  @Throttle(GET_USER_REQUEST.LIMIT, GET_USER_REQUEST.TTL)
  @Get()
  public async getUser(): Promise<IPlainUser> {
    try {
      const id = this.authService.getId();
      const user = await this.userService.getUser(id);
      return user;
    } catch (error) {
      throw error;
    }
  }

  @Throttle(UPDATE_USER_REQUEST.LIMIT, UPDATE_USER_REQUEST.TTL)
  @Patch()
  public async updateUser(@Body() payload: UpdateUserDTO): Promise<IPlainUser> {
    try {
      const id = this.authService.getId();
      const updatedUser = await this.userService.updateUser(payload, id);
      return updatedUser;
    } catch (error) {
      throw error;
    }
  }

  @Throttle(DELETE_USER_REQUEST.LIMIT, DELETE_USER_REQUEST.TTL)
  @Delete()
  public async deleteUser(): Promise<void> {
    try {
      const id = this.authService.getId();
      return await this.userService.deleteUser(id);
    } catch (error) {
      throw error;
    }
  }
}
