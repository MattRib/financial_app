/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';
import { CreateBudgetDto, UpdateBudgetDto } from './dto';
import { SUPABASE_CLIENT } from '../../config/supabase.module';

describe('BudgetsController', () => {
  let controller: BudgetsController;
  let service: BudgetsService;

  const mockUser = { id: 'user-123' } as any;
  const mockBudget = {
    id: 'budget-123',
    user_id: 'user-123',
    category_id: 'cat-123',
    amount: 1000,
    month: 1,
    year: 2024,
    created_at: new Date(),
    spent: 300,
    remaining: 700,
    percentage: 30,
  };

  const mockBudgetsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    getOverview: jest.fn(),
    getAlerts: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BudgetsController],
      providers: [
        {
          provide: BudgetsService,
          useValue: mockBudgetsService,
        },
        {
          provide: SUPABASE_CLIENT,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<BudgetsController>(BudgetsController);
    service = module.get<BudgetsService>(BudgetsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a budget', async () => {
      const dto: CreateBudgetDto = {
        amount: 1000,
        category_id: 'cat-123',
        month: 1,
        year: 2024,
      };

      mockBudgetsService.create.mockResolvedValue(mockBudget);

      const result = await controller.create(mockUser, dto);

      expect(service.create).toHaveBeenCalledWith(mockUser.id, dto);
      expect(result).toEqual(mockBudget);
    });
  });

  describe('findAll', () => {
    it('should return all budgets for period', async () => {
      const budgets = [mockBudget];
      mockBudgetsService.findAll.mockResolvedValue(budgets);

      const result = await controller.findAll(mockUser, 1, 2024);

      expect(service.findAll).toHaveBeenCalledWith(mockUser.id, 1, 2024);
      expect(result).toEqual(budgets);
    });
  });

  describe('getOverview', () => {
    it('should return budget overview', async () => {
      const overview = {
        total_budget: 1000,
        total_spent: 300,
        total_remaining: 700,
        percentage: 30,
        budgets: [mockBudget],
      };
      mockBudgetsService.getOverview.mockResolvedValue(overview);

      const result = await controller.getOverview(mockUser, 1, 2024);

      expect(service.getOverview).toHaveBeenCalledWith(mockUser.id, 1, 2024);
      expect(result).toEqual(overview);
    });
  });

  describe('getAlerts', () => {
    it('should return budget alerts', async () => {
      const alerts = [{ ...mockBudget, percentage: 85 }];
      mockBudgetsService.getAlerts.mockResolvedValue(alerts);

      const result = await controller.getAlerts(mockUser, 1, 2024);

      expect(service.getAlerts).toHaveBeenCalledWith(mockUser.id, 1, 2024);
      expect(result).toEqual(alerts);
    });
  });

  describe('findOne', () => {
    it('should return a single budget', async () => {
      mockBudgetsService.findOne.mockResolvedValue(mockBudget);

      const result = await controller.findOne(mockUser, 'budget-123');

      expect(service.findOne).toHaveBeenCalledWith(mockUser.id, 'budget-123');
      expect(result).toEqual(mockBudget);
    });
  });

  describe('update', () => {
    it('should update a budget', async () => {
      const dto: UpdateBudgetDto = { amount: 1500 };
      const updatedBudget = { ...mockBudget, amount: 1500 };
      mockBudgetsService.update.mockResolvedValue(updatedBudget);

      const result = await controller.update(mockUser, 'budget-123', dto);

      expect(service.update).toHaveBeenCalledWith(
        mockUser.id,
        'budget-123',
        dto,
      );
      expect(result).toEqual(updatedBudget);
    });
  });

  describe('remove', () => {
    it('should delete a budget', async () => {
      mockBudgetsService.remove.mockResolvedValue(undefined);

      await controller.remove(mockUser, 'budget-123');

      expect(service.remove).toHaveBeenCalledWith(mockUser.id, 'budget-123');
    });
  });
});
