import { Controller, Post } from '@nestjs/common';
import { SignUpDTO } from './dto/signup.dto';
import { IPlainUser } from 'src/types/user.types';
import { AuthenticationService } from './authentication.service';
import { SignInDTO } from './dto/signin.dto';
import { Throttle } from '@nestjs/throttler';
import { SIGNIN_REQUEST, SIGNUP_REQUEST } from 'src/utils/constant';

@Controller('authentication')
export class AuthenticationController {
  private readonly authenticationService: AuthenticationService;

  constructor(authenticationService: AuthenticationService) {
    this.authenticationService = authenticationService;
  }
  @Throttle(SIGNUP_REQUEST.LIMIT, SIGNUP_REQUEST.TTL)
  @Post('/signup')
  public async signup(payload: SignUpDTO | string): Promise<IPlainUser> {
    try {
      const user = await this.authenticationService.signUp(payload);
      return user;
    } catch (error) {
      throw error;
    }
  }

  @Throttle(SIGNIN_REQUEST.LIMIT, SIGNIN_REQUEST.TTL)
  @Post('/signin')
  public async signin(payload: SignInDTO | string): Promise<IPlainUser> {
    try {
      const user = await this.authenticationService.signIn(payload);
      return user;
    } catch (error) {
      throw error;
    }
  }
}
