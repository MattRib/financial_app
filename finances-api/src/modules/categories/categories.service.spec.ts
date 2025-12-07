/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { SUPABASE_CLIENT } from '../../config/supabase.module';
import { CreateCategoryDto } from './dto';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let mockSupabase: any;

  const mockUserId = 'user-123';
  const mockCategory = {
    id: 'cat-123',
    user_id: mockUserId,
    name: 'Alimentação',
    type: 'expense',
    color: '#ef4444',
    icon: 'utensils',
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
      order: jest.fn().mockReturnThis(),
      single: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: SUPABASE_CLIENT,
          useValue: mockSupabase,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a category', async () => {
      const dto: CreateCategoryDto = {
        name: 'Alimentação',
        type: 'expense',
        color: '#ef4444',
        icon: 'utensils',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockCategory,
        error: null,
      });

      const result = await service.create(mockUserId, dto);

      expect(mockSupabase.from).toHaveBeenCalledWith('categories');
      expect(mockSupabase.insert).toHaveBeenCalledWith({
        user_id: mockUserId,
        name: dto.name,
        type: dto.type,
        color: dto.color,
        icon: dto.icon,
      });
      expect(result).toEqual(mockCategory);
    });

    it('should use default color and icon when not provided', async () => {
      const dto: CreateCategoryDto = {
        name: 'Salário',
        type: 'income',
      };

      mockSupabase.single.mockResolvedValue({
        data: mockCategory,
        error: null,
      });

      await service.create(mockUserId, dto);

      expect(mockSupabase.insert).toHaveBeenCalledWith({
        user_id: mockUserId,
        name: dto.name,
        type: dto.type,
        color: '#6366f1',
        icon: 'tag',
      });
    });

    it('should throw error when insert fails', async () => {
      const dto: CreateCategoryDto = {
        name: 'Alimentação',
        type: 'expense',
      };

      const error = new Error('Database error');
      mockSupabase.single.mockResolvedValue({ data: null, error });

      await expect(service.create(mockUserId, dto)).rejects.toThrow(error);
    });
  });

  describe('findAll', () => {
    it('should return all categories for user', async () => {
      const categories = [mockCategory];
      mockSupabase.order.mockResolvedValue({ data: categories, error: null });

      const result = await service.findAll(mockUserId);

      expect(mockSupabase.from).toHaveBeenCalledWith('categories');
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(result).toEqual(categories);
    });

    it('should throw error when query fails', async () => {
      const error = new Error('Database error');
      mockSupabase.order.mockResolvedValue({ data: null, error });

      await expect(service.findAll(mockUserId)).rejects.toThrow(error);
    });
  });

  describe('findByType', () => {
    it('should return categories filtered by type', async () => {
      const categories = [mockCategory];
      mockSupabase.order.mockResolvedValue({ data: categories, error: null });

      const result = await service.findByType(mockUserId, 'expense');

      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(mockSupabase.eq).toHaveBeenCalledWith('type', 'expense');
      expect(result).toEqual(categories);
    });
  });

  describe('findOne', () => {
    it('should return a single category', async () => {
      mockSupabase.single.mockResolvedValue({
        data: mockCategory,
        error: null,
      });

      const result = await service.findOne(mockUserId, 'cat-123');

      expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'cat-123');
      expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(result).toEqual(mockCategory);
    });

    it('should throw NotFoundException when category not found', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null });

      await expect(service.findOne(mockUserId, 'invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const updatedCategory = { ...mockCategory, name: 'Comida' };

      mockSupabase.single
        .mockResolvedValueOnce({ data: mockCategory, error: null })
        .mockResolvedValueOnce({ data: updatedCategory, error: null });

      const result = await service.update(mockUserId, 'cat-123', {
        name: 'Comida',
      });

      expect(mockSupabase.update).toHaveBeenCalledWith({ name: 'Comida' });
      expect(result).toEqual(updatedCategory);
    });

    it('should throw NotFoundException when category not found', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null });

      await expect(
        service.update(mockUserId, 'invalid-id', { name: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a category', async () => {
      mockSupabase.single.mockResolvedValue({
        data: mockCategory,
        error: null,
      });
      mockSupabase.eq
        .mockReturnValueOnce(mockSupabase)
        .mockReturnValueOnce(mockSupabase)
        .mockReturnValueOnce(mockSupabase)
        .mockResolvedValueOnce({ error: null });

      await service.remove(mockUserId, 'cat-123');

      expect(mockSupabase.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException when category not found', async () => {
      mockSupabase.single.mockResolvedValue({ data: null, error: null });

      await expect(service.remove(mockUserId, 'invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
