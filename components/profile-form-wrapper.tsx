"use client"

import { useState } from "react"
import { ProfileForm } from "./profile-form"
import { updateProfileData } from "@/app/actions/profile-actions"

interface ProfileFormWrapperProps {
  initialProfile: any
  userId: string
}

export function ProfileFormWrapper({ initialProfile, userId }: ProfileFormWrapperProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (formData: any) => {
    try {
      setIsSubmitting(true)
      setError(null)
      setSuccess(false)

      const result = await updateProfileData(userId, formData)

      if (!result.success) {
        setError(result.error || "Error al actualizar el perfil")
        return
      }

      setSuccess(true)
      // Optionally refresh the page or update the UI
    } catch (err) {
      console.error("Error submitting profile:", err)
      setError("Error inesperado al actualizar el perfil")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-6">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-6">
          <p>Perfil actualizado correctamente</p>
        </div>
      )}

      <ProfileForm profile={initialProfile} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
    </div>
  )
}
