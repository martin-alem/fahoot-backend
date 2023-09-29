import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { NotificationService } from './../notification/notification.service';
import { Model } from 'mongoose';
import { Token } from './schema/tokens.schema';
import { UserService } from './../user/user.service';
import { IAuthUser } from './../../types/user.types';
import { EmailPurpose } from './../../utils/constant';
export declare class SecurityService {
    private readonly jwtService;
    private readonly configService;
    private readonly notificationService;
    private readonly tokenModel;
    private readonly userService;
    constructor(jwtService: JwtService, configService: ConfigService, userService: UserService, notificationService: NotificationService, tokenModel: Model<Token>);
    signToken(user: IAuthUser, ttl: number): Promise<string>;
    validateToken(token: string): Promise<IAuthUser>;
    hash(data: string): Promise<string>;
    compare(incomingData: string, hashedData: string): Promise<boolean>;
    generateTokens(user: IAuthUser, tokenTTL: number): Promise<string>;
    queueVerificationEmail(emailAddress: string, subject: string, emailPurpose: EmailPurpose): Promise<void>;
    private verifyToken;
    verifyEmail(token: string): Promise<void>;
    updatePassword(oldPassword: string, newPassword: string, userId: string): Promise<void>;
    updateEmail(newEmailAddress: string, userId: string): Promise<void>;
    passwordResetRequest(emailAddress: string): Promise<void>;
    passwordReset(token: string, password: string): Promise<void>;
}
