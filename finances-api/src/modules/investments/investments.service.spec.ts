import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import { SUPABASE_CLIENT } from '../../config/supabase.module';
import { CreateInvestmentDto } from './dto';

describe('InvestmentsService', () => {
  let service: InvestmentsService;
  let mockSupabase: Record<string, jest.Mock>;

  const mockUserId = 'user-123';
  const mockInvestment = {
    id: 'inv-123',
    user_id: mockUserId,
    type: 'renda_fixa',
    name: 'Tesouro Selic',
    amount: 1000,
    date: '2024-01-15',
    notes: 'Aporte mensal',
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
        InvestmentsService,
        {
          provide: SUPABASE_CLIENT,
          useValue: mockSupabase,
        },
      ],
    }).compile();

    service = module.get<InvestmentsService>(InvestmentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an investment', async () => {
      const dto: CreateInvestmentDto = {
        type: 'renda_fixa',
        name: 'Tesouro Selic',
        amount: 1000,
        date: '2024-01-15',
        notes: 'Aporte mensal',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockInvestment,
        error: null,
      });

      const result = await service.create(mockUserId, dto);

      expect(mockSupabase.from).toHaveBeenCalledWith('investments');
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        user_id: mockUserId,
        type: dto.type,
        name: dto.name,
        amount: dto.amount,
        date: dto.date,
        notes: dto.notes,
      });
      expect(result).toEqual(mockInvestment);
    });

    it('should create investment without notes', async () => {
      const dto: CreateInvestmentDto = {
        type: 'cripto',
        name: 'Bitcoin',
        amount: 500,
        date: '2024-01-15',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockInvestment,
        error: null,
      });

      await service.create(mockUserId, dto);

      expect(mockSupabase.insert).toHaveBeenCalledWith({
        user_id: mockUserId,
        type: dto.type,
        name: dto.name,
        amount: dto.amount,
        date: dto.date,
        notes: null,
      });
    });

    it('should throw error when insert fails', async () => {
      const dto: CreateInvestmentDto = {
        type: 'renda_fixa',
        name: 'CDB',
        amount: 1000,
        date: '2024-01-15',
      };

      const error = new Error('Database error');
      mockSupabase.single.mockResolvedValue({ data: null, error });

      await expect(service.create(mockUserId, dto)).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    it('should return all investments for user', async () => {
      const investments = [mockInvestment];
      mockSupabase.order.mockResolvedValue({ data: investments, error: null });

      const result = await service.findAll(mockUserId);

      expect(mockSupabase.from).toHaveBeenCalledWith('investments');
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(result).toEqual(investments);
    });

    it('should filter by type', async () => {
      mockSupabase.order.mockResolvedValue({
        data: [mockInvestment],
        error: null,
      });

      await service.findAll(mockUserId, { type: 'renda_fixa' });

      expect(mockSupabase.eq).toHaveBeenCalledWith('type', 'renda_fixa');
    });

    it('should filter by date range', async () => {
      mockSupabase.order.mockResolvedValue({
        data: [mockInvestment],
        error: null,
      });

      await service.findAll(mockUserId, {
        start_date: '2024-01-01',
        end_date: '2024-12-31',
      });

      expect(mockSupabase.gte).toHaveBeenCalledWith('date', '2024-01-01');
      expect(mockSupabase.lte).toHaveBeenCalledWith('date', '2024-12-31');
    });

    it('should throw error when query fails', async () => {
      const error = new Error('Database error');
      mockSupabase.order.mockResolvedValue({ data: null, error });

      await expect(service.findAll(mockUserId)).rejects.toThrow(error);
    });
  });

  describe('findOne', () => {
    it('should return a single investment', async () => {
      mockSupabase.single.mockResolvedValue({
        data: mockInvestment,
        error: null,
      });

      const result = await service.findOne(mockUserId, 'inv-123');

      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'inv-123');
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(result).toEqual(mockInvestment);
    });

    it('should throw NotFoundException when investment not found', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null });

      await expect(service.findOne(mockUserId, 'invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update an investment', async () => {
      const updatedInvestment = { ...mockInvestment, amount: 1500 };

      mockSupabase.single
        .mockResolvedValueOnce({ data: mockInvestment, error: null })
        .mockResolvedValueOnce({ data: updatedInvestment, error: null });

      const result = await service.update(mockUserId, 'inv-123', {
        amount: 1500,
      });

      expect(mockSupabase.update).toHaveBeenCalledWith({ amount: 1500 });
      expect(result).toEqual(updatedInvestment);
    });

    it('should throw NotFoundException when investment not found', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null });

      await expect(
        service.update(mockUserId, 'invalid-id', { amount: 1500 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete an investment', async () => {
      // findOne uses 2 eq calls, delete uses 2 eq calls
      mockSupabase.eq
        .mockReturnValueOnce(mockSupabase) // findOne eq('id')
        .mockReturnValueOnce(mockSupabase) // findOne eq('user_id')
        .mockReturnValueOnce(mockSupabase) // delete eq('id')
        .mockReturnValueOnce(mockSupabase); // delete eq('user_id')

      mockSupabase.single.mockResolvedValue({
        data: mockInvestment,
        error: null,
      });

      await service.remove(mockUserId, 'inv-123');

      expect(mockSupabase.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException when investment not found', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null });

      await expect(service.remove(mockUserId, 'invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getSummary', () => {
    it('should return investment summary', async () => {
      const investments = [
        { type: 'renda_fixa', amount: 1000, date: '2024-01-15' },
        { type: 'renda_fixa', amount: 500, date: '2024-02-15' },
        { type: 'cripto', amount: 300, date: '2024-01-20' },
      ];

      // When no dates provided, the query chain is: select → eq → await
      // Need eq to return a thenable that can also chain gte/lte
      const queryThenable = {
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        then: (resolve: (value: { data: unknown[]; error: null }) => unknown) =>
          resolve({ data: investments, error: null }),
      };
      mockSupabase.eq.mockReturnValue(queryThenable);

      const result = await service.getSummary(mockUserId);

      expect(result.total_invested).toBe(1800);
      expect(result.by_type).toHaveLength(2);
      expect(result.by_type[0].type).toBe('renda_fixa');
      expect(result.by_type[0].total).toBe(1500);
      expect(result.by_type[0].count).toBe(2);
      expect(result.by_type[1].type).toBe('cripto');
      expect(result.by_type[1].total).toBe(300);
    });

    it('should calculate monthly average', async () => {
      const investments = [
        { type: 'renda_fixa', amount: 1000, date: '2024-01-15' },
        { type: 'renda_fixa', amount: 1000, date: '2024-02-15' },
      ];

      const queryThenable = {
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        then: (resolve: (value: { data: unknown[]; error: null }) => unknown) =>
          resolve({ data: investments, error: null }),
      };
      mockSupabase.eq.mockReturnValue(queryThenable);

      const result = await service.getSummary(mockUserId);

      expect(result.monthly_average).toBe(1000);
    });

    it('should handle empty investments', async () => {
      mockSupabase.lte.mockResolvedValue({ data: [], error: null });

      const result = await service.getSummary(mockUserId);

      expect(result.total_invested).toBe(0);
      expect(result.by_type).toHaveLength(0);
      expect(result.monthly_average).toBe(0);
    });

    it('should filter by date range', async () => {
      mockSupabase.lte.mockResolvedValue({ data: [], error: null });

      await service.getSummary(mockUserId, '2024-01-01', '2024-12-31');

      expect(mockSupabase.gte).toHaveBeenCalledWith('date', '2024-01-01');
      expect(mockSupabase.lte).toHaveBeenCalledWith('date', '2024-12-31');
    });
  });

  describe('getMonthlyEvolution', () => {
    it('should return monthly evolution for year', async () => {
      const investments = [
        { type: 'renda_fixa', amount: 1000, date: '2024-01-15' },
        { type: 'cripto', amount: 500, date: '2024-01-20' },
        { type: 'renda_fixa', amount: 800, date: '2024-03-15' },
      ];

      mockSupabase.order.mockResolvedValue({ data: investments, error: null });

      const result = await service.getMonthlyEvolution(mockUserId, 2024);

      expect(result).toHaveLength(12);
      expect(result[0].month).toBe('2024-01');
      expect(result[0].total).toBe(1500);
      expect(result[0].by_type.renda_fixa).toBe(1000);
      expect(result[0].by_type.cripto).toBe(500);
      expect(result[2].month).toBe('2024-03');
      expect(result[2].total).toBe(800);
    });

    it('should return zeros for months without investments', async () => {
      mockSupabase.order.mockResolvedValue({ data: [], error: null });

      const result = await service.getMonthlyEvolution(mockUserId, 2024);

      expect(result).toHaveLength(12);
      result.forEach((month) => {
        expect(month.total).toBe(0);
      });
    });
  });

  describe('getTotalByMonth', () => {
    it('should return total invested in month', async () => {
      const investments = [{ amount: 1000 }, { amount: 500 }];

      mockSupabase.lte.mockResolvedValue({ data: investments, error: null });

      const result = await service.getTotalByMonth(mockUserId, 1, 2024);

      expect(result).toBe(1500);
    });

    it('should return zero when no investments', async () => {
      mockSupabase.lte.mockResolvedValue({ data: [], error: null });

      const result = await service.getTotalByMonth(mockUserId, 1, 2024);

      expect(result).toBe(0);
    });
  });
});
