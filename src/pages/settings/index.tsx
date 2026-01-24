import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MainLayout } from '../../components/layout'
import { useProfile } from '../../hooks/useProfile'
import {
  ProfileSection,
  PreferencesSection,
  NotificationsSection,
  SecuritySection,
  ChangePasswordModal,
} from '../../components/settings'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  },
}

const Settings: React.FC = () => {
  const { profile, loading, updateProfile, changePassword } = useProfile()
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)

  if (loading && !profile) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-700 border-t-slate-900 dark:border-t-slate-100 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Carregando configurações...
            </p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <motion.div
        className="container max-w-4xl mx-auto px-4 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Configurações
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Gerencie suas preferências e configurações de conta
          </p>
        </motion.div>

        {/* Sections */}
        <motion.div className="space-y-6" variants={itemVariants}>
          <ProfileSection profile={profile} onUpdate={updateProfile} />
          <PreferencesSection profile={profile} onUpdate={updateProfile} />
          <NotificationsSection profile={profile} onUpdate={updateProfile} />
          <SecuritySection
            onChangePassword={() => setIsPasswordModalOpen(true)}
          />
        </motion.div>

        {/* Change Password Modal */}
        <ChangePasswordModal
          isOpen={isPasswordModalOpen}
          onClose={() => setIsPasswordModalOpen(false)}
          onSubmit={changePassword}
        />
      </motion.div>
    </MainLayout>
  )
}

export default Settings

