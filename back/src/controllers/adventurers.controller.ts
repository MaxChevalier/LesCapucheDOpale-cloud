import {Body,Controller,Param,ParseIntPipe,Get,Patch,Post,UseGuards,} from '@nestjs/common';
import { AdventurersService } from '../services/adventurers.service';
import { CreateAdventurerDto } from '../dto/create-adventurer.dto';
import { UpdateAdventurerDto } from '../dto/update-adventurer.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';
@Controller('adventurers')
export class AdventurersController {
  constructor(private readonly adventurersService: AdventurersService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  findAll() {
    return this.adventurersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  findOne(@Param('id') id: number) {
    return this.adventurersService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  create(@Body() createAdventurerDto: CreateAdventurerDto) {
    return this.adventurersService.create(createAdventurerDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdventurerDto: UpdateAdventurerDto,
  ) {
    return this.adventurersService.update(id, updateAdventurerDto);
  }
}
