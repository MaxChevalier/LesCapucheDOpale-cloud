import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { FinancesService } from '../services/finances.service';
import type { CreateTransactionDto } from '../services/finances.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Finances')
@ApiBearerAuth()
@Controller('finances')
export class FinancesController {
  constructor(private readonly financesService: FinancesService) {}

  @Get('balance')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @ApiOkResponse({
    description: 'Solde actuel de la guilde',
    schema: {
      type: 'object',
      properties: {
        balance: { type: 'number', example: 15000 },
      },
    },
  })
  getBalance() {
    return this.financesService.getBalance();
  }

  @Get('history')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @ApiQuery({ name: 'skip', required: false, type: Number, example: 0 })
  @ApiQuery({ name: 'take', required: false, type: Number, example: 50 })
  @ApiOkResponse({
    description: 'Historique des transactions',
    schema: {
      type: 'object',
      properties: {
        transactions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 1 },
              amount: { type: 'number', example: 1000 },
              description: { type: 'string', example: 'Avance 20% quête #5' },
              date: {
                type: 'string',
                format: 'date-time',
                example: '2026-01-12T10:00:00.000Z',
              },
              total: { type: 'number', example: 15000 },
            },
          },
        },
        totalCount: { type: 'number', example: 100 },
        skip: { type: 'number', example: 0 },
        take: { type: 'number', example: 50 },
      },
    },
  })
  getHistory(@Query('skip') skip?: string, @Query('take') take?: string) {
    return this.financesService.getHistory({
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    });
  }

  @Get('statistics')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @ApiOkResponse({
    description: 'Statistiques financières',
    schema: {
      type: 'object',
      properties: {
        totalIncome: { type: 'number', example: 50000 },
        totalExpenses: { type: 'number', example: 35000 },
        balance: { type: 'number', example: 15000 },
        transactionCount: { type: 'number', example: 100 },
      },
    },
  })
  getStatistics() {
    return this.financesService.getStatistics();
  }

  @Post('transaction')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1)
  @ApiBody({
    description:
      'Nouvelle transaction (amount positif = recette, négatif = dépense)',
    required: true,
    schema: {
      type: 'object',
      properties: {
        amount: { type: 'number', example: 1000 },
        description: { type: 'string', example: 'Vente équipement' },
      },
      required: ['amount', 'description'],
    },
  })
  @ApiCreatedResponse({
    description: 'Transaction créée',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 42 },
        amount: { type: 'number', example: 1000 },
        description: { type: 'string', example: 'Vente équipement' },
        date: {
          type: 'string',
          format: 'date-time',
          example: '2026-01-12T10:00:00.000Z',
        },
        total: { type: 'number', example: 16000 },
      },
    },
  })
  addTransaction(@Body() dto: CreateTransactionDto) {
    return this.financesService.addTransaction(dto);
  }
}
