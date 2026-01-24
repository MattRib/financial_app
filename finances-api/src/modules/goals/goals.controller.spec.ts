import { Test, TestingModule } from '@nestjs/testing';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';
import { CreateGoalDto, UpdateGoalDto } from './dto';
import { SUPABASE_CLIENT } from '../../config/supabase.module';

describe('GoalsController', () => {
  let controller: GoalsController;
  const mockUser = { id: 'user-123' } as any;
  const mockGoal = {
    id: 'goal-123',
    user_id: 'user-123',
    name: 'Comprar carro',
    target_amount: 20000,
    current_amount: 5000,
    target_date: '2026-01-01',
    status: 'active',
    category: 'veículos',
    notes: 'Meta de longo prazo',
    created_at: new Date(),
  };

  const mockGoalsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getSummary: jest.fn(),
    markAsCompleted: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GoalsController],
      providers: [
        {
          provide: GoalsService,
          useValue: mockGoalsService,
        },
        {
          provide: SUPABASE_CLIENT,
          useValue: {},
        },
      ],
    }).compile();
    controller = module.get<GoalsController>(GoalsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a goal', async () => {
      const dto: CreateGoalDto = {
        name: 'Comprar carro',
        target_amount: 20000,
        current_amount: 5000,
        target_date: '2026-01-01',
        status: 'active',
        category: 'veículos',
        notes: 'Meta',
      };
      mockGoalsService.create.mockResolvedValue(mockGoal);
      const result = await controller.create(mockUser, dto);
      expect(mockGoalsService.create).toHaveBeenCalledWith(mockUser.id, dto);
      expect(result).toEqual(mockGoal);
    });
  });

  describe('findAll', () => {
    it('should return all goals', async () => {
      const goals = [mockGoal];
      mockGoalsService.findAll.mockResolvedValue(goals);
      const result = await controller.findAll(mockUser, {});
      expect(mockGoalsService.findAll).toHaveBeenCalledWith(mockUser.id, {});
      expect(result).toEqual(goals);
    });

    it('should pass filters', async () => {
      const filters = { status: 'active' as const };
      mockGoalsService.findAll.mockResolvedValue([mockGoal]);
      await controller.findAll(mockUser, filters);
      expect(mockGoalsService.findAll).toHaveBeenCalledWith(
        mockUser.id,
        filters,
      );
    });
  });

  describe('getSummary', () => {
    it('should return summary', async () => {
      const summary = {
        total_target: 1000,
        current_amount: 500,
        remaining: 500,
        by_status: {
          active: { count: 1, total: 1000 },
          completed: { count: 0, total: 0 },
          cancelled: { count: 0, total: 0 },
        },
      };
      mockGoalsService.getSummary.mockResolvedValue(summary);
      const result = await controller.getSummary(mockUser);
      expect(mockGoalsService.getSummary).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(summary);
    });
  });

  describe('markAsCompleted', () => {
    it('should mark goal as completed', async () => {
      const completed = { ...mockGoal, status: 'completed' };
      mockGoalsService.markAsCompleted.mockResolvedValue(completed);
      const result = await controller.markAsCompleted(mockUser, 'goal-123');
      expect(mockGoalsService.markAsCompleted).toHaveBeenCalledWith(
        mockUser.id,
        'goal-123',
      );
      expect(result).toEqual(completed);
    });
  });

  describe('findOne', () => {
    it('should return one goal', async () => {
      mockGoalsService.findOne.mockResolvedValue(mockGoal);
      const result = await controller.findOne(mockUser, 'goal-123');
      expect(mockGoalsService.findOne).toHaveBeenCalledWith(
        mockUser.id,
        'goal-123',
      );
      expect(result).toEqual(mockGoal);
    });
  });

  describe('update', () => {
    it('should update goal', async () => {
      const dto: UpdateGoalDto = { current_amount: 6000 };
      const updated = { ...mockGoal, current_amount: 6000 };
      mockGoalsService.update.mockResolvedValue(updated);
      const result = await controller.update(mockUser, 'goal-123', dto);
      expect(mockGoalsService.update).toHaveBeenCalledWith(
        mockUser.id,
        'goal-123',
        dto,
      );
      expect(result).toEqual(updated);
    });
  });

  describe('remove', () => {
    it('should delete goal', async () => {
      mockGoalsService.remove.mockResolvedValue(undefined);
      await controller.remove(mockUser, 'goal-123');
      expect(mockGoalsService.remove).toHaveBeenCalledWith(
        mockUser.id,
        'goal-123',
      );
    });
  });
});
