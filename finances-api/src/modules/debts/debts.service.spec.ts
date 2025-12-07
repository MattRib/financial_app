/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DebtsService } from './debts.service';
import { SUPABASE_CLIENT } from '../../config/supabase.module';
import { CreateDebtDto } from './dto';

describe('DebtsService', () => {
  let service: DebtsService;
  let mockSupabase: any;

  const mockUserId = 'user-123';
  const mockDebt = {
    id: 'debt-123',
    user_id: mockUserId,
    name: 'Cartão de Crédito',
    amount: 1500,
    due_date: '2024-12-31',
    status: 'pending',
    amount_paid: 0,
    creditor: 'Banco XYZ',
    notes: 'Fatura mensal',
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
        DebtsService,
        {
          provide: SUPABASE_CLIENT,
          useValue: mockSupabase,
        },
      ],
    }).compile();

    service = module.get<DebtsService>(DebtsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a debt', async () => {
      const dto: CreateDebtDto = {
        name: 'Cartão de Crédito',
        amount: 1500,
        due_date: '2024-12-31',
        status: 'pending',
        creditor: 'Banco XYZ',
        notes: 'Fatura mensal',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockDebt,
        error: null,
      });

      const result = await service.create(mockUserId, dto);

      expect(mockSupabase.from).toHaveBeenCalledWith('debts');
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        user_id: mockUserId,
        name: dto.name,
        amount: dto.amount,
        due_date: dto.due_date,
        status: dto.status ?? 'pending',
        amount_paid: dto.amount_paid ?? 0,
        creditor: dto.creditor,
        notes: dto.notes,
      });
      expect(result).toEqual(mockDebt);
    });

    it('should create debt with default values', async () => {
      const dto: CreateDebtDto = {
        name: 'Empréstimo',
        amount: 5000,
        due_date: '2025-06-30',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockDebt,
        error: null,
      });

      await service.create(mockUserId, dto);

      expect(mockSupabase.insert).toHaveBeenCalledWith({
        user_id: mockUserId,
        name: dto.name,
        amount: dto.amount,
        due_date: dto.due_date,
        status: 'pending',
        amount_paid: 0,
        creditor: undefined,
        notes: undefined,
      });
    });

    it('should throw error when creation fails', async () => {
      const dto: CreateDebtDto = {
        name: 'Test',
        amount: 100,
        due_date: '2024-12-31',
      };

      const error = new Error('Database error');
      mockSupabase.single.mockResolvedValue({ data: null, error });

      await expect(service.create(mockUserId, dto)).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    it('should return all debts for user', async () => {
      const debts = [mockDebt];
      mockSupabase.order.mockResolvedValue({ data: debts, error: null });

      const result = await service.findAll(mockUserId);

      expect(mockSupabase.from).toHaveBeenCalledWith('debts');
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(result).toEqual(debts);
    });

    it('should filter by status', async () => {
      mockSupabase.order.mockResolvedValue({
        data: [mockDebt],
        error: null,
      });

      await service.findAll(mockUserId, { status: 'pending' });

      expect(mockSupabase.eq).toHaveBeenCalledWith('status', 'pending');
    });

    it('should filter by due date range', async () => {
      mockSupabase.order.mockResolvedValue({
        data: [mockDebt],
        error: null,
      });

      await service.findAll(mockUserId, {
        due_date_start: '2024-01-01',
        due_date_end: '2024-12-31',
      });

      expect(mockSupabase.gte).toHaveBeenCalledWith('due_date', '2024-01-01');
      expect(mockSupabase.lte).toHaveBeenCalledWith('due_date', '2024-12-31');
    });

    it('should throw error when query fails', async () => {
      const error = new Error('Database error');
      mockSupabase.order.mockResolvedValue({ data: null, error });

      await expect(service.findAll(mockUserId)).rejects.toThrow(error);
    });
  });

  describe('findOne', () => {
    it('should return a single debt', async () => {
      mockSupabase.single.mockResolvedValue({
        data: mockDebt,
        error: null,
      });

      const result = await service.findOne(mockUserId, 'debt-123');

      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'debt-123');
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(result).toEqual(mockDebt);
    });

    it('should throw NotFoundException when debt not found', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null });

      await expect(service.findOne(mockUserId, 'invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw error when query fails', async () => {
      const error = new Error('Database error');
      mockSupabase.single.mockResolvedValue({ data: null, error });

      await expect(service.findOne(mockUserId, 'debt-123')).rejects.toThrow(
        error,
      );
    });
  });

  describe('update', () => {
    it('should update a debt', async () => {
      // findOne uses 2 eq calls
      mockSupabase.eq
        .mockReturnValueOnce(mockSupabase)
        .mockReturnValueOnce(mockSupabase);

      mockSupabase.single
        .mockResolvedValueOnce({
          data: mockDebt,
          error: null,
        })
        .mockResolvedValueOnce({
          data: { ...mockDebt, amount_paid: 500 },
          error: null,
        });

      const dto = { amount_paid: 500 };
      const result = await service.update(mockUserId, 'debt-123', dto);

      expect(mockSupabase.update).toHaveBeenCalledWith(dto);
      expect(result.amount_paid).toBe(500);
    });

    it('should throw NotFoundException when debt not found', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null });

      await expect(
        service.update(mockUserId, 'invalid-id', {}),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a debt', async () => {
      // findOne uses 2 eq calls, delete uses 2 eq calls
      mockSupabase.eq
        .mockReturnValueOnce(mockSupabase) // findOne eq('id')
        .mockReturnValueOnce(mockSupabase) // findOne eq('user_id')
        .mockReturnValueOnce(mockSupabase) // delete eq('id')
        .mockReturnValueOnce(mockSupabase); // delete eq('user_id')

      mockSupabase.single.mockResolvedValue({
        data: mockDebt,
        error: null,
      });

      await service.remove(mockUserId, 'debt-123');

      expect(mockSupabase.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException when debt not found', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null });

      await expect(service.remove(mockUserId, 'invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getSummary', () => {
    it('should return debts summary', async () => {
      const debts = [
        { status: 'pending', amount: 1000, amount_paid: 200 },
        { status: 'pending', amount: 500, amount_paid: 0 },
        { status: 'paid', amount: 300, amount_paid: 300 },
      ];

      const queryThenable = {
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        then: (resolve: any) => resolve({ data: debts, error: null }),
      };
      mockSupabase.eq.mockReturnValue(queryThenable);

      const result = await service.getSummary(mockUserId);

      expect(result.total_debt).toBe(1800);
      expect(result.total_paid).toBe(500);
      expect(result.remaining).toBe(1300);
      expect(result.by_status.pending.count).toBe(2);
      expect(result.by_status.pending.total).toBe(1500);
      expect(result.by_status.paid.count).toBe(1);
      expect(result.by_status.paid.total).toBe(300);
    });

    it('should handle empty debts', async () => {
      const queryThenable = {
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        then: (resolve: any) => resolve({ data: [], error: null }),
      };
      mockSupabase.eq.mockReturnValue(queryThenable);

      const result = await service.getSummary(mockUserId);

      expect(result.total_debt).toBe(0);
      expect(result.total_paid).toBe(0);
      expect(result.remaining).toBe(0);
    });
  });

  describe('getOverdue', () => {
    it('should return overdue debts', async () => {
      const overdueDebts = [
        { ...mockDebt, status: 'overdue', due_date: '2024-01-01' },
      ];

      const queryThenable = {
        eq: jest.fn().mockReturnThis(),
        lte: jest.fn().mockResolvedValue({
          data: overdueDebts,
          error: null,
        }),
        then: (resolve: any) => resolve({ data: overdueDebts, error: null }),
      };
      mockSupabase.eq.mockReturnValue(queryThenable);

      const result = await service.getOverdue(mockUserId);

      expect(result).toEqual(overdueDebts);
    });
  });

  describe('markAsPaid', () => {
    it('should mark debt as paid', async () => {
      mockSupabase.eq
        .mockReturnValueOnce(mockSupabase)
        .mockReturnValueOnce(mockSupabase);

      mockSupabase.single
        .mockResolvedValueOnce({
          data: mockDebt,
          error: null,
        })
        .mockResolvedValueOnce({
          data: { ...mockDebt, status: 'paid', amount_paid: mockDebt.amount },
          error: null,
        });

      const result = await service.markAsPaid(mockUserId, 'debt-123');

      expect(mockSupabase.update).toHaveBeenCalledWith({
        status: 'paid',
        amount_paid: mockDebt.amount,
      });
      expect(result.status).toBe('paid');
    });
  });
});
