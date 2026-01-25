import { Test, TestingModule } from '@nestjs/testing';
import { DebtsController } from './debts.controller';
import { DebtsService } from './debts.service';
import { CreateDebtDto, UpdateDebtDto } from './dto';
import { SUPABASE_CLIENT } from '../../config/supabase.module';
import type { User } from '@supabase/supabase-js';

describe('DebtsController', () => {
  let controller: DebtsController;

  const mockUser = { id: 'user-123' } as User;
  const mockDebt = {
    id: 'debt-123',
    user_id: 'user-123',
    name: 'Cartão de Crédito',
    amount: 1500,
    due_date: '2024-12-31',
    status: 'pending',
    amount_paid: 0,
    creditor: 'Banco XYZ',
    notes: 'Fatura mensal',
    created_at: new Date(),
  };

  const mockDebtsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getSummary: jest.fn(),
    getOverdue: jest.fn(),
    markAsPaid: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DebtsController],
      providers: [
        {
          provide: DebtsService,
          useValue: mockDebtsService,
        },
        {
          provide: SUPABASE_CLIENT,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<DebtsController>(DebtsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

      mockDebtsService.create.mockResolvedValue(mockDebt);

      const result = await controller.create(mockUser, dto);

      expect(mockDebtsService.create).toHaveBeenCalledWith(mockUser.id, dto);
      expect(result).toEqual(mockDebt);
    });
  });

  describe('findAll', () => {
    it('should return all debts', async () => {
      const debts = [mockDebt];
      mockDebtsService.findAll.mockResolvedValue(debts);

      const result = await controller.findAll(mockUser, {});

      expect(mockDebtsService.findAll).toHaveBeenCalledWith(mockUser.id, {});
      expect(result).toEqual(debts);
    });

    it('should pass filters to service', async () => {
      const filters = {
        status: 'pending' as const,
        due_date_start: '2024-01-01',
      };
      mockDebtsService.findAll.mockResolvedValue([mockDebt]);

      await controller.findAll(mockUser, filters);

      expect(mockDebtsService.findAll).toHaveBeenCalledWith(
        mockUser.id,
        filters,
      );
    });
  });

  describe('getSummary', () => {
    it('should return debts summary', async () => {
      const summary = {
        total_debt: 5000,
        total_paid: 1500,
        remaining: 3500,
        by_status: {
          pending: { count: 2, total: 3000 },
          paid: { count: 1, total: 2000 },
          overdue: { count: 0, total: 0 },
        },
      };
      mockDebtsService.getSummary.mockResolvedValue(summary);

      const result = await controller.getSummary(mockUser);

      expect(mockDebtsService.getSummary).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(summary);
    });
  });

  describe('getOverdue', () => {
    it('should return overdue debts', async () => {
      const overdueDebts = [{ ...mockDebt, status: 'overdue' }];
      mockDebtsService.getOverdue.mockResolvedValue(overdueDebts);

      const result = await controller.getOverdue(mockUser);

      expect(mockDebtsService.getOverdue).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(overdueDebts);
    });
  });

  describe('markAsPaid', () => {
    it('should mark debt as paid', async () => {
      const paidDebt = { ...mockDebt, status: 'paid', amount_paid: 1500 };
      mockDebtsService.markAsPaid.mockResolvedValue(paidDebt);

      const result = await controller.markAsPaid(mockUser, 'debt-123');

      expect(mockDebtsService.markAsPaid).toHaveBeenCalledWith(
        mockUser.id,
        'debt-123',
      );
      expect(result).toEqual(paidDebt);
    });
  });

  describe('findOne', () => {
    it('should return a single debt', async () => {
      mockDebtsService.findOne.mockResolvedValue(mockDebt);

      const result = await controller.findOne(mockUser, 'debt-123');

      expect(mockDebtsService.findOne).toHaveBeenCalledWith(
        mockUser.id,
        'debt-123',
      );
      expect(result).toEqual(mockDebt);
    });
  });

  describe('update', () => {
    it('should update a debt', async () => {
      const dto: UpdateDebtDto = { amount_paid: 500 };
      const updatedDebt = { ...mockDebt, amount_paid: 500 };
      mockDebtsService.update.mockResolvedValue(updatedDebt);

      const result = await controller.update(mockUser, 'debt-123', dto);

      expect(mockDebtsService.update).toHaveBeenCalledWith(
        mockUser.id,
        'debt-123',
        dto,
      );
      expect(result).toEqual(updatedDebt);
    });
  });

  describe('remove', () => {
    it('should delete a debt', async () => {
      mockDebtsService.remove.mockResolvedValue(undefined);

      await controller.remove(mockUser, 'debt-123');

      expect(mockDebtsService.remove).toHaveBeenCalledWith(
        mockUser.id,
        'debt-123',
      );
    });
  });
});
