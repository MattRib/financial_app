import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesService } from './profiles.service';
import { SUPABASE_CLIENT } from '../../config/supabase.module';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let mockSupabase: Record<string, jest.Mock>;

  beforeEach(async () => {
    mockSupabase = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn(),
      upsert: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        { provide: SUPABASE_CLIENT, useValue: mockSupabase },
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findById returns profile when found', async () => {
    const profile = { id: 'user-1', username: 'me' };
    mockSupabase.single.mockResolvedValue({ data: profile, error: null });

    const result = await service.findById('user-1');

    expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    expect(mockSupabase.eq).toHaveBeenCalledWith('id', 'user-1');
    expect(result).toEqual(profile);
  });

  it('updateProfile upserts and returns updated profile', async () => {
    const dto = { username: 'new' };
    mockSupabase.upsert.mockResolvedValue({ data: [], error: null });
    mockSupabase.single.mockResolvedValue({
      data: { id: 'user-1', username: 'new' },
      error: null,
    });

    const result = await service.updateProfile('user-1', dto);

    expect(mockSupabase.upsert).toHaveBeenCalled();
    expect(result.username).toBe('new');
  });
});
