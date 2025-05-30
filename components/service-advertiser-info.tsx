"use client"

import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ServiceAdvertiserProps {
  advertiser: {
    name: string;
    imagePath: string;
    memberSince: string; // This should be the formatted date string or a raw date string
    verified: boolean;
    otherAds: number;
    email?: string;
    // created_at is not directly used for display here, memberSince covers the join date
  };
}

export function ServiceAdvertiserInfo({ advertiser }: ServiceAdvertiserProps) {
  // advertiser.name should be pre-populated with full_name or a fallback by the parent component
  const displayName = advertiser.name || (advertiser.email ? advertiser.email.split("@")[0] : "Usuario");
  
  // Format date safely just like in dashboard
  // formatDate can be a utility function if needed elsewhere, or kept here if specific
  const formatDate = (timestamp: string) => {
    if (!timestamp) return "Fecha desconocida";

    try {
      const date = new Date(timestamp);
      return new Intl.DateTimeFormat("es-ES", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
    } catch (error) {
      return "Fecha desconocida";
    }
  };
  
  // Get user initials for avatar fallback, matching dashboard logic
  const getUserInitials = () => {
    // Use the already determined displayName
    if (displayName && displayName !== "Usuario") {
      return displayName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    
    if (advertiser.email) {
      return advertiser.email.charAt(0).toUpperCase();
    }
    
    return "U";
  };
  
  return (
    <div className="flex flex-col md:flex-row gap-6 items-start">
      <div className="flex-shrink-0">
        <Avatar className="h-20 w-20 md:h-24 md:w-24">
          <AvatarImage
            src={advertiser.imagePath || "/placeholder.svg"}
            alt={displayName}
          />
          <AvatarFallback className="text-2xl">{getUserInitials()}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1">
        <h3 className="text-xl font-bold">
          {displayName}
        </h3>
        <div className="flex items-center mt-2 flex-wrap">
          {advertiser.verified && (
            <Badge variant="outline" className="border-green-500 text-green-500 flex items-center gap-1 mr-3 mb-1 sm:mb-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5"><polyline points="20 6 9 17 4 12" /></svg>
              Verificado
            </Badge>
          )}
          <span className="text-sm text-muted-foreground mb-1 sm:mb-0">
            Miembro desde {advertiser.memberSince ? formatDate(advertiser.memberSince) : "Fecha desconocida"}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
{/*           <div>
            <p className="text-sm text-muted-foreground">Otros anuncios</p>
            <p className="font-medium">{advertiser.otherAds} anuncios activos</p>
          </div> */}
        </div>
      </div>
    </div>
  )
}
