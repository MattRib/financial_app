import { Test, TestingModule } from '@nestjs/testing';
import { InsightsController } from './insights.controller';
import { InsightsService } from './insights.service';
import { GenerateInsightDto, FilterInsightDto } from './dto';
import { SUPABASE_CLIENT } from '../../config/supabase.module';
import type { User } from '@supabase/supabase-js';
import { NotFoundException } from '@nestjs/common';

describe('InsightsController', () => {
  let controller: InsightsController;
  let service: InsightsService;

  const mockUser = { id: 'user-123' } as User;

  const mockInsightReport = {
    summary: {
      spending_pattern: 'Padrão de gastos moderado',
      financial_health: 'good' as const,
      balance_trend: 'positive' as const,
    },
    insights: [
      {
        title: 'Gasto alto em alimentação',
        description: 'Seus gastos com alimentação aumentaram 20%',
        category: 'Alimentação',
        impact: 'medium' as const,
        type: 'observation' as const,
      },
    ],
    recommendations: [
      {
        title: 'Reduza gastos com delivery',
        description: 'Considere cozinhar mais em casa',
        priority: 'high' as const,
        estimated_savings: 300,
      },
    ],
    top_categories: [
      {
        category_name: 'Alimentação',
        amount: 1500,
        percentage: 40,
      },
    ],
  };

  const mockInsight = {
    id: 'insight-123',
    user_id: 'user-123',
    month: 1,
    year: 2026,
    generated_at: new Date('2026-01-26'),
    total_income: 5000,
    total_expense: 3500,
    balance: 1500,
    transactions_count: 25,
    report_data: mockInsightReport,
    model_used: 'gpt-4o-mini',
    tokens_used: 1200,
    generation_time_ms: 3500,
    created_at: new Date('2026-01-26'),
    updated_at: new Date('2026-01-26'),
  };

  const mockInsightsService = {
    generate: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InsightsController],
      providers: [
        {
          provide: InsightsService,
          useValue: mockInsightsService,
        },
        {
          provide: SUPABASE_CLIENT,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<InsightsController>(InsightsController);
    service = module.get<InsightsService>(InsightsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('generate', () => {
    it('should generate a new insight successfully', async () => {
      const dto: GenerateInsightDto = {
        month: 1,
        year: 2026,
      };

      mockInsightsService.generate.mockResolvedValue(mockInsight);

      const result = await controller.generate(mockUser, dto);

      expect(result).toEqual(mockInsight);
      expect(service.generate).toHaveBeenCalledWith('user-123', dto);
      expect(service.generate).toHaveBeenCalledTimes(1);
    });

    it('should return cached insight if already exists', async () => {
      const dto: GenerateInsightDto = {
        month: 1,
        year: 2026,
      };

      mockInsightsService.generate.mockResolvedValue(mockInsight);

      const result = await controller.generate(mockUser, dto);

      expect(result).toEqual(mockInsight);
      expect(service.generate).toHaveBeenCalledWith('user-123', dto);
    });

    it('should throw NotFoundException when no transactions found', async () => {
      const dto: GenerateInsightDto = {
        month: 12,
        year: 2025,
      };

      mockInsightsService.generate.mockRejectedValue(
        new NotFoundException(
          'Nenhuma transação encontrada para este período. Adicione transações antes de gerar insights.',
        ),
      );

      await expect(controller.generate(mockUser, dto)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.generate).toHaveBeenCalledWith('user-123', dto);
    });
  });

  describe('findAll', () => {
    it('should return all insights for user', async () => {
      const insights = [mockInsight];
      mockInsightsService.findAll.mockResolvedValue(insights);

      const result = await controller.findAll(mockUser, {});

      expect(result).toEqual(insights);
      expect(service.findAll).toHaveBeenCalledWith('user-123', {});
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should return filtered insights by month and year', async () => {
      const filters: FilterInsightDto = {
        month: 1,
        year: 2026,
      };
      const insights = [mockInsight];
      mockInsightsService.findAll.mockResolvedValue(insights);

      const result = await controller.findAll(mockUser, filters);

      expect(result).toEqual(insights);
      expect(service.findAll).toHaveBeenCalledWith('user-123', filters);
    });

    it('should return empty array when no insights found', async () => {
      mockInsightsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll(mockUser, {});

      expect(result).toEqual([]);
      expect(service.findAll).toHaveBeenCalledWith('user-123', {});
    });
  });

  describe('findOne', () => {
    it('should return a specific insight', async () => {
      mockInsightsService.findOne.mockResolvedValue(mockInsight);

      const result = await controller.findOne(mockUser, 'insight-123');

      expect(result).toEqual(mockInsight);
      expect(service.findOne).toHaveBeenCalledWith('user-123', 'insight-123');
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when insight not found', async () => {
      mockInsightsService.findOne.mockRejectedValue(
        new NotFoundException('Insight não encontrado'),
      );

      await expect(
        controller.findOne(mockUser, 'non-existent-id'),
      ).rejects.toThrow(NotFoundException);
      expect(service.findOne).toHaveBeenCalledWith(
        'user-123',
        'non-existent-id',
      );
    });

    it('should not return insights from other users', async () => {
      mockInsightsService.findOne.mockRejectedValue(
        new NotFoundException('Insight não encontrado'),
      );

      await expect(
        controller.findOne(mockUser, 'other-user-insight'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete an insight successfully', async () => {
      mockInsightsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(mockUser, 'insight-123');

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith('user-123', 'insight-123');
      expect(service.remove).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundException when trying to delete non-existent insight', async () => {
      mockInsightsService.remove.mockRejectedValue(
        new NotFoundException('Insight não encontrado'),
      );

      await expect(
        controller.remove(mockUser, 'non-existent-id'),
      ).rejects.toThrow(NotFoundException);
      expect(service.remove).toHaveBeenCalledWith(
        'user-123',
        'non-existent-id',
      );
    });

    it('should not delete insights from other users', async () => {
      mockInsightsService.remove.mockRejectedValue(
        new NotFoundException('Insight não encontrado'),
      );

      await expect(
        controller.remove(mockUser, 'other-user-insight'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
