import {Controller,Get,Post,Body,Patch,Param,Delete,UseGuards,} from '@nestjs/common';
import { ConsumableTypesService } from '../services/consumable-types.service';
import { CreateConsumableTypeDto } from '../dto/create-consumable-type.dto';
import { UpdateConsumableTypeDto } from '../dto/update-consumable-type.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';

@Controller('consumable-types')
export class ConsumableTypesController {
  constructor(
    private readonly consumableTypesService: ConsumableTypesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  create(@Body() dto: CreateConsumableTypeDto) {
    return this.consumableTypesService.create(dto);
  }

  @Get()
  findAll() {
    return this.consumableTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.consumableTypesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateConsumableTypeDto) {
    return this.consumableTypesService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.consumableTypesService.delete(id);
  }
}
