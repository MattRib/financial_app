import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { SUPABASE_CLIENT } from '../../config/supabase.module';
import type { User } from '@supabase/supabase-js';

describe('ProfilesController', () => {
  let controller: ProfilesController;
  let mockService: Record<string, jest.Mock>;

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
    const user = { id: 'user-1' } as User;
    const result = await controller.getMyProfile(user);
    expect(mockService.findByUserId).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({ id: 'user-1', username: 'me' });
  });

  it('updateMyProfile calls service with dto', async () => {
    const user = { id: 'user-1' } as User;
    const dto = { username: 'new' };
    const result = await controller.updateMyProfile(user, dto);
    expect(mockService.updateProfile).toHaveBeenCalledWith('user-1', dto);
    expect(result).toEqual({ id: 'user-1', username: 'me' });
  });
});
