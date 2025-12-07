/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { TransactionsService } from './transactions.service'
import { SUPABASE_CLIENT } from '../../config/supabase.module'
import { CreateTransactionDto } from './dto'

describe('TransactionsService', () => {
  let service: TransactionsService
  let mockSupabase: any

  const mockUserId = 'user-123'
  const mockTransaction = {
    id: 'trans-123',
    user_id: mockUserId,
    category_id: 'cat-123',
    amount: 150.0,
    type: 'expense',
    description: 'Almoço',
    date: '2024-01-15',
    tags: ['alimentação'],
    attachment_url: null,
    created_at: new Date(),
  }

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
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: SUPABASE_CLIENT,
          useValue: mockSupabase,
        },
      ],
    }).compile()

    service = module.get<TransactionsService>(TransactionsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('create', () => {
    it('should create a transaction', async () => {
      const dto: CreateTransactionDto = {
        amount: 150.0,
        type: 'expense',
        category_id: 'cat-123',
        description: 'Almoço',
        date: '2024-01-15',
        tags: ['alimentação'],
      }

      mockSupabase.single.mockResolvedValue({ data: mockTransaction, error: null })

      const result = await service.create(mockUserId, dto)

      expect(mockSupabase.from).toHaveBeenCalledWith('transactions')
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        user_id: mockUserId,
        amount: dto.amount,
        type: dto.type,
        category_id: dto.category_id,
        description: dto.description,
        date: dto.date,
        tags: dto.tags,
        attachment_url: null,
      })
      expect(result).toEqual(mockTransaction)
    })

    it('should create transaction with default values', async () => {
      const dto: CreateTransactionDto = {
        amount: 100,
        type: 'income',
        date: '2024-01-15',
      }

      mockSupabase.single.mockResolvedValue({ data: mockTransaction, error: null })

      await service.create(mockUserId, dto)

      expect(mockSupabase.insert).toHaveBeenCalledWith({
        user_id: mockUserId,
        amount: dto.amount,
        type: dto.type,
        category_id: null,
        description: null,
        date: dto.date,
        tags: [],
        attachment_url: null,
      })
    })

    it('should throw error when insert fails', async () => {
      const dto: CreateTransactionDto = {
        amount: 100,
        type: 'expense',
        date: '2024-01-15',
      }

      const error = new Error('Database error')
      mockSupabase.single.mockResolvedValue({ data: null, error })

      await expect(service.create(mockUserId, dto)).rejects.toThrow(error)
    })
  })

  describe('findAll', () => {
    it('should return all transactions for user', async () => {
      const transactions = [mockTransaction]
      mockSupabase.order.mockResolvedValue({ data: transactions, error: null })

      const result = await service.findAll(mockUserId)

      expect(mockSupabase.from).toHaveBeenCalledWith('transactions')
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', mockUserId)
      expect(result).toEqual(transactions)
    })

    it('should filter by type', async () => {
      const transactions = [mockTransaction]
      mockSupabase.order.mockResolvedValue({ data: transactions, error: null })

      await service.findAll(mockUserId, { type: 'expense' })

      expect(mockSupabase.eq).toHaveBeenCalledWith('type', 'expense')
    })

    it('should filter by category_id', async () => {
      const transactions = [mockTransaction]
      mockSupabase.order.mockResolvedValue({ data: transactions, error: null })

      await service.findAll(mockUserId, { category_id: 'cat-123' })

      expect(mockSupabase.eq).toHaveBeenCalledWith('category_id', 'cat-123')
    })

    it('should filter by date range', async () => {
      const transactions = [mockTransaction]
      mockSupabase.order.mockResolvedValue({ data: transactions, error: null })

      await service.findAll(mockUserId, {
        start_date: '2024-01-01',
        end_date: '2024-01-31',
      })

      expect(mockSupabase.gte).toHaveBeenCalledWith('date', '2024-01-01')
      expect(mockSupabase.lte).toHaveBeenCalledWith('date', '2024-01-31')
    })

    it('should throw error when query fails', async () => {
      const error = new Error('Database error')
      mockSupabase.order.mockResolvedValue({ data: null, error })

      await expect(service.findAll(mockUserId)).rejects.toThrow(error)
    })
  })

  describe('findOne', () => {
    it('should return a single transaction', async () => {
      mockSupabase.single.mockResolvedValue({ data: mockTransaction, error: null })

      const result = await service.findOne(mockUserId, 'trans-123')

      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'trans-123')
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', mockUserId)
      expect(result).toEqual(mockTransaction)
    })

    it('should throw NotFoundException when transaction not found', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null })

      await expect(service.findOne(mockUserId, 'invalid-id')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('update', () => {
    it('should update a transaction', async () => {
      const updatedTransaction = { ...mockTransaction, amount: 200 }

      mockSupabase.single
        .mockResolvedValueOnce({ data: mockTransaction, error: null })
        .mockResolvedValueOnce({ data: updatedTransaction, error: null })

      const result = await service.update(mockUserId, 'trans-123', { amount: 200 })

      expect(mockSupabase.update).toHaveBeenCalledWith({ amount: 200 })
      expect(result).toEqual(updatedTransaction)
    })

    it('should throw NotFoundException when transaction not found', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null })

      await expect(
        service.update(mockUserId, 'invalid-id', { amount: 200 }),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('remove', () => {
    it('should delete a transaction', async () => {
      mockSupabase.single.mockResolvedValue({ data: mockTransaction, error: null })
      mockSupabase.eq
        .mockReturnValueOnce(mockSupabase)
        .mockReturnValueOnce(mockSupabase)
        .mockReturnValueOnce(mockSupabase)
        .mockResolvedValueOnce({ error: null })

      await service.remove(mockUserId, 'trans-123')

      expect(mockSupabase.delete).toHaveBeenCalled()
    })

    it('should throw NotFoundException when transaction not found', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null })

      await expect(service.remove(mockUserId, 'invalid-id')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('getSummary', () => {
    it('should return transaction summary', async () => {
      const transactions = [
        { amount: 1000, type: 'income' },
        { amount: 500, type: 'income' },
        { amount: 300, type: 'expense' },
        { amount: 200, type: 'expense' },
      ]

      mockSupabase.lte.mockResolvedValue({ data: transactions, error: null })

      const result = await service.getSummary(mockUserId, '2024-01-01', '2024-01-31')

      expect(result).toEqual({
        total_income: 1500,
        total_expense: 500,
        balance: 1000,
      })
    })

    it('should return zero values when no transactions', async () => {
      mockSupabase.lte.mockResolvedValue({ data: [], error: null })

      const result = await service.getSummary(mockUserId, '2024-01-01', '2024-01-31')

      expect(result).toEqual({
        total_income: 0,
        total_expense: 0,
        balance: 0,
      })
    })

    it('should throw error when query fails', async () => {
      const error = new Error('Database error')
      mockSupabase.lte.mockResolvedValue({ data: null, error })

      await expect(
        service.getSummary(mockUserId, '2024-01-01', '2024-01-31'),
      ).rejects.toThrow(error)
    })
  })

  describe('getByCategory', () => {
    it('should return expenses grouped by category', async () => {
      const transactions = [
        {
          amount: 100,
          category_id: 'cat-1',
          categories: { name: 'Alimentação', color: '#ef4444' },
        },
        {
          amount: 50,
          category_id: 'cat-1',
          categories: { name: 'Alimentação', color: '#ef4444' },
        },
        {
          amount: 200,
          category_id: 'cat-2',
          categories: { name: 'Transporte', color: '#f97316' },
        },
      ]

      mockSupabase.lte.mockResolvedValue({ data: transactions, error: null })

      const result = await service.getByCategory(mockUserId, '2024-01-01', '2024-01-31')

      expect(result).toHaveLength(2)
      expect(result[0].category_name).toBe('Transporte')
      expect(result[0].total).toBe(200)
      expect(result[1].category_name).toBe('Alimentação')
      expect(result[1].total).toBe(150)
    })

    it('should handle uncategorized transactions', async () => {
      const transactions = [{ amount: 100, category_id: null, categories: null }]

      mockSupabase.lte.mockResolvedValue({ data: transactions, error: null })

      const result = await service.getByCategory(mockUserId, '2024-01-01', '2024-01-31')

      expect(result[0].category_id).toBe('uncategorized')
      expect(result[0].category_name).toBe('Sem categoria')
    })

    it('should calculate correct percentages', async () => {
      const transactions = [
        { amount: 50, category_id: 'cat-1', categories: { name: 'A', color: '#000' } },
        { amount: 50, category_id: 'cat-2', categories: { name: 'B', color: '#fff' } },
      ]

      mockSupabase.lte.mockResolvedValue({ data: transactions, error: null })

      const result = await service.getByCategory(mockUserId, '2024-01-01', '2024-01-31')

      expect(result[0].percentage).toBe(50)
      expect(result[1].percentage).toBe(50)
    })
  })
})
