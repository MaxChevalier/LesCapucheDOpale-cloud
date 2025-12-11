import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateQuestDto } from '../dto/create-quest.dto';
import { UpdateQuestDto } from '../dto/update-quest.dto';

export type FindQuestsOptions = {
  rewardMin?: number;
  rewardMax?: number;
  statusId?: number;
  statusName?: string;
  finalDateBefore?: string;
  finalDateAfter?: string;
  userId?: number;
  avgXpMin?: number;
  avgXpMax?: number;
  sortBy?: 'reward' | 'finalDate' | 'avgExperience' | 'createdAt';
  order?: 'asc' | 'desc';
};

@Injectable()
export class QuestsService {
  constructor(private prisma: PrismaService) {}

  // Status IDs (must match database values)
  private readonly STATUS_ID_WAITING = 1;
  private readonly STATUS_ID_VALIDATED = 2;
  private readonly STATUS_ID_STARTED = 3;
  private readonly STATUS_ID_REFUSED = 4;
  private readonly STATUS_ID_ABANDONED = 5;

  private async isStarted(questId: number): Promise<boolean> {
    const q = await this.prisma.quest.findUnique({
      where: { id: questId },
      select: { statusId: true },
    });
    if (!q) throw new NotFoundException('Quest not found');
    return q.statusId === this.STATUS_ID_STARTED;
  }

  async findAll(options: FindQuestsOptions = {}) {
    const {
      rewardMin,
      rewardMax,
      statusId,
      statusName,
      finalDateBefore,
      finalDateAfter,
      userId,
      avgXpMin,
      avgXpMax,
      sortBy,
      order,
    } = options;

    // Build Prisma where clause
    const where: Prisma.QuestWhereInput = {
      ...(rewardMin != null || rewardMax != null
        ? {
            reward: {
              ...(rewardMin != null ? { gte: rewardMin } : {}),
              ...(rewardMax != null ? { lte: rewardMax } : {}),
            },
          }
        : {}),
      ...(typeof statusId === 'number' ? { statusId } : {}),
      ...(statusName ? { status: { name: { contains: statusName } } } : {}),
      ...(finalDateBefore || finalDateAfter
        ? {
            finalDate: {
              ...(finalDateAfter ? { gte: new Date(finalDateAfter) } : {}),
              ...(finalDateBefore ? { lte: new Date(finalDateBefore) } : {}),
            },
          }
        : {}),
      ...(typeof userId === 'number' ? { UserId: userId } : {}),
    };

    // Determine orderBy (for DB-sortable fields)
    let orderBy: Prisma.QuestOrderByWithRelationInput | undefined;
    if (sortBy === 'reward') {
      orderBy = { reward: order ?? 'desc' };
    } else if (sortBy === 'finalDate') {
      orderBy = { finalDate: order ?? 'asc' };
    } else {
      orderBy = { id: 'desc' };
    }

    const quests = await this.prisma.quest.findMany({
      where,
      include: {
        status: true,
        adventurers: true,
        questStockEquipments: true,
        user: true,
      },
      orderBy,
    });

    if (avgXpMin == null && avgXpMax == null && sortBy !== 'avgExperience') {
      return quests;
    }

    let result = quests.map((quest) => {
      const adventurers = quest.adventurers ?? [];
      const avgExperience =
        adventurers.length > 0
          ? adventurers.reduce((sum, a) => sum + (a.experience ?? 0), 0) /
            adventurers.length
          : 0;
      return { ...quest, avgExperience };
    });

    // Filter by avgXpMin / avgXpMax
    if (avgXpMin != null) {
      result = result.filter((q) => q.avgExperience >= avgXpMin);
    }
    if (avgXpMax != null) {
      result = result.filter((q) => q.avgExperience <= avgXpMax);
    }

    // Sort by avgExperience if requested
    if (sortBy === 'avgExperience') {
      result.sort((a, b) =>
        order === 'asc'
          ? a.avgExperience - b.avgExperience
          : b.avgExperience - a.avgExperience,
      );
    }

    return result;
  }

  async findOne(id: number) {
    const quest = await this.prisma.quest.findUnique({
      where: { id },
      include: {
        status: true,
        adventurers: true,
        questStockEquipments: true,
        user: true,
      },
    });
    if (!quest) throw new NotFoundException('Quest not found');
    return quest;
  }

