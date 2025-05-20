import { MainNav } from "@/components/main-nav";
import { ServiceListingForm } from "@/components/service-listing-form";
import { SiteFooter } from "@/components/site-footer";

export default function NewServiceListingPage() {
  return (
    <div className="space-y-6">
      <MainNav />
      <div>
        <h1 className="text-2xl font-bold">Crear nuevo anuncio</h1>
        <p className="text-muted-foreground">
          Completa el formulario para publicar un nuevo anuncio en el
          directorio.
        </p>
      </div>

      <ServiceListingForm mode="create" />
      <SiteFooter />
    </div>
  );
}
