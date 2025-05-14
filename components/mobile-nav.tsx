"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"

interface MobileNavProps {
  currentPath?: string
}

export function MobileNav({ currentPath = "" }: MobileNavProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className="md:hidden" aria-label="Abrir menú">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <line x1="4" x2="20" y1="12" y2="12" />
            <line x1="4" x2="20" y1="6" y2="6" />
            <line x1="4" x2="20" y1="18" y2="18" />
          </svg>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px]">
        <SheetHeader className="mb-6">
          <SheetTitle>
            <div className="flex items-center gap-2">
              <Image src="/placeholder.svg?height=32&width=32" alt="Logo" width={32} height={32} />
              <span className="text-xl font-bold">ServiciosDirectorio</span>
            </div>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-4">
          <SheetClose asChild>
            <Link
              href="/"
              className={`flex items-center py-2 px-3 rounded-md hover:bg-muted ${
                currentPath === "/" ? "font-medium text-primary" : ""
              }`}
            >
              Inicio
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              href="/servicios"
              className={`flex items-center py-2 px-3 rounded-md hover:bg-muted ${
                currentPath === "/servicios" ? "font-medium text-primary" : ""
              }`}
            >
              Servicios
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link href="/tienda" className="flex items-center py-2 px-3 rounded-md hover:bg-muted">
              Tienda
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              href="/#about"
              className="flex items-center py-2 px-3 rounded-md hover:bg-muted"
              onClick={() => {
                // Cerrar el menú y desplazarse a la sección correspondiente
                if (currentPath === "/") {
                  setTimeout(() => {
                    document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })
                  }, 100)
                }
              }}
            >
              Quiénes somos
            </Link>
          </SheetClose>
          <SheetClose asChild>
            <Link
              href="/#contact"
              className="flex items-center py-2 px-3 rounded-md hover:bg-muted"
              onClick={() => {
                // Cerrar el menú y desplazarse a la sección correspondiente
                if (currentPath === "/") {
                  setTimeout(() => {
                    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
                  }, 100)
                }
              }}
            >
              Contacto
            </Link>
          </SheetClose>
          <Separator className="my-2" />
          <SheetClose asChild>
            <Button variant="outline" className="justify-start" asChild>
              <Link href="#">Iniciar sesión</Link>
            </Button>
          </SheetClose>
          <SheetClose asChild>
            <Button className="gap-2 mt-2" asChild>
              <Link href="#">
                <PlusCircle className="h-4 w-4" />
                Publicar anuncio gratis
              </Link>
            </Button>
          </SheetClose>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
