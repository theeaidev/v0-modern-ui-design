"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation"
import Link from "next/link"
import { User, LogOut, Settings, PlusCircle, Heart } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context";
import { getProfileData } from "../app/actions/profile-actions";
import type { Database } from "../types/supabase";

// Define Profile type
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function UserDropdown() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<Profile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (user?.id) {
        setIsLoadingProfile(true);
        try {
          const { profile, error } = await getProfileData(user.id);
          if (error) {
            console.error("[UserDropdown] Error fetching profile data:", error);
            setProfileData(null);
          } else {
            setProfileData(profile);
          }
        } catch (e) {
          console.error("[UserDropdown] Unexpected error fetching profile:", e);
          setProfileData(null);
        } finally {
          setIsLoadingProfile(false);
        }
      } else {
        setProfileData(null);
        setIsLoadingProfile(false);
      }
    }

    fetchProfile();
  }, [user?.id]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  const getUserInitials = () => {
    const nameForInitials = profileData?.full_name || user?.user_metadata?.full_name;
    if (nameForInitials) {
      return nameForInitials
        .split(" ")
        .filter(n => n)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const displayName = isLoadingProfile 
    ? "Cargando..." 
    : profileData?.full_name || user?.user_metadata?.full_name || "Sin nombre";

  const avatarSrc = profileData?.avatar_url || user?.user_metadata?.avatar_url || "/placeholder.svg";
  const avatarAlt = profileData?.full_name || user?.user_metadata?.full_name || "User";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarSrc} alt={avatarAlt} />
            <AvatarFallback>{getUserInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="flex items-center cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Mi perfil</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/servicios" className="flex items-center cursor-pointer">
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>Mis anuncios</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/dashboard" className="flex items-center cursor-pointer">
              <Heart className="mr-2 h-4 w-4" />
              <span>Favoritos</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
