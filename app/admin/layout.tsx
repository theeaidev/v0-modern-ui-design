import type React from "react"
import { createServerClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

// Prevent prerendering during build
export const dynamic = 'force-dynamic'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()

  // Check if user is logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?redirect=/admin")
  }

  // Check if user is an admin
  const { data: profile, error } = await supabase.from("profiles").select("is_admin").eq("id", session.user.id).single()

  if (error || !profile || !profile.is_admin) {
    redirect("/")
  }

  return <div className="container mx-auto py-6">{children}</div>
}
