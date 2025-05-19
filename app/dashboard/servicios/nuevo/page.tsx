import { ServiceListingForm } from "@/components/service-listing-form"

export default function NewServiceListingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Crear nuevo anuncio</h1>
        <p className="text-muted-foreground">Completa el formulario para publicar un nuevo anuncio en el directorio.</p>
      </div>

      <ServiceListingForm mode="create" />
    </div>
  )
}
