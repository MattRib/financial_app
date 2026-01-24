import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { SUPABASE_CLIENT } from '../../config/supabase.module';
import { CreateGoalDto } from './dto';

describe('GoalsService', () => {
  let service: GoalsService;
  let mockSupabase: any;

  const mockUserId = 'user-123';
  const mockGoal = {
    id: 'goal-123',
    user_id: mockUserId,
    name: 'Comprar carro',
    target_amount: 20000,
    current_amount: 5000,
    target_date: '2026-01-01',
    status: 'active',
    category: 'veículos',
    notes: 'Meta de longo prazo',
    created_at: new Date(),
  };

  beforeEach(async () => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoalsService,
        {
          provide: SUPABASE_CLIENT,
          useValue: mockSupabase,
        },
      ],
    }).compile();

    service = module.get<GoalsService>(GoalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
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
        notes: 'Meta de longo prazo',
      };

      mockSupabase.single.mockResolvedValue({ data: mockGoal, error: null });

      const result = await service.create(mockUserId, dto);

      expect(mockSupabase.from).toHaveBeenCalledWith('goals');
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        user_id: mockUserId,
        name: dto.name,
        target_amount: dto.target_amount,
        current_amount: dto.current_amount,
        target_date: dto.target_date,
        status: dto.status,
        category: dto.category,
        notes: dto.notes,
      });
      expect(result).toEqual(mockGoal);
    });

    it('should create goal with defaults', async () => {
      const dto: CreateGoalDto = {
        name: 'Poupança',
        target_amount: 1000,
        target_date: '2025-01-01',
      };
      mockSupabase.single.mockResolvedValue({ data: mockGoal, error: null });
      await service.create(mockUserId, dto);
      expect(mockSupabase.insert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: mockUserId,
          name: dto.name,
          target_amount: dto.target_amount,
          current_amount: 0,
          target_date: dto.target_date,
          status: 'active',
        }),
      );
    });

    it('should throw when creation fails', async () => {
      const dto: CreateGoalDto = {
        name: 'Test',
        target_amount: 100,
        target_date: '2024-12-31',
      };
      const error = new Error('Database error');
      mockSupabase.single.mockResolvedValue({ data: null, error });
      await expect(service.create(mockUserId, dto)).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    it('should return all goals for user', async () => {
      const goals = [mockGoal];
      mockSupabase.order.mockResolvedValue({ data: goals, error: null });
      const result = await service.findAll(mockUserId);
      expect(mockSupabase.from).toHaveBeenCalledWith('goals');
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(result).toEqual(goals);
    });

    it('should filter by status', async () => {
      mockSupabase.order.mockResolvedValue({ data: [mockGoal], error: null });
      await service.findAll(mockUserId, { status: 'active' });
      expect(mockSupabase.eq).toHaveBeenCalledWith('status', 'active');
    });

    it('should filter by target date range', async () => {
      mockSupabase.order.mockResolvedValue({ data: [mockGoal], error: null });
      await service.findAll(mockUserId, {
        target_date_start: '2024-01-01',
        target_date_end: '2024-12-31',
      });
      expect(mockSupabase.gte).toHaveBeenCalledWith(
        'target_date',
        '2024-01-01',
      );
      expect(mockSupabase.lte).toHaveBeenCalledWith(
        'target_date',
        '2024-12-31',
      );
    });
  });

  describe('findOne', () => {
    it('should return one goal', async () => {
      mockSupabase.single.mockResolvedValue({ data: mockGoal, error: null });
      const result = await service.findOne(mockUserId, 'goal-123');
      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'goal-123');
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(result).toEqual(mockGoal);
    });

    it('should throw NotFoundException when not found', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null });
      await expect(service.findOne(mockUserId, 'invalid')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw on error', async () => {
      const error = new Error('Database error');
      mockSupabase.single.mockResolvedValue({ data: null, error });
      await expect(service.findOne(mockUserId, 'goal-123')).rejects.toThrow(
        error,
      );
    });
  });

  describe('update', () => {
    it('should update goal', async () => {
      mockSupabase.eq
        .mockReturnValueOnce(mockSupabase)
        .mockReturnValueOnce(mockSupabase);
      mockSupabase.single
        .mockResolvedValueOnce({ data: mockGoal, error: null })
        .mockResolvedValueOnce({
          data: { ...mockGoal, current_amount: 6000 },
          error: null,
        });
      const dto = { current_amount: 6000 };
      const result = await service.update(mockUserId, 'goal-123', dto);
      expect(mockSupabase.update).toHaveBeenCalledWith(dto);
      expect(result.current_amount).toBe(6000);
    });

    it('should throw NotFoundException when not found', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null });
      await expect(service.update(mockUserId, 'invalid', {})).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete goal', async () => {
      mockSupabase.eq
        .mockReturnValueOnce(mockSupabase)
        .mockReturnValueOnce(mockSupabase)
        .mockReturnValueOnce(mockSupabase)
        .mockReturnValueOnce(mockSupabase);
      mockSupabase.single.mockResolvedValue({ data: mockGoal, error: null });
      await service.remove(mockUserId, 'goal-123');
      expect(mockSupabase.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException when not found', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null });
      await expect(service.remove(mockUserId, 'invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getSummary', () => {
    it('should return goal summary', async () => {
      const goals = [
        { status: 'active', target_amount: 20000, current_amount: 5000 },
        { status: 'active', target_amount: 10000, current_amount: 2000 },
        { status: 'completed', target_amount: 5000, current_amount: 5000 },
      ];
      const queryThenable = {
        eq: jest.fn().mockReturnThis(),
        then: (resolve: any) => resolve({ data: goals, error: null }),
      };
      mockSupabase.select.mockReturnValue(queryThenable);
      mockSupabase.eq.mockReturnValue(queryThenable);
      const result = await service.getSummary(mockUserId);
      expect(result.total_target).toBe(35000);
      expect(result.current_amount).toBe(12000);
      expect(result.remaining).toBe(23000);
      expect(result.by_status.active.count).toBe(2);
      expect(result.by_status.completed.count).toBe(1);
    });
  });

  describe('markAsCompleted', () => {
    it('should mark goal as completed', async () => {
      mockSupabase.eq
        .mockReturnValueOnce(mockSupabase)
        .mockReturnValueOnce(mockSupabase);
      mockSupabase.single
        .mockResolvedValueOnce({ data: mockGoal, error: null })
        .mockResolvedValueOnce({
          data: { ...mockGoal, status: 'completed' },
          error: null,
        });
      const result = await service.markAsCompleted(mockUserId, 'goal-123');
      expect(mockSupabase.update).toHaveBeenCalledWith({
        status: 'completed',
        current_amount: mockGoal.target_amount,
      });
      expect(result.status).toBe('completed');
    });
  });
});
