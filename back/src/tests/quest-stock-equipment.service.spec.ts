import { NotFoundException } from '@nestjs/common';
import { QuestStockEquipmentService } from '../services/quest-stock-equipment.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestStockEquipmentDto } from '../dto/create-quest-stock-equipment.dto';

describe('QuestStockEquipmentService', () => {
  let service: QuestStockEquipmentService;

  const mockPrisma: any = {
    questStockEquipment: {
      create: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    quest: {
      findUnique: jest.fn(),
    },
    equipmentStock: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new QuestStockEquipmentService(mockPrisma as unknown as PrismaService);
  });

  describe('attach', () => {
    it('should attach when quest and equipmentStock exist', async () => {
      const dto: CreateQuestStockEquipmentDto = { questId: 1, equipmentStockId: 2 };
      mockPrisma.quest.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.equipmentStock.findUnique.mockResolvedValue({ id: 2 });
      mockPrisma.questStockEquipment.create.mockResolvedValue({
        id: 10,
        questId: 1,
        equipmentStockId: 2,
        quest: { id: 1 },
        equipmentStock: { id: 2 },
      });

      const res = await service.attach(dto);

      expect(mockPrisma.quest.findUnique).toHaveBeenCalledWith({ where: { id: dto.questId } });
      expect(mockPrisma.equipmentStock.findUnique).toHaveBeenCalledWith({ where: { id: dto.equipmentStockId } });
      expect(mockPrisma.questStockEquipment.create).toHaveBeenCalledWith({
        data: { questId: dto.questId, equipmentStockId: dto.equipmentStockId },
        include: { quest: true, equipmentStock: true },
      });
      expect(res).toEqual(expect.objectContaining({ id: 10, questId: 1 }));
    });

    it('should throw NotFoundException when quest not found', async () => {
      const dto: CreateQuestStockEquipmentDto = { questId: 999, equipmentStockId: 2 };
      mockPrisma.quest.findUnique.mockResolvedValue(null);
      await expect(service.attach(dto)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.quest.findUnique).toHaveBeenCalledWith({ where: { id: dto.questId } });
    });

    it('should throw NotFoundException when equipmentStock not found', async () => {
      const dto: CreateQuestStockEquipmentDto = { questId: 1, equipmentStockId: 999 };
      mockPrisma.quest.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.equipmentStock.findUnique.mockResolvedValue(null);
      await expect(service.attach(dto)).rejects.toThrow(NotFoundException);
      expect(mockPrisma.equipmentStock.findUnique).toHaveBeenCalledWith({ where: { id: dto.equipmentStockId } });
    });
  });

  describe('findAll', () => {
    it('should list all links when no questId provided', async () => {
      const rows = [{ id: 1 }, { id: 2 }];
      mockPrisma.questStockEquipment.findMany.mockResolvedValue(rows);

      const res = await service.findAll();
      expect(mockPrisma.questStockEquipment.findMany).toHaveBeenCalledWith({
        where: undefined,
        include: { quest: true, equipmentStock: true },
      });
      expect(res).toEqual(rows);
    });

    it('should filter by questId when provided', async () => {
      const rows = [{ id: 5, questId: 2 }];
      mockPrisma.questStockEquipment.findMany.mockResolvedValue(rows);

      const res = await service.findAll(2);
      expect(mockPrisma.questStockEquipment.findMany).toHaveBeenCalledWith({
        where: { questId: 2 },
        include: { quest: true, equipmentStock: true },
      });
      expect(res).toEqual(rows);
    });
  });

  describe('delete', () => {
    it('should delete link when exists', async () => {
      mockPrisma.questStockEquipment.delete.mockResolvedValue({ id: 1 });
      const res = await service.delete(1);
      expect(mockPrisma.questStockEquipment.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(res).toEqual({ id: 1 });
    });

    it('should throw NotFoundException when prisma throws P2025', async () => {
      const prismaErr: any = { code: 'P2025' };
      mockPrisma.questStockEquipment.delete.mockRejectedValue(prismaErr);
      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});
