/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { of } from 'rxjs';
import { Test, TestingModule } from '@nestjs/testing';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { ResponseInterceptor } from './response.interceptor';

type MyDataType = { [key: string]: any };

describe('ResponseInterceptor', () => {
  let interceptor: ResponseInterceptor<MyDataType>;
  let mockExecutionContext: ExecutionContext;
  let mockCallHandler: CallHandler<MyDataType>;

  beforeEach(async () => {
    const mockResponseShape = {
      field1: true,
      field2: true,
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ResponseInterceptor,
          useValue: new ResponseInterceptor(mockResponseShape),
        },
      ],
    }).compile();

    interceptor = module.get<ResponseInterceptor<MyDataType>>(ResponseInterceptor);

    mockExecutionContext = {} as unknown as ExecutionContext;

    mockCallHandler = {
      handle: jest.fn().mockImplementation(() => of({ toObject: () => ({ property: true }) })),
    } as unknown as CallHandler<MyDataType>;
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('should transform data based on responseShape', (done) => {
      const responseShape: { [key: string]: boolean } = { property: true };
      const customInterceptor = new ResponseInterceptor<MyDataType>(responseShape);

      customInterceptor.intercept(mockExecutionContext, mockCallHandler).subscribe((transformedData) => {
        expect(transformedData).toEqual(responseShape);
        done();
      });
    });
  });

  describe('transformData', () => {
    it('should transform data based on the response shape', () => {
      const mockData = {
        toObject: () => ({
          field1: 'someValue1',
          field2: 'someValue2',
          field3: 'someValue3',
        }),
      };
      const transformedData = interceptor['transformData'](mockData as unknown as { [key: string]: any });

      expect(transformedData).toEqual({
        field1: 'someValue1',
        field2: 'someValue2',
      });
    });

    it('should return empty object if no fields match the response shape', () => {
      const mockData = {
        toObject: () => ({
          field4: 'someValue4',
        }),
      };
      const transformedData = interceptor['transformData'](mockData as unknown as { [key: string]: any });
      expect(transformedData).toEqual({});
    });
  });
});
