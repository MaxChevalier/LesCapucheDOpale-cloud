import { NotFoundException } from '@nestjs/common';
import { StatusesService } from '../services/statuses.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStatusDto } from '../dto/create-status.dto';
import { UpdateStatusDto } from '../dto/update-status.dto';

describe('StatusesService', () => {
  let service: StatusesService;

  const mockPrisma: any = {
    status: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new StatusesService(mockPrisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('should create a status', async () => {
      const dto: CreateStatusDto = { name: 'in progress' };
      mockPrisma.status.create.mockResolvedValue({ id: 1, name: dto.name });

      const res = await service.create(dto);
      expect(mockPrisma.status.create).toHaveBeenCalledWith({ data: { name: dto.name } });
      expect(res).toEqual({ id: 1, name: dto.name });
    });
  });

  describe('findAll', () => {
    it('should return statuses ordered by id asc', async () => {
      const rows = [{ id: 1, name: 'a' }, { id: 2, name: 'b' }];
      mockPrisma.status.findMany.mockResolvedValue(rows);

      const res = await service.findAll();
      expect(mockPrisma.status.findMany).toHaveBeenCalledWith({ orderBy: { id: 'asc' } });
      expect(res).toEqual(rows);
    });
  });

  describe('update', () => {
    it('should update and return the status', async () => {
      const dto: UpdateStatusDto = { name: 'done' };
      mockPrisma.status.update.mockResolvedValue({ id: 2, name: 'done' });

      const res = await service.update(2, dto);
      expect(mockPrisma.status.update).toHaveBeenCalledWith({ where: { id: 2 }, data: dto });
      expect(res).toEqual({ id: 2, name: 'done' });
    });

    it('should throw NotFoundException when prisma throws P2025', async () => {
      const dto: UpdateStatusDto = { name: 'x' };
      const prismaErr: any = { code: 'P2025' };
      mockPrisma.status.update.mockRejectedValue(prismaErr);

      await expect(service.update(999, dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete and return result', async () => {
      mockPrisma.status.delete.mockResolvedValue({ id: 3 });
      const res = await service.delete(3);
      expect(mockPrisma.status.delete).toHaveBeenCalledWith({ where: { id: 3 } });
      expect(res).toEqual({ id: 3 });
    });

    it('should throw NotFoundException when prisma throws P2025', async () => {
      const prismaErr: any = { code: 'P2025' };
      mockPrisma.status.delete.mockRejectedValue(prismaErr);
      await expect(service.delete(999)).rejects.toThrow(NotFoundException);
    });
  });
});
