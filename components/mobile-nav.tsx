"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Menu, X, PlusCircle, Briefcase } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

interface MobileNavProps {
  currentPath: string
}

export function MobileNav({ currentPath }: MobileNavProps) {
  const { user, signOut } = useAuth()
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  return (
    <div className="md:hidden">
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Abrir menú</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-white/95 backdrop-blur-sm border-r border-gray-200 p-0 w-[85%] sm:max-w-md">
          <div className="flex flex-col h-full">
            <SheetHeader className="border-b border-gray-100 p-4">
              <div className="flex items-center gap-2">
                <Image src="/logo.png" alt="Directorio Latinos Logo" width={40} height={40} className="rounded-sm" />
                <div className="flex flex-col">
                  <SheetTitle className="text-xl font-bold text-left">Directorio Local Mieres</SheetTitle>
                  {/* <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-xs font-medium text-gray-500">de</span>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-red-500/10 to-yellow-500/10 border border-red-200/50 shadow-sm">
                      <span className="text-[10px] uppercase tracking-wide font-semibold text-red-700">España</span>
                      <div className="w-5 h-3.5 overflow-hidden rounded-sm shadow-sm">
                        <img src="https://flagcdn.com/es.svg" alt="Bandera de España" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div> */}
                </div>
              </div>
            </SheetHeader>
            
            <div className="px-6 py-6 flex-1 overflow-y-auto filter-scrollbar">
              <nav className="flex flex-col space-y-5">
              <Link
                href="/"
                className={`text-lg font-medium ${
                  currentPath === "/" ? "text-emerald-400" : "text-gray-800 hover:text-emerald-400"
                }`}
                onClick={() => setIsSheetOpen(false)}
              >
                Inicio
              </Link>
              <Link
                href="/servicios"
                className={`text-lg font-medium ${
                  currentPath === "/servicios" ? "text-emerald-400" : "text-gray-800 hover:text-emerald-400"
                }`}
                onClick={() => setIsSheetOpen(false)}
              >
                Negocios Locales
              </Link>
              <Link
                href="/servicios?categoria=Empleo"
                className={`text-lg font-medium relative group flex items-center gap-1 ${
                  currentPath.includes("categoria=Empleo") ? "text-emerald-400" : "text-gray-800 hover:text-emerald-400"
                }`}
                onClick={() => setIsSheetOpen(false)}
              ><Briefcase className="h-4 w-4" />
                Empleo
                <span
                  className={`absolute -bottom-1 left-0 h-0.5 bg-emerald-400 transition-all duration-300 ${
                    currentPath.includes("categoria=Empleo") ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                ></span>
              </Link>
{/*               <Link
                href="/tienda"
                className={`text-lg font-medium ${
                  currentPath === "/tienda" ? "text-emerald-400" : "text-gray-800 hover:text-emerald-400"
                }`}
                onClick={() => setIsSheetOpen(false)}
              >
                Precios
              </Link> */}
              <Link
                href="/#about"
                className={`text-lg font-medium ${
                  currentPath === "/#about" ? "text-emerald-400" : "text-gray-800 hover:text-emerald-400"
                }`}
                onClick={() => setIsSheetOpen(false)}
              >
                Quiénes somos
              </Link>
              <Link
                href="/#contact"
                className={`text-lg font-medium ${
                  currentPath === "/#contact" ? "text-emerald-400" : "text-gray-800 hover:text-emerald-400"
                }`}
                onClick={() => setIsSheetOpen(false)}
               
              >
                Contacto
              </Link>

              {user ? (
                <>
                  <div className="border-t border-gray-100 my-4 pt-4"></div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 flex items-center justify-center text-white font-medium">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <p className="text-sm font-medium">{user.email}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full inline-block"></span>
                        Cuenta verificada
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/dashboard"
                    className="text-lg font-medium text-gray-800 hover:text-emerald-400 transition-colors duration-200"
                    onClick={() => setIsSheetOpen(false)}
                  >
                    Mi perfil
                  </Link>
                  <Link
                    href="/dashboard/servicios"
                    className="text-lg font-medium text-gray-800 hover:text-emerald-400 transition-colors duration-200"
                    onClick={() => setIsSheetOpen(false)}
                    >
                    Mis anuncios
                  </Link>
                  <Link
                    href="/dashboard"
                    className="text-lg font-medium text-gray-800 hover:text-emerald-400 transition-colors duration-200"
                    onClick={() => setIsSheetOpen(false)}
                  >
                    Favoritos
                  </Link>
                  <Button
                    variant="outline"
                    className="w-full justify-center border-gray-300 text-gray-800 mt-4 hover:bg-gray-50"
                    onClick={() => signOut()}
                  >
                    Cerrar sesión
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  className="w-full justify-center border-gray-300 text-gray-800 hover:bg-gray-50"
                  asChild
                >
                  <Link href="/login">Iniciar sesión</Link>
                </Button>
              )}

              <Button
                className="w-full justify-center gap-2 bg-emerald-400 hover:bg-emerald-500 text-white mt-2 shadow-sm"
                asChild
              >
                <Link href={user ? "/dashboard/publicar" : "/login"}>
                  <PlusCircle className="h-4 w-4" />
                  Publicar anuncio gratis
                </Link>
              </Button>
            </nav>
            </div>
            
            <div className="mt-auto p-4 border-t border-gray-100 bg-gray-50/50">
              <div className="text-xs text-gray-500 text-center">
                © {new Date().getFullYear()} Directorio Latinos
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
