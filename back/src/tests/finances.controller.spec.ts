import { Test, TestingModule } from '@nestjs/testing';
import { FinancesController } from '../controllers/finances.controller';
import { FinancesService } from '../services/finances.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { ExecutionContext } from '@nestjs/common';

describe('FinancesController', () => {
  let controller: FinancesController;
  let service: FinancesService;

  const mockFinancesService = {
    getBalance: jest.fn(),
    getHistory: jest.fn(),
    getStatistics: jest.fn(),
    addTransaction: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: (context: ExecutionContext) => {
      const req = context.switchToHttp().getRequest();
      req.user = { id: 1, email: 'admin@mail.com', roleId: 1 };
      return true;
    },
  };

  const mockRolesGuard = {
    canActivate: () => true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FinancesController],
      providers: [{ provide: FinancesService, useValue: mockFinancesService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    controller = module.get<FinancesController>(FinancesController);
    service = module.get<FinancesService>(FinancesService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getBalance', () => {
    it('should call service.getBalance() and return the balance', async () => {
      const mockBalance = { balance: 15000 };
      mockFinancesService.getBalance.mockResolvedValue(mockBalance);

      const result = await controller.getBalance();

      expect(service.getBalance).toHaveBeenCalled();
      expect(result).toEqual(mockBalance);
    });
  });

  describe('getHistory', () => {
    it('should call service.getHistory() without pagination params', async () => {
      const mockHistory = {
        transactions: [{ id: 1, amount: 1000, description: 'Test', date: new Date(), total: 1000 }],
        totalCount: 1,
        skip: 0,
        take: 50,
      };
      mockFinancesService.getHistory.mockResolvedValue(mockHistory);

      const result = await controller.getHistory();

      expect(service.getHistory).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
      });
      expect(result).toEqual(mockHistory);
    });

    it('should call service.getHistory() with pagination params', async () => {
      const mockHistory = {
        transactions: [],
        totalCount: 100,
        skip: 10,
        take: 20,
      };
      mockFinancesService.getHistory.mockResolvedValue(mockHistory);

      const result = await controller.getHistory('10', '20');

      expect(service.getHistory).toHaveBeenCalledWith({
        skip: 10,
        take: 20,
      });
      expect(result).toEqual(mockHistory);
    });

    it('should handle partial pagination params (only skip)', async () => {
      const mockHistory = {
        transactions: [],
        totalCount: 50,
        skip: 5,
        take: 50,
      };
      mockFinancesService.getHistory.mockResolvedValue(mockHistory);

      const result = await controller.getHistory('5', undefined);

      expect(service.getHistory).toHaveBeenCalledWith({
        skip: 5,
        take: undefined,
      });
      expect(result).toEqual(mockHistory);
    });

    it('should handle partial pagination params (only take)', async () => {
      const mockHistory = {
        transactions: [],
        totalCount: 50,
        skip: 0,
        take: 10,
      };
      mockFinancesService.getHistory.mockResolvedValue(mockHistory);

      const result = await controller.getHistory(undefined, '10');

      expect(service.getHistory).toHaveBeenCalledWith({
        skip: undefined,
        take: 10,
      });
      expect(result).toEqual(mockHistory);
    });
  });

  describe('getStatistics', () => {
    it('should call service.getStatistics() and return statistics', async () => {
      const mockStats = {
        totalIncome: 50000,
        totalExpenses: 35000,
        balance: 15000,
        transactionCount: 100,
      };
      mockFinancesService.getStatistics.mockResolvedValue(mockStats);

      const result = await controller.getStatistics();

      expect(service.getStatistics).toHaveBeenCalled();
      expect(result).toEqual(mockStats);
    });
  });

  describe('addTransaction', () => {
    it('should call service.addTransaction() for income', async () => {
      const dto = { amount: 1000, description: 'Quest reward' };
      const mockTransaction = {
        id: 1,
        amount: 1000,
        description: 'Quest reward',
        date: new Date(),
        total: 16000,
      };
      mockFinancesService.addTransaction.mockResolvedValue(mockTransaction);

      const result = await controller.addTransaction(dto);

      expect(service.addTransaction).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockTransaction);
    });

    it('should call service.addTransaction() for expense', async () => {
      const dto = { amount: -500, description: 'Equipment purchase' };
      const mockTransaction = {
        id: 2,
        amount: -500,
        description: 'Equipment purchase',
        date: new Date(),
        total: 14500,
      };
      mockFinancesService.addTransaction.mockResolvedValue(mockTransaction);

      const result = await controller.addTransaction(dto);

      expect(service.addTransaction).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockTransaction);
    });
  });
});
