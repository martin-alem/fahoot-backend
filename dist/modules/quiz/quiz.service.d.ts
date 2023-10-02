import { Quiz } from './schema/quiz.schema';
import { CreateQuizDTO } from './dto/create_quiz.dto';
import { ClientSession, Model } from 'mongoose';
import { IPaginationResult } from './../../types/pagination_result.type';
import { PaginationDTO } from './dto/pagination.dto';
import { LoggerService } from '../logger/logger.service';
import { TransactionManager } from '../shared/transaction.manager';
import Result from 'src/wrapper/result';
export declare class QuizService {
    private readonly loggerService;
    private readonly quizModel;
    private readonly transactionManager;
    constructor(loggerService: LoggerService, quizModel: Model<Quiz>, transactionManager: TransactionManager);
    createQuiz(payload: CreateQuizDTO, userId: string): Promise<Result<Quiz | null>>;
    getQuizById(quizId: string): Promise<Result<Quiz | null>>;
    getQuizzes(userId: string, pagination: PaginationDTO): Promise<Result<IPaginationResult<Quiz> | null>>;
    updateQuiz(quizId: string, userId: string, payload: Partial<CreateQuizDTO>): Promise<Result<Quiz | null>>;
    deleteQuiz(quizId: string, userId: string, ses?: ClientSession): Promise<Result<Quiz | null>>;
    deleteAllQuizzes(userId: string, session?: ClientSession): Promise<Result<boolean | null>>;
}
