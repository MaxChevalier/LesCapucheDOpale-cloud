import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateTransactionDto {
  amount: number;
  description: string;
}

export interface TransactionResult {
  id: number;
  amount: number;
  description: string;
  date: Date;
  total: number;
}

@Injectable()
export class FinancesService {
  constructor(private prisma: PrismaService) {}

  async addTransaction(dto: CreateTransactionDto): Promise<TransactionResult> {
    const { amount, description } = dto;

    const lastTransaction = await this.prisma.transaction.findFirst({
      orderBy: { id: 'desc' },
      select: { total: true },
    });

    const previousTotal = lastTransaction?.total ?? 0;
    const newTotal = previousTotal + amount;

    const transaction = await this.prisma.transaction.create({
      data: {
        amount,
        description,
        date: new Date(),
        total: newTotal,
      },
    });

    return transaction;
  }

  async getBalance(): Promise<{ balance: number }> {
    const lastTransaction = await this.prisma.transaction.findFirst({
      orderBy: { id: 'desc' },
      select: { total: true },
    });

    return { balance: lastTransaction?.total ?? 0 };
  }

  async getHistory(options: { skip?: number; take?: number } = {}) {
    const { skip = 0, take = 50 } = options;

    const [transactions, totalCount] = await Promise.all([
      this.prisma.transaction.findMany({
        orderBy: { date: 'desc' },
        skip,
        take,
      }),
      this.prisma.transaction.count(),
    ]);

    return {
      transactions,
      totalCount,
      skip,
      take,
    };
  }

  async getStatistics() {
    const allTransactions = await this.prisma.transaction.findMany({
      select: { amount: true },
    });

    let totalIncome = 0;
    let totalExpenses = 0;

    for (const t of allTransactions) {
      if (t.amount > 0) {
        totalIncome += t.amount;
      } else {
        totalExpenses += Math.abs(t.amount);
      }
    }

    const { balance } = await this.getBalance();

    return {
      totalIncome,
      totalExpenses,
      balance,
      transactionCount: allTransactions.length,
    };
  }
}
