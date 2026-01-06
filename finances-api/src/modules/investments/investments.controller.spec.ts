/* eslint-disable @typescript-eslint/no-explicit-any */
 
import { Test, TestingModule } from '@nestjs/testing';
import { InvestmentsController } from './investments.controller';
import { InvestmentsService } from './investments.service';
import { CreateInvestmentDto, UpdateInvestmentDto } from './dto';
import { SUPABASE_CLIENT } from '../../config/supabase.module';

describe('InvestmentsController', () => {
  let controller: InvestmentsController;

  const mockUser = { id: 'user-123' } as any;
  const mockInvestment = {
    id: 'inv-123',
    user_id: 'user-123',
    type: 'renda_fixa',
    name: 'Tesouro Direto',
    amount: 5000,
    date: '2024-01-15',
    notes: 'Investimento de longo prazo',
    created_at: new Date(),
  };

  const mockInvestmentsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getSummary: jest.fn(),
    getMonthlyEvolution: jest.fn(),
    getTotalByMonth: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InvestmentsController],
      providers: [
        {
          provide: InvestmentsService,
          useValue: mockInvestmentsService,
        },
        {
          provide: SUPABASE_CLIENT,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<InvestmentsController>(InvestmentsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an investment', async () => {
      const dto: CreateInvestmentDto = {
        type: 'renda_fixa',
        name: 'Tesouro Direto',
        amount: 5000,
        date: '2024-01-15',
        notes: 'Investimento de longo prazo',
      };

      mockInvestmentsService.create.mockResolvedValue(mockInvestment);

      const result = await controller.create(mockUser, dto);

      expect(mockInvestmentsService.create).toHaveBeenCalledWith(
        mockUser.id,
        dto,
      );
      expect(result).toEqual(mockInvestment);
    });
  });

  describe('findAll', () => {
    it('should return all investments', async () => {
      const investments = [mockInvestment];
      mockInvestmentsService.findAll.mockResolvedValue(investments);

      const result = await controller.findAll(mockUser, {});

      expect(mockInvestmentsService.findAll).toHaveBeenCalledWith(
        mockUser.id,
        {},
      );
      expect(result).toEqual(investments);
    });

    it('should pass filters to service', async () => {
      const filters = { type: 'renda_fixa' as const, start_date: '2024-01-01' };
      mockInvestmentsService.findAll.mockResolvedValue([mockInvestment]);

      await controller.findAll(mockUser, filters);

      expect(mockInvestmentsService.findAll).toHaveBeenCalledWith(
        mockUser.id,
        filters,
      );
    });
  });

  describe('getSummary', () => {
    it('should return investment summary', async () => {
      const summary = {
        total_invested: 10000,
        by_type: [
          { type: 'renda_fixa', total: 6000, percentage: 60, count: 2 },
          { type: 'renda_variavel', total: 4000, percentage: 40, count: 1 },
        ],
        monthly_average: 3333.33,
      };
      mockInvestmentsService.getSummary.mockResolvedValue(summary);

      const result = await controller.getSummary(
        mockUser,
        '2024-01-01',
        '2024-12-31',
      );

      expect(mockInvestmentsService.getSummary).toHaveBeenCalledWith(
        mockUser.id,
        '2024-01-01',
        '2024-12-31',
      );
      expect(result).toEqual(summary);
    });

    it('should handle optional date parameters', async () => {
      const summary = {
        total_invested: 10000,
        by_type: [],
        monthly_average: 0,
      };
      mockInvestmentsService.getSummary.mockResolvedValue(summary);

      await controller.getSummary(mockUser);

      expect(mockInvestmentsService.getSummary).toHaveBeenCalledWith(
        mockUser.id,
        undefined,
        undefined,
      );
    });
  });

  describe('getEvolution', () => {
    it('should return monthly evolution', async () => {
      const evolution = [
        {
          month: '2024-01',
          total: 5000,
          by_type: {
            renda_fixa: 5000,
            renda_variavel: 0,
            cripto: 0,
            outros: 0,
          },
        },
        {
          month: '2024-02',
          total: 3000,
          by_type: {
            renda_fixa: 3000,
            renda_variavel: 0,
            cripto: 0,
            outros: 0,
          },
        },
      ];
      mockInvestmentsService.getMonthlyEvolution.mockResolvedValue(evolution);

      const result = await controller.getEvolution(mockUser, 2024);

      expect(mockInvestmentsService.getMonthlyEvolution).toHaveBeenCalledWith(
        mockUser.id,
        2024,
      );
      expect(result).toEqual(evolution);
    });
  });

  describe('getMonthlyTotal', () => {
    it('should return total for specific month', async () => {
      mockInvestmentsService.getTotalByMonth.mockResolvedValue(8000);

      const result = await controller.getMonthlyTotal(mockUser, 1, 2024);

      expect(mockInvestmentsService.getTotalByMonth).toHaveBeenCalledWith(
        mockUser.id,
        1,
        2024,
      );
      expect(result).toBe(8000);
    });
  });

  describe('findOne', () => {
    it('should return a single investment', async () => {
      mockInvestmentsService.findOne.mockResolvedValue(mockInvestment);

      const result = await controller.findOne(mockUser, 'inv-123');

      expect(mockInvestmentsService.findOne).toHaveBeenCalledWith(
        mockUser.id,
        'inv-123',
      );
      expect(result).toEqual(mockInvestment);
    });
  });

  describe('update', () => {
    it('should update an investment', async () => {
      const dto: UpdateInvestmentDto = { amount: 6000 };
      const updatedInvestment = { ...mockInvestment, amount: 6000 };
      mockInvestmentsService.update.mockResolvedValue(updatedInvestment);

      const result = await controller.update(mockUser, 'inv-123', dto);

      expect(mockInvestmentsService.update).toHaveBeenCalledWith(
        mockUser.id,
        'inv-123',
        dto,
      );
      expect(result).toEqual(updatedInvestment);
    });
  });

  describe('remove', () => {
    it('should delete an investment', async () => {
      mockInvestmentsService.remove.mockResolvedValue(undefined);

      await controller.remove(mockUser, 'inv-123');

      expect(mockInvestmentsService.remove).toHaveBeenCalledWith(
        mockUser.id,
        'inv-123',
      );
    });
  });
});
