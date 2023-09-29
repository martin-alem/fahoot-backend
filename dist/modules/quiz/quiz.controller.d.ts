import { QuizService } from './quiz.service';
import { Request } from 'express';
import { CreateQuizDTO } from './dto/create_quiz.dto';
import { Quiz } from './schema/quiz.schema';
import { IPaginationResult } from './../../types/pagination_result.type';
import { AuthService } from '../shared/auth.service';
import { LoggerService } from '../logger/logger.service';
export declare class QuizController {
    private readonly quizService;
    private readonly authService;
    private readonly loggerService;
    constructor(quizService: QuizService, authService: AuthService, loggerService: LoggerService);
    createQuiz(payload: CreateQuizDTO, request: Request): Promise<Quiz>;
    getQuiz(quizId: string, request: Request): Promise<Quiz>;
    getQuizzes(page: number, query: string, pageSize: number, sortField: string, sortOrder: 'asc' | 'desc', request: Request): Promise<IPaginationResult<Quiz>>;
    updateQuiz(quizId: string, payload: Partial<CreateQuizDTO>, request: Request): Promise<Quiz>;
    deleteQuiz(quizId: string, request: Request): Promise<void>;
    deleteAllQuizzes(quizId: string, request: Request): Promise<void>;
}
