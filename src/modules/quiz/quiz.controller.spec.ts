import { Test, TestingModule } from '@nestjs/testing';
import { QuizController } from './quiz.controller';
import { LoggerService } from '../logger/logger.service';
import { AuthService } from '../shared/auth.service';
import { QuizService } from './quiz.service';

describe('QuizController', () => {
  let controller: QuizController;
  const mockLoggerService = {
    log: jest.fn(),
  };

  const mockAuthService = {};

  const mockService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuizController],
      providers: [
        { provide: LoggerService, useValue: mockLoggerService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: QuizService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<QuizController>(QuizController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
