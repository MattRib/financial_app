import { api } from './api'
import type { Profile, UpdateProfileDto, ChangePasswordDto } from '../types'

export const profilesService = {
  getMe: () => api.get<Profile>('/profiles/me'),

  updateMe: (data: UpdateProfileDto) => api.patch<Profile>('/profiles/me', data),

  changePassword: (data: ChangePasswordDto) =>
    api.post<{ message: string }>('/profiles/me/change-password', data),
}
