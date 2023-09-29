import { Quiz } from './schema/quiz.schema';
import { CreateQuizDTO } from './dto/create_quiz.dto';
import { ClientSession, Model } from 'mongoose';
import { IPaginationResult } from './../../types/pagination_result.type';
import { PaginationDTO } from './dto/pagination.dto';
import { LoggerService } from '../logger/logger.service';
import { TransactionManager } from '../shared/transaction.manager';
export declare class QuizService {
    private readonly loggerService;
    private readonly quizModel;
    private readonly transactionManager;
    constructor(loggerService: LoggerService, quizModel: Model<Quiz>, transactionManager: TransactionManager);
    createQuiz(payload: CreateQuizDTO, userId: string): Promise<Quiz>;
    getQuizById(quizId: string): Promise<Quiz>;
    getQuizzes(userId: string, pagination: PaginationDTO): Promise<IPaginationResult<Quiz>>;
    updateQuiz(quizId: string, userId: string, payload: Partial<CreateQuizDTO>): Promise<Quiz>;
    deleteQuiz(quizId: string, userId: string, ses?: ClientSession): Promise<void>;
    deleteQuizzes(userId: string, quizId: string[], ses?: ClientSession): Promise<void>;
    deleteAllQuizzes(userId: string, ses?: ClientSession): Promise<void>;
}
