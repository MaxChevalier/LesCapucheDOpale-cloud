import { Test, TestingModule } from '@nestjs/testing';
import { ConsumablesController } from '../controllers/consumables.controller';
import { ConsumablesService } from '../services/consumables.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { ExecutionContext } from '@nestjs/common';

describe('ConsumablesController', () => {
    let controller: ConsumablesController;
    let service: ConsumablesService;

    const mockConsumablesService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        purchase: jest.fn(),
    };

    const mockJwtAuthGuard = {
        canActivate: (context: ExecutionContext) => {
            const req = context.switchToHttp().getRequest();
            req.user = { id: 1, email: 'admin@mail.com', roleId: 1 };
            return true;
        },
    };

    const mockRolesGuard = {
        canActivate: () => true,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [ConsumablesController],
            providers: [{ provide: ConsumablesService, useValue: mockConsumablesService }],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue(mockJwtAuthGuard)
            .overrideGuard(RolesGuard)
            .useValue(mockRolesGuard)
            .compile();

        controller = module.get<ConsumablesController>(ConsumablesController);
        service = module.get<ConsumablesService>(ConsumablesService);
    });

    afterEach(() => jest.clearAllMocks());

    it('should call service.create()', async () => {
        const dto = { name: 'Potion', consumableTypeId: 1, quantity: 5, cost: 10 };
        mockConsumablesService.create.mockResolvedValue({ id: 1, ...dto });

        const result = await controller.create(dto as any);

        expect(service.create).toHaveBeenCalledWith(dto);
        expect(result).toEqual({ id: 1, ...dto });
    });

    it('should call service.findAll()', async () => {
        mockConsumablesService.findAll.mockResolvedValue([{ id: 1 }]);

        const result = await controller.findAll();

        expect(service.findAll).toHaveBeenCalled();
        expect(result).toEqual([{ id: 1 }]);
    });

    it('should call service.findOne()', async () => {
        mockConsumablesService.findOne.mockResolvedValue({ id: 1 });

        const result = await controller.findOne('1');

        expect(service.findOne).toHaveBeenCalledWith(1);
        expect(result).toEqual({ id: 1 });
    });

    it('should call service.update()', async () => {
        mockConsumablesService.update.mockResolvedValue({ id: 1, name: 'Pain' });

        const result = await controller.update('1', { name: 'Pain' } as any);

        expect(service.update).toHaveBeenCalledWith(1, { name: 'Pain' });
        expect(result).toEqual({ id: 1, name: 'Pain' });
    });

    it('should call service.remove()', async () => {
        mockConsumablesService.remove.mockResolvedValue({ id: 1 });

        const result = await controller.remove('1');

        expect(service.remove).toHaveBeenCalledWith(1);
        expect(result).toEqual({ id: 1 });
    });

    it('should call service.purchase()', async () => {
        mockConsumablesService.purchase.mockResolvedValue({ id: 1, purchasedQuantity: 3 });

        const result = await controller.purchase('1', { quantity: 3 } as any);

        expect(service.purchase).toHaveBeenCalledWith(1, 3);
        expect(result).toEqual({ id: 1, purchasedQuantity: 3 });
    });
});