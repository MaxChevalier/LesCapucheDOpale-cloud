import { FinancesService } from '../services/finances.service';
import { PrismaService } from '../prisma/prisma.service';

describe('FinancesService', () => {
  let service: FinancesService;
  let prisma: PrismaService;

  beforeEach(() => {
    prisma = {
      transaction: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    } as unknown as PrismaService;

    service = new FinancesService(prisma);
  });

  afterEach(() => jest.clearAllMocks());

  describe('addTransaction', () => {
    it('should create a transaction with correct total when no previous transactions', async () => {
      const dto = { amount: 1000, description: 'Test income' };
      const createdTransaction = {
        id: 1,
        amount: 1000,
        description: 'Test income',
        date: new Date(),
        total: 1000,
      };

      (prisma.transaction.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.transaction.create as jest.Mock).mockResolvedValue(createdTransaction);

      const result = await service.addTransaction(dto);

      expect(prisma.transaction.findFirst).toHaveBeenCalledWith({
        orderBy: { id: 'desc' },
        select: { total: true },
      });
      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: {
          amount: 1000,
          description: 'Test income',
          date: expect.any(Date),
          total: 1000,
        },
      });
      expect(result).toEqual(createdTransaction);
    });

    it('should create a transaction with correct total when previous transactions exist', async () => {
      const dto = { amount: 500, description: 'Quest reward' };
      const previousTransaction = { total: 2000 };
      const createdTransaction = {
        id: 2,
        amount: 500,
        description: 'Quest reward',
        date: new Date(),
        total: 2500,
      };

      (prisma.transaction.findFirst as jest.Mock).mockResolvedValue(previousTransaction);
      (prisma.transaction.create as jest.Mock).mockResolvedValue(createdTransaction);

      const result = await service.addTransaction(dto);

      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: {
          amount: 500,
          description: 'Quest reward',
          date: expect.any(Date),
          total: 2500,
        },
      });
      expect(result).toEqual(createdTransaction);
    });

    it('should handle negative amounts (expenses)', async () => {
      const dto = { amount: -300, description: 'Salary payment' };
      const previousTransaction = { total: 1000 };
      const createdTransaction = {
        id: 3,
        amount: -300,
        description: 'Salary payment',
        date: new Date(),
        total: 700,
      };

      (prisma.transaction.findFirst as jest.Mock).mockResolvedValue(previousTransaction);
      (prisma.transaction.create as jest.Mock).mockResolvedValue(createdTransaction);

      const result = await service.addTransaction(dto);

      expect(prisma.transaction.create).toHaveBeenCalledWith({
        data: {
          amount: -300,
          description: 'Salary payment',
          date: expect.any(Date),
          total: 700,
        },
      });
      expect(result).toEqual(createdTransaction);
    });
  });

  describe('getBalance', () => {
    it('should return the current balance from the last transaction', async () => {
      (prisma.transaction.findFirst as jest.Mock).mockResolvedValue({ total: 5000 });

      const result = await service.getBalance();

      expect(prisma.transaction.findFirst).toHaveBeenCalledWith({
        orderBy: { id: 'desc' },
        select: { total: true },
      });
      expect(result).toEqual({ balance: 5000 });
    });

    it('should return 0 when no transactions exist', async () => {
      (prisma.transaction.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.getBalance();

      expect(result).toEqual({ balance: 0 });
    });
  });

  describe('getHistory', () => {
    it('should return transactions with default pagination', async () => {
      const mockTransactions = [
        { id: 2, amount: 500, description: 'Income', date: new Date(), total: 1500 },
        { id: 1, amount: 1000, description: 'Initial', date: new Date(), total: 1000 },
      ];

      (prisma.transaction.findMany as jest.Mock).mockResolvedValue(mockTransactions);
      (prisma.transaction.count as jest.Mock).mockResolvedValue(2);

      const result = await service.getHistory();

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        orderBy: { date: 'desc' },
        skip: 0,
        take: 50,
      });
      expect(prisma.transaction.count).toHaveBeenCalled();
      expect(result).toEqual({
        transactions: mockTransactions,
        totalCount: 2,
        skip: 0,
        take: 50,
      });
    });

    it('should return transactions with custom pagination', async () => {
      const mockTransactions = [{ id: 3, amount: 200, description: 'Test', date: new Date(), total: 2000 }];

      (prisma.transaction.findMany as jest.Mock).mockResolvedValue(mockTransactions);
      (prisma.transaction.count as jest.Mock).mockResolvedValue(100);

      const result = await service.getHistory({ skip: 10, take: 20 });

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        orderBy: { date: 'desc' },
        skip: 10,
        take: 20,
      });
      expect(result).toEqual({
        transactions: mockTransactions,
        totalCount: 100,
        skip: 10,
        take: 20,
      });
    });

    it('should return empty array when no transactions', async () => {
      (prisma.transaction.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.transaction.count as jest.Mock).mockResolvedValue(0);

      const result = await service.getHistory();

      expect(result).toEqual({
        transactions: [],
        totalCount: 0,
        skip: 0,
        take: 50,
      });
    });
  });

  describe('getStatistics', () => {
    it('should calculate correct statistics with mixed transactions', async () => {
      const mockTransactions = [
        { amount: 1000 },
        { amount: 500 },
        { amount: -200 },
        { amount: -100 },
      ];

      (prisma.transaction.findMany as jest.Mock).mockResolvedValue(mockTransactions);
      (prisma.transaction.findFirst as jest.Mock).mockResolvedValue({ total: 1200 });

      const result = await service.getStatistics();

      expect(prisma.transaction.findMany).toHaveBeenCalledWith({
        select: { amount: true },
      });
      expect(result).toEqual({
        totalIncome: 1500,
        totalExpenses: 300,
        balance: 1200,
        transactionCount: 4,
      });
    });

    it('should return zeros when no transactions exist', async () => {
      (prisma.transaction.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.transaction.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await service.getStatistics();

      expect(result).toEqual({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        transactionCount: 0,
      });
    });

    it('should handle only income transactions', async () => {
      const mockTransactions = [
        { amount: 1000 },
        { amount: 2000 },
      ];

      (prisma.transaction.findMany as jest.Mock).mockResolvedValue(mockTransactions);
      (prisma.transaction.findFirst as jest.Mock).mockResolvedValue({ total: 3000 });

      const result = await service.getStatistics();

      expect(result).toEqual({
        totalIncome: 3000,
        totalExpenses: 0,
        balance: 3000,
        transactionCount: 2,
      });
    });

    it('should handle only expense transactions', async () => {
      const mockTransactions = [
        { amount: -500 },
        { amount: -300 },
      ];

      (prisma.transaction.findMany as jest.Mock).mockResolvedValue(mockTransactions);
      (prisma.transaction.findFirst as jest.Mock).mockResolvedValue({ total: -800 });

      const result = await service.getStatistics();

      expect(result).toEqual({
        totalIncome: 0,
        totalExpenses: 800,
        balance: -800,
        transactionCount: 2,
      });
    });
  });
});
