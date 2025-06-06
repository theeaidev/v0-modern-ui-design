'use client';

import React, { useState, useMemo } from 'react';
import { Database } from '@/types/supabase'; // Import Database interface
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Extended profile type based on new requirements
// FIXME: types/supabase.ts is missing subscription_tier and payment_status for profiles.
// Regenerate Supabase types. The following is a temporary workaround.
export type UserProfileDisplayExtended = Database['public']['Tables']['profiles']['Row'] & {
  // Manually adding fields that should be in Database['public']['Tables']['profiles']['Row']
  subscription_tier?: string | null; 
  payment_status?: string | null;
  // Ensure all other fields used by the component are included if not in the base Row type
  // For example, if 'avatar_url' was also missing from the base Row but used, add it here.
  // The Pick<> was removed as we are now extending the base Row type and adding missing ones.
  // If you prefer Pick, ensure it includes all necessary fields from the (incomplete) base Row
  // and then add the missing ones like subscription_tier and payment_status.
  // For simplicity here, we extend and add. Review if base Row is very different.
  id: string; // ensure id is present, as it's fundamental
  full_name?: string | null;
  avatar_url?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  postal_code?: string | null;
  updated_at?: string | null;
};

type SortConfig = {
  key: keyof UserProfileDisplayExtended | null;
  direction: 'ascending' | 'descending';
};

interface UserProfilesTableProps {
  profiles: UserProfileDisplayExtended[];
  title: string; // For the main section title
}

const TIER_GROUP_LABELS = {
  PREMIUM_GOLD: 'Premium Gold',
  PREMIUM: 'Premium',
  BASICA: 'Basica',
  SIN_PLAN: 'Sin plan de pago',
  ALL: 'Todos',
} as const;

// Labels for the filter badges, in display order
const filterBadgeLabels: string[] = [
  TIER_GROUP_LABELS.ALL,
  TIER_GROUP_LABELS.SIN_PLAN,
  TIER_GROUP_LABELS.BASICA,
  TIER_GROUP_LABELS.PREMIUM,
  TIER_GROUP_LABELS.PREMIUM_GOLD,
];

// Keys for the user groups in the desired render order for tables
const tableGroupKeysInRenderOrder: string[] = [
  TIER_GROUP_LABELS.PREMIUM_GOLD,
  TIER_GROUP_LABELS.PREMIUM,
  TIER_GROUP_LABELS.BASICA,
  TIER_GROUP_LABELS.SIN_PLAN,
];

const getPaymentStatusDisplay = (status: string | null | undefined): string => {
  if (status === 'validate') return 'Validado';
  if (status === 'pending_validation') return 'Pendiente de Validación';
  return status || 'N/D'; // Fallback for other statuses or if status is an empty string, then N/D
};

