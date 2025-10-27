import { Test, TestingModule } from '@nestjs/testing';
import { QuestsController } from '../controllers/quests.controller';
import { QuestsService } from '../services/quests.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { CreateQuestDto } from '../dto/create-quest.dto';
import { UpdateQuestDto } from '../dto/update-quest.dto';

describe('QuestsController', () => {
  let controller: QuestsController;
  const mockService = {
    create: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestsController],
      providers: [{ provide: QuestsService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<QuestsController>(QuestsController);
  });

  it('should call service.create with userId from req and dto', () => {
    const dto: CreateQuestDto = { name: 'C1' } as any;
    const req = { user: { sub: 123 } } as any;
    mockService.create.mockReturnValue({ id: 1, ...dto });

    expect(controller.create(req, dto)).toEqual({ id: 1, ...dto });
    expect(mockService.create).toHaveBeenCalledWith(123, dto);
  });

  it('should call service.update with id and dto', () => {
    const dto: UpdateQuestDto = { name: 'Up' } as any;
    mockService.update.mockReturnValue({ id: 2, ...dto });

    expect(controller.update(2, dto)).toEqual({ id: 2, ...dto });
    expect(mockService.update).toHaveBeenCalledWith(2, dto);
  });
});