  async updateStatus(
    questId: number,
    opts: { statusId?: number; statusName?: string },
  ) {
    const { statusId, statusName } = opts || {};
    if (!statusId && !statusName) {
      throw new BadRequestException('Provide statusId or statusName');
    }

    let targetStatusId = statusId ?? null;

    if (!targetStatusId && statusName) {
      const status = await this.prisma.status.findFirst({
        where: { name: statusName },
      });
      if (!status)
        throw new NotFoundException(`Status not found: ${statusName}`);
      targetStatusId = status.id;
    }

    try {
      return await this.prisma.quest.update({
        where: { id: questId },
        data: { status: { connect: { id: targetStatusId! } } },
        include: {
          status: true,
          adventurers: true,
          questStockEquipments: true,
          user: true,
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('Quest not found');
      }
      throw e;
    }
  }

  async create(userId: number, dto: CreateQuestDto) {
    if (dto.adventurerIds?.length) {
      await this.findAdventurersExist(dto.adventurerIds);
    }

    if (dto.equipmentStockIds?.length) {
      await this.findEquipmentStocksExist(dto.equipmentStockIds);
    }

    return this.prisma.quest.create({
      data: {
        name: dto.name,
        description: dto.description,
        finalDate: dto.finalDate,
        reward: dto.reward,
        estimatedDuration: dto.estimatedDuration,
        recommendedXP: 0,
        statusId: this.STATUS_ID_WAITING,
        UserId: userId,
        adventurers: dto.adventurerIds?.length
          ? { connect: dto.adventurerIds.map((id) => ({ id })) }
          : undefined,
        questStockEquipments: dto.equipmentStockIds?.length
          ? {
              create: dto.equipmentStockIds.map((equipmentStockId) => ({
                equipmentStockId,
              })),
            }
          : undefined,
      },
      include: {
        adventurers: true,
        questStockEquipments: true,
        user: true,
      },
    });
  }

  async update(id: number, dto: UpdateQuestDto) {
    const isStarted = await this.isStarted(id);

    if (isStarted && (dto.adventurerIds || dto.equipmentStockIds)) {
      throw new BadRequestException(
        'Quest is started: cannot change adventurers or equipment selections',
      );
    }

    const pendingStatusId = isStarted ? undefined : this.STATUS_ID_WAITING;

    if (dto.adventurerIds?.length) {
      await this.findAdventurersExist(dto.adventurerIds);
    }

    if (dto.equipmentStockIds?.length) {
      await this.findEquipmentStocksExist(dto.equipmentStockIds);
    }

    const data: Prisma.QuestUpdateInput = {
      ...(pendingStatusId && { status: { connect: { id: pendingStatusId } } }),
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.finalDate !== undefined && { finalDate: dto.finalDate }),
      ...(dto.reward !== undefined && { reward: dto.reward }),
      ...(dto.estimatedDuration !== undefined && {
        estimatedDuration: dto.estimatedDuration,
      }),
      ...(dto.adventurerIds && {
        adventurers: { set: dto.adventurerIds.map((id) => ({ id })) },
      }),
      ...(dto.equipmentStockIds && {
        questStockEquipments: {
          set: dto.equipmentStockIds.map((id) => ({ id })),
        },
      }),
    };

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
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('Quest not found');
      }
      throw e;
    }
  }

  private async findEquipmentStocksExist(ids: number[]) {
    if (!ids?.length) return;
    const found = await this.prisma.equipmentStock.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
    const missing = ids.filter((x) => !found.some((f) => f.id === x));
    if (missing.length)
      throw new NotFoundException(
        `EquipmentStock id(s) not found: ${missing.join(', ')}`,
      );
  }

  private async findAdventurersExist(ids: number[]) {
    if (!ids?.length) return;
    const found = await this.prisma.adventurer.findMany({
      where: { id: { in: ids } },
      select: { id: true },
    });
    const missing = ids.filter((x) => !found.some((f) => f.id === x));
    if (missing.length)
      throw new NotFoundException(
        `Adventurer id(s) not found: ${missing.join(', ')}`,
      );
  }

  async attachAdventurers(questId: number, adventurerIds: number[]) {
    await this.findAdventurersExist(adventurerIds);
    try {
      return await this.prisma.quest.update({
        where: { id: questId },
        data: { adventurers: { connect: adventurerIds.map((id) => ({ id })) } },
        include: {
          status: true,
          adventurers: true,
          questStockEquipments: true,
          user: true,
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('Quest not found');
      }
      throw e;
    }
  }

  async detachAdventurers(questId: number, adventurerIds: number[]) {
    if (await this.isStarted(questId)) {
      throw new BadRequestException(
        'Quest is started: cannot detach adventurers',
      );
    }
    await this.findAdventurersExist(adventurerIds);
    return this.prisma.quest.update({
      where: { id: questId },
      data: {
        adventurers: { disconnect: adventurerIds.map((id) => ({ id })) },
      },
      include: {
        status: true,
        adventurers: true,
        questStockEquipments: true,
        user: true,
      },
    });
  }

  async setAdventurers(questId: number, adventurerIds: number[]) {
    if (await this.isStarted(questId)) {
      throw new BadRequestException(
        'Quest is started: cannot change adventurers',
      );
    }
    await this.findAdventurersExist(adventurerIds);
    return this.prisma.quest.update({
      where: { id: questId },
      data: { adventurers: { set: adventurerIds.map((id) => ({ id })) } },
      include: {
        status: true,
        adventurers: true,
        questStockEquipments: true,
        user: true,
      },
    });
  }

  async attachEquipmentStocks(questId: number, equipmentStockIds: number[]) {
    await this.findEquipmentStocksExist(equipmentStockIds);
    const existing = await this.prisma.questStockEquipment.findMany({
      where: { questId, equipmentStockId: { in: equipmentStockIds } },
      select: { equipmentStockId: true },
    });
    const toInsert = equipmentStockIds.filter(
      (id) => !existing.some((e) => e.equipmentStockId === id),
    );
    if (toInsert.length) {
      await this.prisma.questStockEquipment.createMany({
        data: toInsert.map((equipmentStockId) => ({
          questId,
          equipmentStockId,
        })),
      });
    }
    return this.findOne(questId);
  }

  async detachEquipmentStocks(questId: number, equipmentStockIds: number[]) {
    if (await this.isStarted(questId)) {
      throw new BadRequestException(
        'Quest is started: cannot detach equipment',
      );
    }
    await this.findEquipmentStocksExist(equipmentStockIds);
    await this.prisma.questStockEquipment.deleteMany({
      where: { questId, equipmentStockId: { in: equipmentStockIds } },
    });
    return this.findOne(questId);
  }

  async setEquipmentStocks(questId: number, equipmentStockIds: number[]) {
    if (await this.isStarted(questId)) {
      throw new BadRequestException(
        'Quest is started: cannot change equipment',
      );
    }
    await this.findEquipmentStocksExist(equipmentStockIds);
    const deletePromise = this.prisma.questStockEquipment.deleteMany({
      where: { questId },
    });
    const tx = equipmentStockIds.length
      ? [
          deletePromise,
          this.prisma.questStockEquipment.createMany({
            data: equipmentStockIds.map((equipmentStockId) => ({
              questId,
              equipmentStockId,
            })),
          }),
        ]
      : [deletePromise];
    await this.prisma.$transaction(tx);
    return this.findOne(questId);
  }

  async validateQuest(questId: number, xp: number) {
    try {
      return await this.prisma.quest.update({
        where: { id: questId },
        data: {
          status: { connect: { id: this.STATUS_ID_VALIDATED } },
          recommendedXP: xp,
        },
        include: {
          status: true,
          adventurers: true,
          questStockEquipments: true,
          user: true,
        },
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2025'
      ) {
        throw new NotFoundException('Quest not found');
      }
      throw e;
    }
  }

  async invalidateQuest(questId: number) {
    if (await this.isStarted(questId)) {
      throw new BadRequestException('Quest is started: cannot invalidate');
    }

    await this.prisma.$transaction([
      this.prisma.quest.update({
        where: { id: questId },
        data: {
          status: { connect: { id: this.STATUS_ID_WAITING } },
          recommendedXP: 0,
          adventurers: { set: [] },
        },
      }),
      this.prisma.questStockEquipment.deleteMany({ where: { questId } }),
    ]);

    return this.findOne(questId);
  }

  async startQuest(questId: number) {
    const quest = await this.prisma.quest.findUnique({
      where: { id: questId },
      select: { statusId: true },
    });
    if (!quest) throw new NotFoundException('Quest not found');

    if (quest.statusId !== this.STATUS_ID_VALIDATED) {
      throw new BadRequestException(
        'Quest must be validated before it can be started',
      );
    }

    return this.prisma.quest.update({
      where: { id: questId },
      data: { status: { connect: { id: this.STATUS_ID_STARTED } } },
      include: {
        status: true,
        adventurers: true,
        questStockEquipments: true,
        user: true,
      },
    });
  }

  async refuseQuest(questId: number) {
    const quest = await this.prisma.quest.findUnique({
      where: { id: questId },
      select: { statusId: true },
    });
    if (!quest) throw new NotFoundException('Quest not found');

    if (
      quest.statusId === this.STATUS_ID_VALIDATED ||
      quest.statusId === this.STATUS_ID_STARTED
    ) {
      throw new BadRequestException(
        'Quest cannot be refused when accepted or started',
      );
    }

    return await this.prisma.quest.update({
      where: { id: questId },
      data: { status: { connect: { id: this.STATUS_ID_REFUSED } } },
      include: {
        status: true,
        adventurers: true,
        questStockEquipments: true,
        user: true,
      },
    });
  }

  async abandonQuest(questId: number) {
    const quest = await this.prisma.quest.findUnique({
      where: { id: questId },
      select: { statusId: true },
    });
    if (!quest) throw new NotFoundException('Quest not found');

    if (
      quest.statusId === this.STATUS_ID_VALIDATED ||
      quest.statusId === this.STATUS_ID_STARTED
    ) {
      throw new BadRequestException(
        'Quest cannot be abandoned when accepted or started',
      );
    }

    return this.prisma.quest.update({
      where: { id: questId },
      data: { status: { connect: { id: this.STATUS_ID_ABANDONED } } },
      include: {
        status: true,
        adventurers: true,
        questStockEquipments: true,
        user: true,
      },
    });
  }
}
