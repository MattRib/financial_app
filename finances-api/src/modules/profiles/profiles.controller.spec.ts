import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { SUPABASE_CLIENT } from '../../config/supabase.module';

describe('ProfilesController', () => {
  let controller: ProfilesController;
  let mockService: any;

  beforeEach(async () => {
    mockService = {
      findByUserId: jest
        .fn()
        .mockResolvedValue({ id: 'user-1', username: 'me' }),
      updateProfile: jest
        .fn()
        .mockResolvedValue({ id: 'user-1', username: 'me' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [
        { provide: ProfilesService, useValue: mockService },
        { provide: SUPABASE_CLIENT, useValue: {} },
      ],
    }).compile();

    controller = module.get<ProfilesController>(ProfilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getMyProfile calls service with current user id', async () => {
    const user = { id: 'user-1' } as any;
    const result = await controller.getMyProfile(user);
    expect(mockService.findByUserId).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({ id: 'user-1', username: 'me' });
  });

  it('updateMyProfile calls service with dto', async () => {
    const user = { id: 'user-1' } as any;
    const dto = { username: 'new' } as any;
    const result = await controller.updateMyProfile(user, dto);
    expect(mockService.updateProfile).toHaveBeenCalledWith('user-1', dto);
    expect(result).toEqual({ id: 'user-1', username: 'me' });
  });
});
