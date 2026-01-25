import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto, UpdateTransactionDto } from './dto';
import { SUPABASE_CLIENT } from '../../config/supabase.module';
import type { User } from '@supabase/supabase-js';

describe('TransactionsController', () => {
  let controller: TransactionsController;

  const mockUser = { id: 'user-123' } as User;
  const mockTransaction = {
    id: 'trans-123',
    user_id: 'user-123',
    category_id: 'cat-123',
    amount: 150.0,
    type: 'expense',
    description: 'Almoço',
    date: '2024-01-15',
    tags: ['alimentação'],
    attachment_url: null,
    created_at: new Date(),
  };

  const mockTransactionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getSummary: jest.fn(),
    getByCategory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        {
          provide: TransactionsService,
          useValue: mockTransactionsService,
        },
        {
          provide: SUPABASE_CLIENT,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a transaction', async () => {
      const dto: CreateTransactionDto = {
        amount: 150,
        type: 'expense',
        date: '2024-01-15',
      };

      mockTransactionsService.create.mockResolvedValue(mockTransaction);

      const result = await controller.create(mockUser, dto);

      expect(mockTransactionsService.create).toHaveBeenCalledWith(
        mockUser.id,
        dto,
      );
      expect(result).toEqual(mockTransaction);
    });
  });

  describe('findAll', () => {
    it('should return all transactions', async () => {
      const transactions = [mockTransaction];
      mockTransactionsService.findAll.mockResolvedValue(transactions);

      const result = await controller.findAll(mockUser, {});

      expect(mockTransactionsService.findAll).toHaveBeenCalledWith(
        mockUser.id,
        {},
      );
      expect(result).toEqual(transactions);
    });

    it('should pass filters to service', async () => {
      const filters = { type: 'expense' as const, start_date: '2024-01-01' };
      mockTransactionsService.findAll.mockResolvedValue([mockTransaction]);

      await controller.findAll(mockUser, filters);

      expect(mockTransactionsService.findAll).toHaveBeenCalledWith(
        mockUser.id,
        filters,
      );
    });
  });

  describe('getSummary', () => {
    it('should return transaction summary', async () => {
      const summary = { total_income: 1000, total_expense: 500, balance: 500 };
      mockTransactionsService.getSummary.mockResolvedValue(summary);

      const result = await controller.getSummary(
        mockUser,
        '2024-01-01',
        '2024-01-31',
      );

      expect(mockTransactionsService.getSummary).toHaveBeenCalledWith(
        mockUser.id,
        '2024-01-01',
        '2024-01-31',
      );
      expect(result).toEqual(summary);
    });
  });

  describe('getByCategory', () => {
    it('should return expenses by category', async () => {
      const byCategory = [
        {
          category_id: 'cat-1',
          category_name: 'Food',
          category_color: '#000',
          total: 500,
          percentage: 100,
        },
      ];
      mockTransactionsService.getByCategory.mockResolvedValue(byCategory);

      const result = await controller.getByCategory(
        mockUser,
        '2024-01-01',
        '2024-01-31',
      );

      expect(mockTransactionsService.getByCategory).toHaveBeenCalledWith(
        mockUser.id,
        '2024-01-01',
        '2024-01-31',
      );
      expect(result).toEqual(byCategory);
    });
  });

  describe('findOne', () => {
    it('should return a single transaction', async () => {
      mockTransactionsService.findOne.mockResolvedValue(mockTransaction);

      const result = await controller.findOne(mockUser, 'trans-123');

      expect(mockTransactionsService.findOne).toHaveBeenCalledWith(
        mockUser.id,
        'trans-123',
      );
      expect(result).toEqual(mockTransaction);
    });
  });

  describe('update', () => {
    it('should update a transaction', async () => {
      const dto: UpdateTransactionDto = { amount: 200 };
      const updatedTransaction = { ...mockTransaction, amount: 200 };
      mockTransactionsService.update.mockResolvedValue(updatedTransaction);

      const result = await controller.update(mockUser, 'trans-123', dto);

      expect(mockTransactionsService.update).toHaveBeenCalledWith(
        mockUser.id,
        'trans-123',
        dto,
      );
      expect(result).toEqual(updatedTransaction);
    });
  });

  describe('remove', () => {
    it('should delete a transaction', async () => {
      mockTransactionsService.remove.mockResolvedValue(undefined);

      await controller.remove(mockUser, 'trans-123');

      expect(mockTransactionsService.remove).toHaveBeenCalledWith(
        mockUser.id,
        'trans-123',
      );
    });
  });
});
