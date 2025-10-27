import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestDto } from '../dto/create-quest.dto';
import { UpdateQuestDto } from '../dto/update-quest.dto';

@Injectable()
export class QuestsService {
  constructor(private prisma: PrismaService) {}

  private async getPendingStatusId() {
    const name = 'waiting for validation';
    const found = await this.prisma.status.findFirst({ where: { name } });
    if (found) return found.id;
    const created = await this.prisma.status.create({ data: { name } });
    return created.id;
  }

  async create(userId: number, dto: CreateQuestDto) {
    const pendingStatusId = await this.getPendingStatusId();

    if (dto.adventurerIds?.length) {
      const found = await this.prisma.adventurer.findMany({
        where: { id: { in: dto.adventurerIds } },
        select: { id: true },
      });
      if (found.length !== dto.adventurerIds.length) {
        const foundSet = new Set(found.map(a => a.id));
        const missing = dto.adventurerIds.filter(id => !foundSet.has(id));
        throw new NotFoundException(`Adventurer id(s) not found: ${missing.join(', ')}`);
      }
    }

    if (dto.equipmentStockIds?.length) {
      const found = await this.prisma.equipmentStock.findMany({
        where: { id: { in: dto.equipmentStockIds } },
        select: { id: true },
      });
      if (found.length !== dto.equipmentStockIds.length) {
        const foundSet = new Set(found.map(e => e.id));
        const missing = dto.equipmentStockIds.filter(id => !foundSet.has(id));
        throw new NotFoundException(`EquipmentStock id(s) not found: ${missing.join(', ')}`);
      }
    }

    return this.prisma.quest.create({
      data: {
        name: dto.name,
        description: dto.description,
        finalDate: dto.finalDate,
        reward: dto.reward,
        estimatedDuration: dto.estimatedDuration,
        recommendedXP: dto.recommendedXP,
        statusId: pendingStatusId,
        UserId: userId,
        adventurers: dto.adventurerIds?.length
          ? { connect: dto.adventurerIds.map(id => ({ id })) }
          : undefined,
        questStockEquipments: dto.equipmentStockIds?.length
          ? { connect: dto.equipmentStockIds.map(id => ({ id })) }
          : undefined,
      },
      include: {
        status: true,
        adventurers: true,
        questStockEquipments: true,
        user: true,
      },
    });
  }

  async update(id: number, dto: UpdateQuestDto) {
    const pendingStatusId = await this.getPendingStatusId();

    if (Array.isArray(dto.adventurerIds) && dto.adventurerIds.length > 0) {
      const found = await this.prisma.adventurer.findMany({
        where: { id: { in: dto.adventurerIds } },
        select: { id: true },
      });
      if (found.length !== dto.adventurerIds.length) {
        const foundSet = new Set(found.map(a => a.id));
        const missing = dto.adventurerIds.filter(x => !foundSet.has(x));
        throw new NotFoundException(`Adventurer id(s) not found: ${missing.join(', ')}`);
      }
    }

    if (Array.isArray(dto.equipmentStockIds) && dto.equipmentStockIds.length > 0) {
      const found = await this.prisma.equipmentStock.findMany({
        where: { id: { in: dto.equipmentStockIds } },
        select: { id: true },
      });
      if (found.length !== dto.equipmentStockIds.length) {
        const foundSet = new Set(found.map(e => e.id));
        const missing = dto.equipmentStockIds.filter(x => !foundSet.has(x));
        throw new NotFoundException(`EquipmentStock id(s) not found: ${missing.join(', ')}`);
      }
    }

    const data: any = {
  statusId: pendingStatusId,
};

if (dto.name !== undefined) data.name = dto.name;
if (dto.description !== undefined) data.description = dto.description;
if (dto.finalDate !== undefined) data.finalDate = dto.finalDate;
if (dto.reward !== undefined) data.reward = dto.reward;
if (dto.estimatedDuration !== undefined) data.estimatedDuration = dto.estimatedDuration;
if (dto.recommendedXP !== undefined) data.recommendedXP = dto.recommendedXP;

if (Array.isArray(dto.adventurerIds)) {
  data.adventurers = {
    set: dto.adventurerIds.map(id => ({ id })),
  };
}

if (Array.isArray(dto.equipmentStockIds)) {
  data.questStockEquipments = {
    set: dto.equipmentStockIds.map(id => ({ id })),
  };
}


    try {
      return await this.prisma.quest.update({
        where: { id },
        data,
        include: {
          status: true,
          adventurers: true,
          questStockEquipments: true,
          user: true,
        },
      });
    } catch (e: any) {
      if (e.code === 'P2025') {
        throw new NotFoundException('Quest not found');
      }
      throw e;
    }
  }
}