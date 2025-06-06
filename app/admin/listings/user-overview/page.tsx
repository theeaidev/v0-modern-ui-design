import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Database } from '@/types/supabase'; // Corrected import path for Database type
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { UserProfilesTable, UserProfileDisplayExtended } from './user-profiles-table'; // Import the new table component and type
import { MainNav } from '@/components/main-nav';

async function getProfilesForAdminView(): Promise<UserProfileDisplayExtended[]> {
  const supabase = createServerComponentClient<Database>({ cookies });
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, subscription_tier, payment_status, phone, address, city, postal_code, updated_at');

  if (error) {
    console.error('Error fetching profiles for admin view:', error);
    return [];
  }
  // Ensure the data conforms to UserProfileDisplayExtended
  return data as UserProfileDisplayExtended[];
}

export default async function UserOverviewPage() {
  const profiles = await getProfilesForAdminView();
  const totalUsers = profiles.length;

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
      <MainNav />
      <header className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Resumen y Gestión de Usuarios</h1>
          <Link href="/admin" passHref>
            <Button variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Panel de Administración
            </Button>
          </Link>
        </div>
      </header>

      {/* Dashboard Section */}
      <section aria-labelledby="dashboard-stats-title">
        <Card>
          <CardHeader>
            <CardTitle id="dashboard-stats-title" className="text-xl">Estadísticas del Panel</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg md:text-xl">Total de Usuarios Registrados: <span className="font-semibold text-primary">{totalUsers}</span></p>
          </CardContent>
        </Card>
      </section>

      {/* User Profiles Table Section - Title is now managed within UserProfilesTable component */}
      <UserProfilesTable profiles={profiles} title="Detalles de Usuario por Nivel de Suscripción" />
      
    </div>
  );
}
