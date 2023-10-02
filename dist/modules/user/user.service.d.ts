import { User, UserDocument } from './schema/user.schema';
import { ClientSession, Model } from 'mongoose';
import { UpdateUserDTO } from './dto/update_user.dto';
import { SecurityService } from './../security/security.service';
import { IInternalUser, IInternalUpdate } from './../../types/user.types';
import { TransactionManager } from '../shared/transaction.manager';
import { QuizService } from '../quiz/quiz.service';
import Result from 'src/wrapper/result';
export declare class UserService {
    private readonly securityService;
    private readonly userModel;
    private readonly transactionManager;
    private readonly quizService;
    constructor(securityService: SecurityService, userModel: Model<User>, transactionManager: TransactionManager, quizService: QuizService);
    createUser(payload: IInternalUser, session?: ClientSession): Promise<Result<UserDocument | null>>;
    getUser(userId: string): Promise<Result<UserDocument | null>>;
    findByEmailAddress(emailAddress: string): Promise<Result<UserDocument | null>>;
    updateUser(payload: UpdateUserDTO, userId: string, session?: ClientSession): Promise<Result<UserDocument | null>>;
    updateSensitiveData(payload: IInternalUpdate, emailAddress: string, session?: ClientSession): Promise<Result<UserDocument | null>>;
    deleteUser(userId: string): Promise<Result<UserDocument | null>>;
}
