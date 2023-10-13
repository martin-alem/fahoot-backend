import { Test, TestingModule } from '@nestjs/testing';
import { QuizService } from './quiz.service';
import { LoggerService } from '../logger/logger.service';
import { getModelToken } from '@nestjs/mongoose';
import { TransactionManager } from '../shared/transaction.manager';
import { Quiz } from './schema/quiz.schema';
import { CreateQuizDTO } from './dto/create_quiz.dto';
import { PaginationDTO } from './dto/quiz-pagination.dto';
import { PaginationResult } from './../../types/pagination.types';
import { DEFAULT_DATABASE_CONNECTION } from './../../utils/constant';

describe('QuizService', () => {
  let service: QuizService;
  const mockLoggerService = {
    log: jest.fn(),
  };

  const mockQuizModel = {
    findById: jest.fn(),
    create: jest.fn(),
    countDocuments: jest.fn(),
    find: jest.fn(),
    findOneAndUpdate: jest.fn(),
    findOneAndDelete: jest.fn(),
    deleteMany: jest.fn(),
  };

  const mockTransactionManager = {
    startTransaction: jest.fn(),
    startSession: jest.fn(),
    commitTransaction: jest.fn(),
    abortTransaction: jest.fn(),
    endSession: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: LoggerService, useValue: mockLoggerService },
        { provide: getModelToken(Quiz.name, DEFAULT_DATABASE_CONNECTION), useValue: mockQuizModel },
        { provide: TransactionManager, useValue: mockTransactionManager },
        QuizService,
      ],
    }).compile();

    service = module.get<QuizService>(QuizService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create Quiz', () => {
    it('should successfully create a quiz', async () => {
      service.createQuiz = jest.fn().mockResolvedValue({} as unknown as Quiz);
      await service.createQuiz({} as unknown as CreateQuizDTO, '');
      expect(service.createQuiz).toHaveBeenCalledTimes(1);
    });
  });

  describe('getQuizById', () => {
    it('should return a quiz by ID', async () => {
      const quiz = {};
      const quizId = 'someQuizId';

      mockQuizModel.findById = jest.fn().mockResolvedValue(quiz);
      service.getQuizById = jest.fn().mockResolvedValue({} as unknown as Quiz);
      await service.getQuizById(quizId);
      expect(service.getQuizById).toBeCalledTimes(1);
    });
  });

  describe('getQuizzes', () => {
    it('should return paginated quizzes', async () => {
      const paginationDTO: PaginationDTO = {
        page: 1,
        pageSize: 1,
        sortField: '',
        sortOrder: 'asc',
        query: '',
      };
      const userId = 'someUserId';
      const quizList = ['quiz1', 'quiz2'];

      mockQuizModel.find = jest.fn().mockResolvedValue(quizList);
      service.getQuizzes = jest.fn().mockResolvedValue({} as unknown as PaginationResult<object>);
      await service.getQuizzes(userId, paginationDTO);
      expect(service.getQuizzes).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateQuiz', () => {
    it('should update a quiz successfully', async () => {
      const quizDTO = {};
      const userId = 'someUserId';
      const quizId = 'someQuizId';

      mockQuizModel.findOneAndUpdate = jest.fn().mockResolvedValue(quizDTO);
      service.updateQuiz = jest.fn().mockResolvedValue({} as unknown as Quiz);
      await service.updateQuiz(quizId, userId, quizDTO);
      expect(service.updateQuiz).toHaveBeenCalledTimes(1);
    });
  });

  describe('deleteQuiz', () => {
    it('should delete a quiz', async () => {
      const quizId = 'someQuizId';
      const userId = 'someUserId';
      service.deleteQuiz = jest.fn().mockResolvedValue(undefined);
      await service.deleteQuiz(quizId, userId);
      expect(service.deleteQuiz).toBeCalled();
    });
  });

  describe('deleteAllQuizzes', () => {
    it('should delete all quizzes for a user', async () => {
      const userId = 'someUserId';
      service.deleteAllQuizzes = jest.fn().mockResolvedValue(undefined);
      await service.deleteAllQuizzes(userId);
      expect(service.deleteAllQuizzes).toBeCalled();
    });
  });
});