const UserTierTable: React.FC<{ 
  tierNameDisplay: string; // e.g., "Usuarios Premium Gold"
  users: UserProfileDisplayExtended[];
  defaultSortKey?: keyof UserProfileDisplayExtended;
}> = ({ tierNameDisplay, users, defaultSortKey = 'payment_status' }) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: defaultSortKey, direction: 'ascending' });

  const sortedUsers = useMemo(() => {
    let sortableItems = [...users];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        if (aValue === null || aValue === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (bValue === null || bValue === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;
        
        // Specific sort for payment_status: pending_validation first
        if (sortConfig.key === 'payment_status') {
          const order = { 'pending_validation': 1, 'validate': 2 }; // Lower number = higher priority
          const aOrder = order[aValue as keyof typeof order] || 3;
          const bOrder = order[bValue as keyof typeof order] || 3;
          if (aOrder < bOrder) return sortConfig.direction === 'ascending' ? -1 : 1;
          if (aOrder > bOrder) return sortConfig.direction === 'ascending' ? 1 : -1;
          return 0;
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [users, sortConfig]);

  const requestSort = (key: keyof UserProfileDisplayExtended) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  if (users.length === 0) {
    return null; // Don't render table if no users for this tier
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl">{tierNameDisplay} ({users.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre Completo</TableHead>
              {/* Teléfono column removed */}
              {/* Ciudad column removed */}
              <TableHead>Tarifa</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => requestSort('payment_status')} className="px-1">
                  Estado de Pago
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                 <Button variant="ghost" onClick={() => requestSort('updated_at')} className="px-1">
                  Fecha de Registro
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.full_name || 'N/D'}</TableCell>
                {/* Phone cell removed */}
                {/* City cell removed */}
                <TableCell>
                  <Badge variant={user.subscription_tier === 'Premium Gold' ? 'default' : user.subscription_tier === 'Premium' ? 'secondary' : user.subscription_tier === 'Basica' ? 'outline' : 'outline' } className="capitalize">
                    {user.subscription_tier || 'Sin Plan'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={user.payment_status === 'pending_validation' ? 'destructive' 
                           : (user.payment_status === 'validate' ? 'default' : 'outline')}
                  >
                    {getPaymentStatusDisplay(user.payment_status)}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(user.updated_at ?? null)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export const UserProfilesTable: React.FC<UserProfilesTableProps> = ({ profiles, title }) => {
  const [selectedTierFilter, setSelectedTierFilter] = useState<string>(TIER_GROUP_LABELS.ALL);
  const [showOnlyPending, setShowOnlyPending] = useState<boolean>(false);

  const groupedProfiles = useMemo(() => {
    // Initialize groups with keys from TIER_GROUP_LABELS (excluding ALL)
    const groups: Record<string, UserProfileDisplayExtended[]> = {
      [TIER_GROUP_LABELS.PREMIUM_GOLD]: [],
      [TIER_GROUP_LABELS.PREMIUM]: [],
      [TIER_GROUP_LABELS.BASICA]: [],
      [TIER_GROUP_LABELS.SIN_PLAN]: [],
    };

    profiles.forEach(profile => {
      if (profile.subscription_tier === 'Premium Gold') {
        groups[TIER_GROUP_LABELS.PREMIUM_GOLD].push(profile);
      } else if (profile.subscription_tier === 'Premium') {
        groups[TIER_GROUP_LABELS.PREMIUM].push(profile);
      } else if (profile.subscription_tier === 'Basica') {
        groups[TIER_GROUP_LABELS.BASICA].push(profile);
      } else { // Null, undefined, or any other tier goes to 'Sin plan de pago'
        groups[TIER_GROUP_LABELS.SIN_PLAN].push(profile);
      }
    });
    return groups;
  }, [profiles]);

  const getTierTableTitle = (tierKeyLabel: string, isFilteredByPending: boolean): string => {
    let tableTitle = `Usuarios ${tierKeyLabel}`;
    if (tierKeyLabel === TIER_GROUP_LABELS.SIN_PLAN) {
      tableTitle = `Usuarios ${TIER_GROUP_LABELS.SIN_PLAN}`;
    }
    // This specific check for ALL is unlikely to be hit if we are generating titles for individual tier tables.
    // However, keeping it for robustness or future use if a single 'All Users' table title is needed.
    else if (tierKeyLabel === TIER_GROUP_LABELS.ALL) {
      tableTitle = 'Todos los Usuarios';
    }

    if (isFilteredByPending) {
      tableTitle += " (Pendientes de Validación)";
    }
    return tableTitle;
  };

  return (
    <section aria-labelledby="user-profiles-table-title">
      <h2 id="user-profiles-table-title" className="text-xl md:text-2xl font-semibold mb-4">{title}</h2>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por Nivel:</span>
        {filterBadgeLabels.map(tierFilterName => (
          <Badge
            key={tierFilterName}
            variant={selectedTierFilter === tierFilterName ? 'default' : 'secondary'}
            onClick={() => setSelectedTierFilter(tierFilterName)}
            className="cursor-pointer px-3 py-1 text-sm"
          >
            {tierFilterName}
          </Badge>
        ))}
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtrar por Estado de Pago:</span>
        <Badge
          variant={showOnlyPending ? 'destructive' : 'outline'}
          onClick={() => setShowOnlyPending(!showOnlyPending)}
          className="cursor-pointer px-3 py-1 text-sm"
        >
          {showOnlyPending ? "Mostrando Solo Pendientes" : "Filtrar Pendientes de Validación"}
        </Badge>
      </div>
      <div className="space-y-6">
        {tableGroupKeysInRenderOrder.map(tierKeyLabel => {
          let usersToDisplay = groupedProfiles[tierKeyLabel] || [];

          if (showOnlyPending) {
            usersToDisplay = usersToDisplay.filter(user => user.payment_status === 'pending_validation');
          }

          if (usersToDisplay.length > 0 && (selectedTierFilter === TIER_GROUP_LABELS.ALL || selectedTierFilter === tierKeyLabel)) {
            return (
              <UserTierTable 
                key={`${tierKeyLabel}${showOnlyPending ? '-pending' : ''}`} // Dynamic key based on filter
                tierNameDisplay={getTierTableTitle(tierKeyLabel, showOnlyPending)} 
                users={usersToDisplay} 
              />
            );
          }
          return null;
        })}
      </div>
    </section>
  );
};
