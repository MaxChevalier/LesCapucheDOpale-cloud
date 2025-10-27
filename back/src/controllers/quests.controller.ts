import { Body, Controller, Param, ParseIntPipe, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { QuestsService } from '../services/quests.service';
import { CreateQuestDto } from '../dto/create-quest.dto';
import { UpdateQuestDto } from '../dto/update-quest.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../guards/roles.decorator';

@Controller('quests')
export class QuestsController {
  constructor(private readonly questsService: QuestsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  create(@Req() req, @Body() dto: CreateQuestDto) {
  const userId = req?.user?.sub;
  return this.questsService.create(userId, dto);
}

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(1, 2)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateQuestDto) {
    return this.questsService.update(id, dto);
  }
}