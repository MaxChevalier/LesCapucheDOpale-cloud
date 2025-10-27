import { NotFoundException } from '@nestjs/common';
import { QuestsService } from '../services/quests.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestDto } from '../dto/create-quest.dto';
import { UpdateQuestDto } from '../dto/update-quest.dto';

describe('QuestsService', () => {
  let service: QuestsService;

  const mockPrisma: any = {
    status: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    adventurer: {
      findMany: jest.fn(),
    },
    equipmentStock: {
      findMany: jest.fn(),
    },
    quest: {
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new QuestsService(mockPrisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('should create a quest when status exists and relations exist', async () => {
      const dto: CreateQuestDto = {
        name: 'Q1',
        description: 'desc',
        finalDate: new Date(),
        reward: 100,
        estimatedDuration: 3,
        recommendedXP: 50,
        adventurerIds: [1, 2],
        equipmentStockIds: [10, 11],
      };
      mockPrisma.status.findFirst.mockResolvedValue({ id: 7 });
      mockPrisma.adventurer.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      mockPrisma.equipmentStock.findMany.mockResolvedValue([{ id: 10 }, { id: 11 }]);
      mockPrisma.quest.create.mockResolvedValue({ id: 99, ...dto });

      const res = await service.create(42, dto);

      expect(mockPrisma.status.findFirst).toHaveBeenCalledWith({ where: { name: 'waiting for validation' } });
      expect(mockPrisma.adventurer.findMany).toHaveBeenCalledWith({ where: { id: { in: dto.adventurerIds ?? [] } }, select: { id: true } });
      expect(mockPrisma.equipmentStock.findMany).toHaveBeenCalledWith({ where: { id: { in: dto.equipmentStockIds ?? [] } }, select: { id: true } });

      expect(mockPrisma.quest.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          description: dto.description,
          finalDate: dto.finalDate,
          reward: dto.reward,
          estimatedDuration: dto.estimatedDuration,
          recommendedXP: dto.recommendedXP,
          statusId: 7,
          UserId: 42,
          adventurers: { connect: (dto.adventurerIds ?? []).map(id => ({ id })) },
          questStockEquipments: { connect: (dto.equipmentStockIds ?? []).map(id => ({ id })) },
        },
        include: {
          status: true,
          adventurers: true,
          questStockEquipments: true,
          user: true,
        },
      });
      expect(res).toEqual(expect.objectContaining({ id: 99 }));
    });

    it('should create a quest and create pending status when not existing', async () => {
      const dto: CreateQuestDto = { name: 'Q2' } as any;
      mockPrisma.status.findFirst.mockResolvedValue(null);
      mockPrisma.status.create.mockResolvedValue({ id: 5 });
      mockPrisma.quest.create.mockResolvedValue({ id: 1 });

      const res = await service.create(1, dto);
      expect(mockPrisma.status.findFirst).toHaveBeenCalled();
      expect(mockPrisma.status.create).toHaveBeenCalledWith({ data: { name: 'waiting for validation' } });
      expect(mockPrisma.quest.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ statusId: 5 }) }));
      expect(res).toEqual(expect.objectContaining({ id: 1 }));
    });

    it('should throw NotFoundException if adventurer id missing', async () => {
      const dto: CreateQuestDto = { name: 'Q3', adventurerIds: [1, 2] } as any;
      mockPrisma.status.findFirst.mockResolvedValue({ id: 1 });
      mockPrisma.adventurer.findMany.mockResolvedValue([{ id: 1 }]); // missing id 2

      await expect(service.create(1, dto)).rejects.toThrow(NotFoundException);
      await expect(service.create(1, dto)).rejects.toThrow(/Adventurer id\(s\) not found/);
    });

    it('should throw NotFoundException if equipmentStock id missing', async () => {
      const dto: CreateQuestDto = { name: 'Q4', equipmentStockIds: [10, 11] } as any;
      mockPrisma.status.findFirst.mockResolvedValue({ id: 1 });
      mockPrisma.adventurer.findMany.mockResolvedValue([]); // not relevant
      mockPrisma.equipmentStock.findMany.mockResolvedValue([{ id: 10 }]); // missing 11

      await expect(service.create(1, dto)).rejects.toThrow(NotFoundException);
      await expect(service.create(1, dto)).rejects.toThrow(/EquipmentStock id\(s\) not found/);
    });
  });

  describe('update', () => {
    it('should update quest and set adventurers and questStockEquipments when arrays provided', async () => {
      const dto: UpdateQuestDto = {
        name: 'Updated',
        adventurerIds: [3, 4],
        equipmentStockIds: [20],
      } as any;

      mockPrisma.status.findFirst.mockResolvedValue({ id: 2 });
      mockPrisma.adventurer.findMany.mockResolvedValue([{ id: 3 }, { id: 4 }]);
      mockPrisma.equipmentStock.findMany.mockResolvedValue([{ id: 20 }]);
      mockPrisma.quest.update.mockResolvedValue({ id: 7 });

      const res = await service.update(7, dto);

      expect(mockPrisma.adventurer.findMany).toHaveBeenCalledWith({ where: { id: { in: dto.adventurerIds ?? [] } }, select: { id: true } });
      expect(mockPrisma.equipmentStock.findMany).toHaveBeenCalledWith({ where: { id: { in: dto.equipmentStockIds ?? [] } }, select: { id: true } });

      expect(mockPrisma.quest.update).toHaveBeenCalledWith({
        where: { id: 7 },
        data: expect.objectContaining({
          statusId: 2,
          name: 'Updated',
          adventurers: { set: (dto.adventurerIds ?? []).map(id => ({ id })) },
          questStockEquipments: { set: (dto.equipmentStockIds ?? []).map(id => ({ id })) },
        }),
        include: {
          status: true,
          adventurers: true,
          questStockEquipments: true,
          user: true,
        },
      });

      expect(res).toEqual({ id: 7 });
    });

    it('should throw NotFoundException when prisma throws P2025 on update', async () => {
      const dto: UpdateQuestDto = { name: 'x' } as any;
      const prismaErr: any = { code: 'P2025' };
      mockPrisma.status.findFirst.mockResolvedValue({ id: 2 });
      mockPrisma.quest.update.mockRejectedValue(prismaErr);

      await expect(service.update(999, dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if adventurer in update missing', async () => {
      const dto: UpdateQuestDto = { adventurerIds: [8, 9] } as any;
      mockPrisma.status.findFirst.mockResolvedValue({ id: 2 });
      mockPrisma.adventurer.findMany.mockResolvedValue([{ id: 8 }]); // missing 9

      await expect(service.update(1, dto)).rejects.toThrow(NotFoundException);
      await expect(service.update(1, dto)).rejects.toThrow(/Adventurer id\(s\) not found/);
    });

    it('should throw NotFoundException if equipmentStock in update missing', async () => {
      const dto: UpdateQuestDto = { equipmentStockIds: [100] } as any;
      mockPrisma.status.findFirst.mockResolvedValue({ id: 2 });
      mockPrisma.equipmentStock.findMany.mockResolvedValue([]); // missing 100

      await expect(service.update(1, dto)).rejects.toThrow(NotFoundException);
      await expect(service.update(1, dto)).rejects.toThrow(/EquipmentStock id\(s\) not found/);
    });
  });
});
