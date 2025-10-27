import { NotFoundException } from '@nestjs/common';
import { EquipmentStocksService } from '../services/equipment-stocks.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEquipmentStockDto } from '../dto/create-equipment-stock.dto';
import { UpdateEquipmentStockDto } from '../dto/update-equipment-stock.dto';

describe('EquipmentStocksService', () => {
  let service: EquipmentStocksService;
  const mockPrisma: any = {
    equipmentStock: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    equipment: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EquipmentStocksService(mockPrisma as PrismaService);
  });

  describe('create', () => {
    it('should create an equipment stock after verifying equipment exists', async () => {
      const dto: CreateEquipmentStockDto = { equipmentId: 1, durability: 100 };
      mockPrisma.equipment.findUnique.mockResolvedValue({ id: 1 });
      mockPrisma.equipmentStock.create.mockResolvedValue({
        id: 1,
        equipmentId: 1,
        durability: 100,
        equipment: { id: 1 },
      });

      const res = await service.create(dto);

      expect(mockPrisma.equipment.findUnique).toHaveBeenCalledWith({ where: { id: dto.equipmentId } });
      expect(mockPrisma.equipmentStock.create).toHaveBeenCalled();
      expect(res).toEqual(expect.objectContaining({ id: 1, equipmentId: 1 }));
    });

    it('should throw NotFoundException if equipment does not exist', async () => {
      const dto: CreateEquipmentStockDto = { equipmentId: 999, durability: 50 };
      mockPrisma.equipment.findUnique.mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return array from prisma', async () => {
      const rows = [{ id: 1 }, { id: 2 }];
      mockPrisma.equipmentStock.findMany.mockResolvedValue(rows);

      const res = await service.findAll();
      expect(mockPrisma.equipmentStock.findMany).toHaveBeenCalled();
      expect(res).toEqual(rows);
    });
  });

  describe('findOne', () => {
    it('should return the row if found', async () => {
      mockPrisma.equipmentStock.findUnique.mockResolvedValue({ id: 1 });
      const row = await service.findOne(1);
      expect(row).toEqual({ id: 1 });
      expect(mockPrisma.equipmentStock.findUnique).toHaveBeenCalledWith({ where: { id: 1 }, include: expect.anything() });
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.equipmentStock.findUnique.mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return the updated row', async () => {
      const dto: UpdateEquipmentStockDto = { durability: 80 };
      mockPrisma.equipmentStock.update.mockResolvedValue({ id: 1, durability: 80 });

      const res = await service.update(1, dto);
      expect(mockPrisma.equipmentStock.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: dto,
        include: expect.anything(),
      });
      expect(res).toEqual({ id: 1, durability: 80 });
    });

    it('should throw NotFoundException when prisma throws P2025', async () => {
      const dto: UpdateEquipmentStockDto = { durability: 10 };
      const prismaErr: any = { code: 'P2025' };
      mockPrisma.equipmentStock.update.mockRejectedValue(prismaErr);

      await expect(service.update(999, dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete and return result', async () => {
      mockPrisma.equipmentStock.delete.mockResolvedValue({ id: 1 });
      const res = await service.delete(1);
      expect(mockPrisma.equipmentStock.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(res).toEqual({ id: 1 });
    });

    it('should throw NotFoundException when prisma throws P2025', async () => {
      const prismaErr: any = { code: 'P2025' };
      mockPrisma.equipmentStock.delete.mockRejectedValue(prismaErr);
      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});
