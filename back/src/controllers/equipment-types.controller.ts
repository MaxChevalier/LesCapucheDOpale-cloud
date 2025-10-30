import {Controller,Get,Post,Body,Patch,Param,Delete,UseGuards,} from '@nestjs/common';
import { EquipmentTypesService } from '../services/equipment-types.service';
import { CreateEquipmentTypeDto } from '../dto/create-equipment-type.dto';
import { UpdateEquipmentTypeDto } from '../dto/update-equipment-type.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';

@Controller('equipment-types')
export class EquipmentTypesController {
  constructor(private readonly equipmentTypesService: EquipmentTypesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  create(@Body() dto: CreateEquipmentTypeDto) {
    return this.equipmentTypesService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  findAll() {
    return this.equipmentTypesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  findOne(@Param('id') id: number) {
    return this.equipmentTypesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  update(@Param('id') id: number, @Body() dto: UpdateEquipmentTypeDto) {
    return this.equipmentTypesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  delete(@Param('id') id: number) {
    return this.equipmentTypesService.delete(id);
  }
}
