import { getServiceListings } from "@/app/actions/service-listings";
import { serviciosData } from "./sample-data";

export async function ServiceListings({
  page = 1,
  limit = 12,
  category_id,
  subcategory_id,
  city,
  search,
  sort = "newest",
}: {
  page?: number;
  limit?: number;
  category_id?: number;
  subcategory_id?: number;
  city?: string;
  search?: string;
  sort?: "newest" | "oldest" | "price_low" | "price_high" | "popular";
}) {
  try {
    // Fetch real listings from the database
    const { listings, total, totalPages } = await getServiceListings({
      page,
      limit,
      category_id,
      subcategory_id,
      city,
      search,
      sort,
    });

    // Map database listings to AdCard props
    const dbListings = listings.map((listing) => {
      // Get the first image or use a placeholder
      const imageUrl =
        listing.images && listing.images.length > 0
          ? listing.images[0].url
          : "/placeholder.svg?height=300&width=400";

      return {
        id: Number.parseInt(listing.id),
        title: listing.title,
        category: listing.category_id.toString(), // We'll need to map this to a category name in a real implementation
        subcategory: listing.subcategory_id?.toString() || "",
        description: listing.description,
        image: imageUrl,
        badge: listing.is_featured ? "Destacado" : null,
        price: listing.price || "",
        location: listing.city || "Online",
        phone: listing.contact_phone || undefined,
        whatsapp: listing.contact_whatsapp || undefined,
        website: listing.contact_website || undefined,
        email: listing.contact_email || undefined,
        address: listing.address || undefined,
        verified: listing.is_verified,
        isNew:
          new Date(listing.created_at) >
          new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days
        publishedAt: new Date(listing.created_at),
      };
    });

    // Combine database listings with sample data
    // In a production environment, you might want to only show sample data if there are no real listings
    const combinedListings = [...dbListings, ...serviciosData];

    return {
      listings: combinedListings,
      total: total + serviciosData.length,
      totalPages: Math.max(totalPages, Math.ceil(serviciosData.length / limit)),
    };
  } catch (error) {
    console.error("Error fetching service listings:", error);
    // Return only sample data if there's an error
    return {
      listings: serviciosData,
      total: serviciosData.length,
      totalPages: Math.ceil(serviciosData.length / 12),
    };
  }
}
