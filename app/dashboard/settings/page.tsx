'use client'

import React from 'react'
import { useAuth } from '@/lib/auth/AuthContext'
import ClinicSettingsForm from '@/components/admin/ClinicSettingsForm'

export default function SettingsPage() {
  const { user, loading } = useAuth()
  
  if (loading) return null
  if (!user) return null

  return (
      <div className="max-w-3xl relative pb-24">
         <ClinicSettingsForm clinicId={user.uid} />
      </div>
  )
}