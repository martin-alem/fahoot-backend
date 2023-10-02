import { UserService } from './user.service';
import { Request } from 'express';
import { UpdateUserDTO } from './dto/update_user.dto';
import { AuthService } from '../shared/auth.service';
import { LoggerService } from '../logger/logger.service';
import { UserDocument } from './schema/user.schema';
export declare class UserController {
    private readonly userService;
    private readonly authService;
    private readonly loggerService;
    constructor(userService: UserService, authService: AuthService, loggerService: LoggerService);
    getUser(request: Request): Promise<UserDocument>;
    updateUser(payload: UpdateUserDTO, request: Request): Promise<UserDocument>;
    deleteUser(request: Request): Promise<UserDocument>;
}
