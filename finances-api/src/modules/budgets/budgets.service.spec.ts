import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { BudgetsService } from './budgets.service';
import { SUPABASE_CLIENT } from '../../config/supabase.module';
import { CreateBudgetDto } from './dto';

describe('BudgetsService', () => {
  let service: BudgetsService;
  let mockSupabase: Record<string, jest.Mock>;

  const mockUserId = 'user-123';
  const mockBudget = {
    id: 'budget-123',
    user_id: mockUserId,
    category_id: 'cat-123',
    amount: 1000,
    month: 1,
    year: 2024,
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
      is: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BudgetsService,
        {
          provide: SUPABASE_CLIENT,
          useValue: mockSupabase,
        },
      ],
    }).compile();

    service = module.get<BudgetsService>(BudgetsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a budget', async () => {
      const dto: CreateBudgetDto = {
        amount: 1000,
        category_id: 'cat-123',
        month: 1,
        year: 2024,
      };

      mockSupabase.single
        .mockResolvedValueOnce({ data: null, error: null })
        .mockResolvedValueOnce({ data: mockBudget, error: null });

      const result = await service.create(mockUserId, dto);

      expect(mockSupabase.from).toHaveBeenCalledWith('budgets');
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        user_id: mockUserId,
        category_id: dto.category_id,
        amount: dto.amount,
        month: dto.month,
        year: dto.year,
      });
      expect(result).toEqual(mockBudget);
    });

    it('should create a general budget without category', async () => {
      const dto: CreateBudgetDto = {
        amount: 5000,
        month: 1,
        year: 2024,
      };

      mockSupabase.single
        .mockResolvedValueOnce({ data: null, error: null })
        .mockResolvedValueOnce({
          data: { ...mockBudget, category_id: null },
          error: null,
        });

      await service.create(mockUserId, dto);

      expect(mockSupabase.insert).toHaveBeenCalledWith({
        user_id: mockUserId,
        category_id: null,
        amount: dto.amount,
        month: dto.month,
        year: dto.year,
      });
    });

    it('should throw ConflictException when budget already exists', async () => {
      const dto: CreateBudgetDto = {
        amount: 1000,
        category_id: 'cat-123',
        month: 1,
        year: 2024,
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: mockBudget,
        error: null,
      });

      await expect(service.create(mockUserId, dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw error when insert fails', async () => {
      const dto: CreateBudgetDto = {
        amount: 1000,
        month: 1,
        year: 2024,
      };

      const error = new Error('Database error');
      mockSupabase.single
        .mockResolvedValueOnce({ data: null, error: null })
        .mockResolvedValueOnce({ data: null, error });

      await expect(service.create(mockUserId, dto)).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    it('should return budgets with spent amounts', async () => {
      const budgets = [
        {
          ...mockBudget,
          categories: { name: 'Food', color: '#ef4444', icon: 'utensils' },
        },
      ];

      mockSupabase.order.mockResolvedValueOnce({ data: budgets, error: null });

      // Create a thenable mock that supports further chaining
      const thenableMock = {
        eq: jest.fn().mockResolvedValue({
          data: [{ amount: 300 }],
          error: null,
        }),
        then: function (resolve: (value: { data: { amount: number }[]; error: null }) => unknown) {
          return resolve({ data: [{ amount: 300 }], error: null });
        },
      };
      mockSupabase.lte.mockReturnValue(thenableMock);

      const result = await service.findAll(mockUserId, 1, 2024);

      expect(result).toHaveLength(1);
      expect(result[0].spent).toBe(300);
      expect(result[0].remaining).toBe(700);
      expect(result[0].percentage).toBe(30);
    });

    it('should handle empty budgets', async () => {
      mockSupabase.order.mockResolvedValue({ data: [], error: null });

      const result = await service.findAll(mockUserId, 1, 2024);

      expect(result).toEqual([]);
    });

    it('should throw error when query fails', async () => {
      const error = new Error('Database error');
      mockSupabase.order.mockResolvedValue({ data: null, error });

      await expect(service.findAll(mockUserId, 1, 2024)).rejects.toThrow(error);
    });
  });

  describe('findOne', () => {
    it('should return a single budget', async () => {
      mockSupabase.single.mockResolvedValue({ data: mockBudget, error: null });

      const result = await service.findOne(mockUserId, 'budget-123');

      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'budget-123');
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(result).toEqual(mockBudget);
    });

    it('should throw NotFoundException when budget not found', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null });

      await expect(service.findOne(mockUserId, 'invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a budget', async () => {
      const updatedBudget = { ...mockBudget, amount: 1500 };

      mockSupabase.single
        .mockResolvedValueOnce({ data: mockBudget, error: null })
        .mockResolvedValueOnce({ data: updatedBudget, error: null });

      const result = await service.update(mockUserId, 'budget-123', {
        amount: 1500,
      });

      expect(mockSupabase.update).toHaveBeenCalledWith({ amount: 1500 });
      expect(result).toEqual(updatedBudget);
    });

    it('should throw NotFoundException when budget not found', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null });

      await expect(
        service.update(mockUserId, 'invalid-id', { amount: 1500 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a budget', async () => {
      // findOne calls .eq twice before .single
      mockSupabase.eq
        .mockReturnValueOnce(mockSupabase) // first eq('id')
        .mockReturnValueOnce(mockSupabase) // second eq('user_id')
        .mockReturnValueOnce(mockSupabase) // third eq('id') in delete
        .mockResolvedValueOnce({ error: null }); // fourth eq('user_id') in delete
      mockSupabase.single.mockResolvedValueOnce({
        data: mockBudget,
        error: null,
      });

      await service.remove(mockUserId, 'budget-123');

      expect(mockSupabase.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException when budget not found', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null });

      await expect(service.remove(mockUserId, 'invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getOverview', () => {
    it('should return budget overview', async () => {
      const budgets = [
        {
          ...mockBudget,
          amount: 1000,
          categories: { name: 'A', color: '#000', icon: 'a' },
        },
        {
          ...mockBudget,
          id: 'budget-2',
          amount: 500,
          categories: { name: 'B', color: '#fff', icon: 'b' },
        },
      ];

      mockSupabase.order.mockResolvedValueOnce({ data: budgets, error: null });

      // Create thenable mocks for each getSpentAmount call
      const thenableMock1 = {
        eq: jest
          .fn()
          .mockResolvedValue({ data: [{ amount: 300 }], error: null }),
        then: function (resolve: (value: { data: { amount: number }[]; error: null }) => unknown) {
          return resolve({ data: [{ amount: 300 }], error: null });
        },
      };
      const thenableMock2 = {
        eq: jest
          .fn()
          .mockResolvedValue({ data: [{ amount: 200 }], error: null }),
        then: function (resolve: (value: { data: { amount: number }[]; error: null }) => unknown) {
          return resolve({ data: [{ amount: 200 }], error: null });
        },
      };
      mockSupabase.lte
        .mockReturnValueOnce(thenableMock1)
        .mockReturnValueOnce(thenableMock2);

      const result = await service.getOverview(mockUserId, 1, 2024);

      expect(result.total_budget).toBe(1500);
      expect(result.total_spent).toBe(500);
      expect(result.total_remaining).toBe(1000);
      expect(result.percentage).toBeCloseTo(33.33, 1);
      expect(result.budgets).toHaveLength(2);
    });

    it('should handle zero budget', async () => {
      mockSupabase.order.mockResolvedValue({ data: [], error: null });

      const result = await service.getOverview(mockUserId, 1, 2024);

      expect(result.total_budget).toBe(0);
      expect(result.percentage).toBe(0);
    });
  });

  describe('getAlerts', () => {
    it('should return budgets at or above 80% usage', async () => {
      const budgets = [
        {
          ...mockBudget,
          amount: 100,
          categories: { name: 'A', color: '#000', icon: 'a' },
        },
        {
          ...mockBudget,
          id: 'budget-2',
          amount: 1000,
          categories: { name: 'B', color: '#fff', icon: 'b' },
        },
      ];

      mockSupabase.order.mockResolvedValueOnce({ data: budgets, error: null });

      // Create thenable mocks for each getSpentAmount call
      const thenableMock1 = {
        eq: jest
          .fn()
          .mockResolvedValue({ data: [{ amount: 90 }], error: null }),
        then: function (resolve: (value: { data: { amount: number }[]; error: null }) => unknown) {
          return resolve({ data: [{ amount: 90 }], error: null });
        },
      };
      const thenableMock2 = {
        eq: jest
          .fn()
          .mockResolvedValue({ data: [{ amount: 100 }], error: null }),
        then: function (resolve: (value: { data: { amount: number }[]; error: null }) => unknown) {
          return resolve({ data: [{ amount: 100 }], error: null });
        },
      };
      mockSupabase.lte
        .mockReturnValueOnce(thenableMock1)
        .mockReturnValueOnce(thenableMock2);

      const result = await service.getAlerts(mockUserId, 1, 2024);

      expect(result).toHaveLength(1);
      expect(result[0].percentage).toBe(90);
    });

    it('should return empty array when no alerts', async () => {
      const budgets = [
        {
          ...mockBudget,
          amount: 1000,
          categories: { name: 'A', color: '#000', icon: 'a' },
        },
      ];

      mockSupabase.order.mockResolvedValueOnce({ data: budgets, error: null });

      const thenableMock = {
        eq: jest
          .fn()
          .mockResolvedValue({ data: [{ amount: 100 }], error: null }),
        then: function (resolve: (value: { data: { amount: number }[]; error: null }) => unknown) {
          return resolve({ data: [{ amount: 100 }], error: null });
        },
      };
      mockSupabase.lte.mockReturnValueOnce(thenableMock);

      const result = await service.getAlerts(mockUserId, 1, 2024);

      expect(result).toHaveLength(0);
    });
  });
});
