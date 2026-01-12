import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ConsumablesService } from '../services/consumables.service';
import { CreateConsumableDto } from '../dto/create-consumable.dto';
import { UpdateConsumableDto } from '../dto/update-consumable.dto';
import { PurchaseConsumableDto } from '../dto/purchase-consumable.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';

@ApiTags('Consumables')
@ApiBearerAuth()
@Controller('consumables')
export class ConsumablesController {
  constructor(private readonly consumablesService: ConsumablesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiBody({
    description: 'New consumable payload',
    required: true,
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Potion de soin' },
        consumableTypeId: { type: 'number', example: 1 },
        quantity: { type: 'number', example: 10 },
        cost: { type: 'number', example: 25 },
      },
      required: ['name', 'consumableTypeId', 'quantity', 'cost'],
      additionalProperties: false,
    },
  })
  @ApiCreatedResponse({
    description: 'Consumable created',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Potion de soin' },
        consumableTypeId: { type: 'number', example: 1 },
        quantity: { type: 'number', example: 10 },
        cost: { type: 'number', example: 25 },
        createdAt: {
          type: 'string',
          format: 'date-time',
          example: '2025-12-12T10:00:00.000Z',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          example: '2025-12-12T10:00:00.000Z',
        },
      },
    },
  })
  create(@Body() dto: CreateConsumableDto) {
    return this.consumablesService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiOkResponse({
    description: 'List of consumables',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 1 },
          name: { type: 'string', example: 'Potion de soin' },
          consumableTypeId: { type: 'number', example: 1 },
          quantity: { type: 'number', example: 10 },
          cost: { type: 'number', example: 25 },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-12-12T10:00:00.000Z',
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            example: '2025-12-12T10:00:00.000Z',
          },
        },
      },
    },
  })
  findAll() {
    return this.consumablesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 1, description: 'Consumable ID' })
  @ApiOkResponse({
    description: 'Consumable by id',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Potion de soin' },
        consumableTypeId: { type: 'number', example: 1 },
        quantity: { type: 'number', example: 10 },
        cost: { type: 'number', example: 25 },
        createdAt: {
          type: 'string',
          format: 'date-time',
          example: '2025-12-12T10:00:00.000Z',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          example: '2025-12-12T10:00:00.000Z',
        },
      },
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.consumablesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 1, description: 'Consumable ID' })
  @ApiBody({
    description: 'Fields to update (partial)',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Grande potion de soin' },
        consumableTypeId: { type: 'number', example: 2 },
        quantity: { type: 'number', example: 15 },
        cost: { type: 'number', example: 50 },
      },
      additionalProperties: false,
    },
  })
  @ApiOkResponse({
    description: 'Updated consumable',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Grande potion de soin' },
        consumableTypeId: { type: 'number', example: 2 },
        quantity: { type: 'number', example: 15 },
        cost: { type: 'number', example: 50 },
        createdAt: {
          type: 'string',
          format: 'date-time',
          example: '2025-12-12T10:00:00.000Z',
        },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          example: '2025-12-12T10:30:00.000Z',
        },
      },
    },
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateConsumableDto,
  ) {
    return this.consumablesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 1, description: 'Consumable ID' })
  @ApiOkResponse({
    description: 'Delete result',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        deleted: { type: 'boolean', example: true },
      },
    },
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.consumablesService.remove(id);
  }

  @Post(':id/purchase')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  @ApiParam({ name: 'id', example: 1, description: 'Consumable ID' })
  @ApiBody({
    description: 'Quantité à acheter',
    required: true,
    schema: {
      type: 'object',
      properties: {
        quantity: {
          type: 'number',
          example: 3,
          description: 'Nombre de consommables à acheter',
        },
      },
      required: ['quantity'],
    },
  })
  @ApiOkResponse({
    description: 'Achat effectué avec succès',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 1 },
        name: { type: 'string', example: 'Potion de soin' },
        quantity: { type: 'number', example: 13 },
        updatedAt: {
          type: 'string',
          format: 'date-time',
          example: '2025-12-12T10:00:00.000Z',
        },
      },
    },
  })
  purchase(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: PurchaseConsumableDto,
  ) {
    return this.consumablesService.purchase(id, dto.quantity);
  }
}
