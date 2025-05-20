import { MainNav } from "@/components/main-nav";
import { SiteFooter } from "@/components/site-footer";
import { Skeleton } from "@/components/ui/skeleton";

export default function ServiceListingsLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <MainNav />

      <main className="flex-1">
        {/* Page Header */}
        <div className="bg-muted/30 border-b">
          <div className="container py-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Servicios</h1>
            <p className="text-muted-foreground max-w-3xl">
              Encuentra servicios latinos, oportunidades de empleo, formación y
              productos filtrando por ciudad y categoría.
            </p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="border-b sticky top-16 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container py-4">
            <div className="flex flex-col md:flex-row gap-4">
              <Skeleton className="h-10 flex-1" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-24 md:hidden" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Desktop Sidebar Filters */}
            <div className="hidden md:block w-64 shrink-0">
              <div className="sticky top-36">
                <div className="space-y-6">
                  <Skeleton className="h-64 w-full" />
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="flex-1">
              {/* Results Count and Sort */}
              <div className="flex justify-between items-center mb-6">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-9 w-48" />
              </div>

              {/* Results Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-96 w-full rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <SiteFooter />
    </div>
  );
}
