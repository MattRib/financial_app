import { create } from 'zustand'
import { profilesService } from '../services/profiles'
import type { Profile, UpdateProfileDto, ChangePasswordDto } from '../types'

interface ProfileState {
  profile: Profile | null
  loading: boolean
  error: string | null

  fetchProfile: () => Promise<void>
  updateProfile: (data: UpdateProfileDto) => Promise<void>
  changePassword: (data: ChangePasswordDto) => Promise<void>
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  loading: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null })
    try {
      const profile = await profilesService.getMe()
      set({ profile, loading: false })
    } catch (err) {
      set({ error: String(err), loading: false })
    }
  },

  updateProfile: async (data) => {
    set({ loading: true, error: null })
    try {
      const profile = await profilesService.updateMe(data)
      set({ profile, loading: false })
    } catch (err) {
      set({ error: String(err), loading: false })
      throw err
    }
  },

  changePassword: async (data) => {
    set({ loading: false, error: null })
    try {
      await profilesService.changePassword(data)
      set({ loading: false })
    } catch (err) {
      set({ error: String(err), loading: false })
      throw err
    }
  },
}))
