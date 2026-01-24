import { useEffect } from 'react'
import { useProfileStore } from '../store/profileStore'

export function useProfile() {
  const { profile, loading, error, fetchProfile, updateProfile, changePassword } =
    useProfileStore()

  useEffect(() => {
    if (!profile && !loading) {
      fetchProfile()
    }
  }, [profile, loading, fetchProfile])

  return {
    profile,
    loading,
    error,
    updateProfile,
    changePassword,
    refetch: fetchProfile,
  }
}
