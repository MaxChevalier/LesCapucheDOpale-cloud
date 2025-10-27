import { NotFoundException } from '@nestjs/common';
import { EquipmentService } from '../services/equipment.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEquipmentDto } from '../dto/create-equipment.dto';
import { UpdateEquipmentDto } from '../dto/update-equipment.dto';

describe('EquipmentService', () => {
  let service: EquipmentService;
  const mockPrisma: Partial<Record<string, any>> = {
    equipment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    equipmentType: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new EquipmentService(mockPrisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('should create equipment when equipmentType exists', async () => {
      const dto: CreateEquipmentDto = {
        name: 'Sword',
        cost: 100,
        maxDurability: 50,
        equipmentTypeId: 1,
      };
      (mockPrisma.equipmentType!.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      (mockPrisma.equipment!.create as jest.Mock).mockResolvedValue({
        id: 1,
        ...dto,
        currentDurability: dto.maxDurability,
      });

      const res = await service.create(dto);
      expect(mockPrisma.equipmentType!.findUnique).toHaveBeenCalledWith({ where: { id: dto.equipmentTypeId } });
      expect(mockPrisma.equipment!.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          cost: dto.cost,
          maxDurability: dto.maxDurability,
          currentDurability: dto.maxDurability,
          equipmentTypeId: dto.equipmentTypeId,
        },
        include: expect.anything(),
      });
      expect(res).toEqual(expect.objectContaining({ id: 1, name: 'Sword' }));
    });

    it('should throw NotFoundException when equipmentType does not exist', async () => {
      const dto: CreateEquipmentDto = {
        name: 'Axe',
        cost: 80,
        maxDurability: 40,
        equipmentTypeId: 999,
      };
      (mockPrisma.equipmentType!.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.create(dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return all equipments', async () => {
      const rows = [{ id: 1 }, { id: 2 }];
      (mockPrisma.equipment!.findMany as jest.Mock).mockResolvedValue(rows);

      const res = await service.findAll();
      expect(mockPrisma.equipment!.findMany).toHaveBeenCalledWith({ include: expect.anything() });
      expect(res).toEqual(rows);
    });
  });

  describe('findOne', () => {
    it('should return the equipment if found', async () => {
      (mockPrisma.equipment!.findUnique as jest.Mock).mockResolvedValue({ id: 1 });
      const res = await service.findOne(1);
      expect(mockPrisma.equipment!.findUnique).toHaveBeenCalledWith({ where: { id: 1 }, include: expect.anything() });
      expect(res).toEqual({ id: 1 });
    });

    it('should throw NotFoundException if not found', async () => {
      (mockPrisma.equipment!.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update and return updated row when valid', async () => {
      const dto: UpdateEquipmentDto = { name: 'Updated', cost: 120 };
      (mockPrisma.equipment!.update as jest.Mock).mockResolvedValue({ id: 1, ...dto });

      const res = await service.update(1, dto);
      expect(mockPrisma.equipment!.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: dto,
        include: expect.anything(),
      });
      expect(res).toEqual({ id: 1, ...dto });
    });

    it('should verify equipmentType if provided in dto', async () => {
      const dto: UpdateEquipmentDto = { equipmentTypeId: 2 };
      (mockPrisma.equipmentType!.findUnique as jest.Mock).mockResolvedValue({ id: 2 });
      (mockPrisma.equipment!.update as jest.Mock).mockResolvedValue({ id: 1, ...dto });

      const res = await service.update(1, dto);
      expect(mockPrisma.equipmentType!.findUnique).toHaveBeenCalledWith({ where: { id: 2 } });
      expect(res).toEqual(expect.objectContaining({ id: 1 }));
    });

    it('should throw NotFoundException when prisma throws P2025 on update', async () => {
      const dto: UpdateEquipmentDto = { name: 'x' };
      const prismaErr: any = { code: 'P2025' };
      (mockPrisma.equipment!.update as jest.Mock).mockRejectedValue(prismaErr);

      await expect(service.update(999, dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete and return result', async () => {
      (mockPrisma.equipment!.delete as jest.Mock).mockResolvedValue({ id: 1 });
      const res = await service.delete(1);
      expect(mockPrisma.equipment!.delete).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(res).toEqual({ id: 1 });
    });

    it('should throw NotFoundException when prisma throws P2025 on delete', async () => {
      const prismaErr: any = { code: 'P2025' };
      (mockPrisma.equipment!.delete as jest.Mock).mockRejectedValue(prismaErr);
      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});
