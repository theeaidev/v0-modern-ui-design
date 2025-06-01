import Link from "next/link"
import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Directorio Latinos</h3>
            <p className="text-sm text-muted-foreground mb-4">
              La plataforma líder para publicar y encontrar anuncios de servicios profesionales.
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon" className="h-8 w-8">
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
                  className="h-4 w-4"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
                <span className="sr-only">Facebook</span>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
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
                  className="h-4 w-4"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
                <span className="sr-only">Instagram</span>
              </Button>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Enlaces</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/servicios" className="text-sm text-muted-foreground hover:text-foreground">
                  Servicios
                </Link>
              </li>
              <li>
                <Link
                  href="/servicios?categoria=Empleo"
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  Empleo
                </Link>
              </li>
              <li>
                <Link href="/tienda" className="text-sm text-muted-foreground hover:text-foreground">
                  Tienda
                </Link>
              </li>
              <li>
                <Link href="/#about" className="text-sm text-muted-foreground hover:text-foreground">
                  Quiénes somos
                </Link>
              </li>
              <li>
                <Link href="/#contact" className="text-sm text-muted-foreground hover:text-foreground">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Publicar anuncio
                </Link>
              </li>
              <li>
                <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                  Iniciar sesión
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-0.5" />
                <span className="text-sm text-muted-foreground">info@directoriolatinos.com</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Planes Premium para Empresas</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Publica más anuncios, aumenta tu visibilidad y llega a más clientes potenciales. Con nuestros planes
              Premium, tu negocio destacará sobre la competencia y atraerá más oportunidades. ¡Haz crecer tu empresa hoy!
            </p>
          </div>
        </div>

        {/* Aviso legal y enlaces */}
        <div className="border-t mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              © {new Date().getFullYear()} Directorios Latinos sl. Todos los derechos reservados.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/politica-de-privacidad" className="text-sm text-muted-foreground hover:text-foreground">
                Política de Privacidad
              </Link>
              <Link href="/politica-de-cookies" className="text-sm text-muted-foreground hover:text-foreground">
                Política de Cookies
              </Link>
              <Link href="/aviso-legal" className="text-sm text-muted-foreground hover:text-foreground">
                Aviso Legal
              </Link>
            </div>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              No somos responsables de los contactos realizados entre usuarios.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
