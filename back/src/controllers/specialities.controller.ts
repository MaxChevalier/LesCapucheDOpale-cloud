import {Controller,Get,Post,Body,Patch,Param,Delete, UseGuards} from '@nestjs/common';
import { SpecialitiesService } from '../services/specialities.service';
import { CreateSpecialityDto } from '../dto/create-speciality.dto';
import { UpdateSpecialityDto } from '../dto/update-speciality.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';

@Controller('specialities')
export class SpecialitiesController {
  constructor(private readonly specialitiesService: SpecialitiesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  create(@Body() dto: CreateSpecialityDto) {
    return this.specialitiesService.create(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  findAll() {
    return this.specialitiesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  findOne(@Param('id') id: number) {
    return this.specialitiesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  update(@Param('id') id: number, @Body() dto: UpdateSpecialityDto) {
    return this.specialitiesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  remove(@Param('id') id: number) {
    return this.specialitiesService.delete(id);
  }
}
