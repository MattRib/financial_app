/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { SUPABASE_CLIENT } from '../../config/supabase.module';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  const mockUser = { id: 'user-123' } as any;
  const mockCategory = {
    id: 'cat-123',
    user_id: 'user-123',
    name: 'Alimentação',
    type: 'expense',
    color: '#ef4444',
    icon: 'utensils',
    created_at: new Date(),
  };

  const mockCategoriesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByType: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: mockCategoriesService,
        },
        {
          provide: SUPABASE_CLIENT,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a category', async () => {
      const dto: CreateCategoryDto = {
        name: 'Alimentação',
        type: 'expense',
      };

      mockCategoriesService.create.mockResolvedValue(mockCategory);

      const result = await controller.create(mockUser, dto);

      expect(mockCategoriesService.create).toHaveBeenCalledWith(
        mockUser.id,
        dto,
      );
      expect(result).toEqual(mockCategory);
    });
  });

  describe('findAll', () => {
    it('should return all categories when no type filter', async () => {
      const categories = [mockCategory];
      mockCategoriesService.findAll.mockResolvedValue(categories);

      const result = await controller.findAll(mockUser);

      expect(mockCategoriesService.findAll).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual(categories);
    });

    it('should return filtered categories when type is provided', async () => {
      const categories = [mockCategory];
      mockCategoriesService.findByType.mockResolvedValue(categories);

      const result = await controller.findAll(mockUser, 'expense');

      expect(mockCategoriesService.findByType).toHaveBeenCalledWith(
        mockUser.id,
        'expense',
      );
      expect(result).toEqual(categories);
    });
  });

  describe('findOne', () => {
    it('should return a single category', async () => {
      mockCategoriesService.findOne.mockResolvedValue(mockCategory);

      const result = await controller.findOne(mockUser, 'cat-123');

      expect(mockCategoriesService.findOne).toHaveBeenCalledWith(
        mockUser.id,
        'cat-123',
      );
      expect(result).toEqual(mockCategory);
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const dto: UpdateCategoryDto = { name: 'Comida' };
      const updatedCategory = { ...mockCategory, name: 'Comida' };
      mockCategoriesService.update.mockResolvedValue(updatedCategory);

      const result = await controller.update(mockUser, 'cat-123', dto);

      expect(mockCategoriesService.update).toHaveBeenCalledWith(
        mockUser.id,
        'cat-123',
        dto,
      );
      expect(result).toEqual(updatedCategory);
    });
  });

  describe('remove', () => {
    it('should delete a category', async () => {
      mockCategoriesService.remove.mockResolvedValue(undefined);

      await controller.remove(mockUser, 'cat-123');

      expect(mockCategoriesService.remove).toHaveBeenCalledWith(
        mockUser.id,
        'cat-123',
      );
    });
  });
});
