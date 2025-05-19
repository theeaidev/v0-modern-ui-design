import { redirect } from "next/navigation"
import { getProfile } from "@/app/actions/profile"
import { ProfileForm } from "@/components/profile-form"
import { MainNav } from "@/components/main-nav"
import { SiteFooter } from "@/components/site-footer"

export default async function ProfilePage() {
  const { profile, error } = await getProfile()

  if (error || !profile) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />

      <main className="flex-1 py-12">
        <div className="container">
          <h1 className="text-3xl font-bold mb-8">Editar perfil</h1>
          <ProfileForm profile={profile} />
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
