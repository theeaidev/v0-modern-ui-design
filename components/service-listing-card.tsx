"use client"

import type React from "react"

// IMPORTANT: Ensure NEXT_PUBLIC_SUPABASE_URL is set in your environment variables.
// It should be your Supabase project URL (e.g., https://yourprojectref.supabase.co).
// The 'media' segment is assumed to be your bucket name for service listings.
const SUPABASE_STORAGE_PUBLIC_URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/service-listings` // Assuming 'service-listings' is the correct public bucket name
  : "YOUR_SUPABASE_PROJECT_URL_HERE/storage/v1/object/public/service-listings"; // Fallback: REPLACE THIS
console.log('ServiceListingCard: SUPABASE_STORAGE_PUBLIC_URL_BASE set to:', SUPABASE_STORAGE_PUBLIC_URL_BASE);

// Helper function to strip leading/trailing slashes from a string
function stripSlashes(str: string): string {
  if (!str) return "";
  let s = str;
  // Remove leading slashes
  while (s.startsWith('/')) {
    s = s.substring(1);
  }
  // Remove trailing slashes
  while (s.endsWith('/')) {
    s = s.substring(0, s.length - 1);
  }
  return s;
}

// Helper function to extract filename from a URL
function extractFilename(url: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      // Use URL API for robust parsing if available, otherwise fallback
      const parsedUrl = new URL(url);
      const pathSegments = parsedUrl.pathname.split('/');
      const lastSegment = pathSegments[pathSegments.length - 1];
      // Decode URI component in case filename has encoded characters
      return decodeURIComponent(lastSegment);
    } catch (e) {
      console.warn(`Could not parse URL to extract filename: ${url}`, e);
      // Fallback for basic cases if URL parsing fails (e.g. not a valid full URL but starts with http)
      const parts = url.split('/');
      return parts[parts.length -1];
    }
  }
  return url; // It's already a filename or a non-http path (e.g. blob, data)
}

// Helper function to construct full Supabase URL if needed
function getFullSupabaseUrl(
  fileNameOrFullUrl: string,
  userId: string | undefined,
  listingId: string | undefined,
  itemType: "images" | "videos"
): string {
  if (!fileNameOrFullUrl) return ""; // Handle empty input
  if (fileNameOrFullUrl.startsWith("http://") || fileNameOrFullUrl.startsWith("https://") || fileNameOrFullUrl.startsWith("blob:") || fileNameOrFullUrl.startsWith("data:")) {
    return fileNameOrFullUrl; // Already a full or special URL (e.g., local blob for preview)
  }

  if (!userId || !listingId) {
    console.warn(
      `Cannot construct Supabase URL for '${fileNameOrFullUrl}': userId ('${userId}') or listingId ('${listingId}') is missing.`
    );
    // Return original filename or a placeholder, or empty string depending on desired fallback
    return fileNameOrFullUrl; // Or potentially a placeholder like "/placeholder.svg"
  }

  if (SUPABASE_STORAGE_PUBLIC_URL_BASE.includes("YOUR_SUPABASE_PROJECT_URL_HERE")) {
    console.warn("Supabase project URL is not configured. Please check SUPABASE_STORAGE_PUBLIC_URL_BASE in ServiceListingCard.tsx");
  }

  // Ensure no leading/trailing slashes on components that might have them, then join
  const cleanBase = stripSlashes(SUPABASE_STORAGE_PUBLIC_URL_BASE); // Also apply to base for consistency
  const cleanUserId = stripSlashes(userId);
  const cleanListingId = stripSlashes(listingId);
  const cleanItemType = stripSlashes(itemType);
  const cleanFileName = stripSlashes(fileNameOrFullUrl);

  return `${cleanBase}/${cleanUserId}/${cleanListingId}/${cleanItemType}/${cleanFileName}`;
}

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
  MessageSquare,
  Eye,
  Star,
  MapPin,
  Tag,
  DollarSign,
  Info,
  Video as VideoIconLucide,
  Image as ImageIconLucide,
  ShieldCheck,
  XCircle,
  PlayCircle,
  Maximize,
  Loader2,
  Edit,
  CheckCircle2,
  Clock,
  Pencil // Added Pencil Icon
} from "lucide-react";

// Restoring previously removed imports
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

import supabase from "@/lib/client";
import { toggleFavorite } from "@/app/actions/service-listings";
import { useToast } from "@/hooks/use-toast";
import type { ServiceListing, ServiceImage, Category, Subcategory } from "@/types/service";
import { DeleteServiceButton } from "../components/delete-service-button"; // Added DeleteServiceButton

interface ServiceListingCardProps {
  listing: ServiceListing & {
    images: ServiceImage[];
    category?: Category; // Use full Category type
    subcategory?: Subcategory; // Use full Subcategory type
    isFavorited?: boolean;
    average_rating?: number;
    reviews_count?: number;
    // image_urls and video_urls from ServiceListing are implicitly included via ServiceListing type
  };
  showActions?: boolean;
}

export function ServiceListingCard({ listing, showActions = true }: ServiceListingCardProps): React.ReactNode {
  const { toast } = useToast();
  const router = useRouter();
  const [isFavorited, setIsFavorited] = useState(listing.isFavorited || false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const mediaContainerRef = useRef<HTMLDivElement>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [allMediaItems, setAllMediaItems] = useState<{ type: 'image' | 'video'; url: string }[]>([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isLoadingMedia, setIsLoadingMedia] = useState(true);

  useEffect(() => {
    const fetchMedia = async () => {
      if (!listing.id || !listing.user_id) {
        console.warn(`ServiceListingCard (${listing.id}): Missing user_id or listing.id, skipping media fetch.`);
        setAllMediaItems([]);
        setCurrentMediaIndex(0);
        setIsLoadingMedia(false);
        return;
      }

      console.log(`ServiceListingCard (${listing.id}): Fetching media for user ${listing.user_id}, listing ${listing.id}`);
      setIsLoadingMedia(true);
      // These will temporarily hold URLs before combining them
      let fetchedImageUrls: string[] = [];
      let fetchedVideoUrls: string[] = [];

      try {
        const imagePathPrefix = `${listing.user_id}/${listing.id}/images`;
        const { data: imageFiles, error: imageError } = await supabase.storage
          .from('service-listings')
          .list(imagePathPrefix, { limit: 100, offset: 0, sortBy: { column: 'name', order: 'asc' } });
        console.log(`ServiceListingCard (${listing.id}) - Raw image files from Supabase for path ${imagePathPrefix}:`, imageFiles, 'Error (if any):', imageError);

        if (imageError) {
          console.error(`ServiceListingCard (${listing.id}): Error fetching images from ${imagePathPrefix}:`, imageError.message);
        } else if (imageFiles && imageFiles.length > 0) {
          fetchedImageUrls = imageFiles
            .map(file => getFullSupabaseUrl(file.name, listing.user_id, listing.id, 'images'))
            .filter(url => !!url);
          console.log(`ServiceListingCard (${listing.id}) - Processed image URLs before setting state:`, fetchedImageUrls);
        }

        const videoPathPrefix = `${listing.user_id}/${listing.id}/videos`;
        const { data: videoFiles, error: videoError } = await supabase.storage
          .from('service-listings')
          .list(videoPathPrefix, { limit: 100, offset: 0, sortBy: { column: 'name', order: 'asc' } });
        console.log(`ServiceListingCard (${listing.id}) - Raw video files from Supabase for path ${videoPathPrefix}:`, videoFiles, 'Error (if any):', videoError);

        if (videoError) {
          console.error(`ServiceListingCard (${listing.id}): Error fetching videos from ${videoPathPrefix}:`, videoError.message);
        } else if (videoFiles && videoFiles.length > 0) {
          fetchedVideoUrls = videoFiles
            .map(file => getFullSupabaseUrl(file.name, listing.user_id, listing.id, 'videos'))
            .filter(url => !!url);
          console.log(`ServiceListingCard (${listing.id}) - Processed video URLs before setting state:`, fetchedVideoUrls);
        }
      } catch (error: any) {
        console.error(`ServiceListingCard (${listing.id}): General error during media fetch:`, error.message);
      setAllMediaItems([]); // Clear media on error
      setCurrentMediaIndex(0);
      // setIsLoadingMedia(false) is handled by the finally block
      } finally {
        const newAllItems = [
          ...fetchedImageUrls.map(url => ({ type: 'image' as const, url })),
          ...fetchedVideoUrls.map(url => ({ type: 'video' as const, url }))
        ];
        setAllMediaItems(newAllItems);
        setCurrentMediaIndex(0); // Reset to first item when media changes
        setIsLoadingMedia(false);
        console.log(`ServiceListingCard (${listing.id}) - Fetched Media Results:`, { 
          totalItems: newAllItems.length,
          imageCount: fetchedImageUrls.length, 
          videoCount: fetchedVideoUrls.length, 
          firstImage: fetchedImageUrls[0],
          firstVideo: fetchedVideoUrls[0],
          allItemsList: newAllItems
        });
      }
    };

    fetchMedia();
  }, [listing.id, listing.user_id, supabase]);

  // Derived values from allMediaItems
  const imagesInAllItems = allMediaItems.filter(item => item.type === 'image');
  const videosInAllItems = allMediaItems.filter(item => item.type === 'video');
  const hasImages = imagesInAllItems.length > 0;
  const hasVideos = videosInAllItems.length > 0;
  const mediaCount = allMediaItems.length;
  const currentMediaItem = allMediaItems.length > 0 ? allMediaItems[currentMediaIndex] : null;
  let primaryDisplayImageUrl = "/placeholder.svg?height=300&width=400"; // Default to placeholder
  if (listing.images?.[0]?.url) {
    const firstImageFileNameOrUrl = listing.images[0].url;
    // Check if it's already a full URL (e.g. from an older record that stored full URLs)
    if (firstImageFileNameOrUrl.startsWith("http://") || firstImageFileNameOrUrl.startsWith("https://")) {
      primaryDisplayImageUrl = firstImageFileNameOrUrl;
    } else if (listing.user_id && listing.id) { // Only construct if we have IDs and it's a filename
      primaryDisplayImageUrl = getFullSupabaseUrl(firstImageFileNameOrUrl, listing.user_id, listing.id, 'images');
    }
    // If it's a filename but IDs are missing for construction, it remains placeholderUrl
  }
  // This ensures primaryDisplayImageUrl is either a valid remote URL or the placeholder, never a local category icon path.

  // Debugging final derived media values
  console.log(`ServiceListingCard (${listing.id}) - Final Media Decision:`, {
    isLoadingMedia,
    mediaCount,
    currentMediaIndex,
    currentMediaItemUrl: currentMediaItem?.url,
    allMediaItemsCount: allMediaItems.length,
    derivedHasImages: hasImages,
    derivedHasVideos: hasVideos,
    derivedImageCount: imagesInAllItems.length,
    derivedVideoCount: videosInAllItems.length,
    initialPrimaryImageUrl: primaryDisplayImageUrl, // This is the one from listing.images prop
    allMediaItemsForSlider: allMediaItems // Changed from allMediaUrls
  });

  // Default placeholder if no media
  const placeholderUrl = "/placeholder.svg?height=300&width=400"

  const handleFavoriteToggle = async () => {
    setIsLoadingFavorite(true);
    try {
      const result = await toggleFavorite(listing.id)
      setIsFavorited(result.favorited)

      toast({
        title: result.favorited ? "Añadido a favoritos" : "Eliminado de favoritos",
        description: result.favorited
          ? "Este anuncio ha sido añadido a tus favoritos"
          : "Este anuncio ha sido eliminado de tus favoritos",
        variant: result.favorited ? "default" : "destructive",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Ha ocurrido un error. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoadingFavorite(false)
    }
  }

  // Functions to navigate through all media items
  const goToPrevMediaItem = () => {
    setCurrentMediaIndex(prev => 
      prev === 0 ? Math.max(0, allMediaItems.length - 1) : prev - 1
    );
  };

  const goToNextMediaItem = () => {
    setCurrentMediaIndex(prev => 
      prev === Math.max(0, allMediaItems.length - 1) ? 0 : prev + 1
    );
  };

  return (
    <div className="group h-full overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:shadow-md">
        <div className="relative aspect-[4/3] overflow-hidden" ref={mediaContainerRef}>
          {/* Media Display Logic based on isLoadingMedia and allMediaItems */}
          {isLoadingMedia ? (
            // Show initial primary image (from listing prop) or placeholder while loading
            <div className="relative h-full w-full">
              <div className="absolute top-0 left-0 z-50 bg-black/80 text-white text-xs p-1">
                Loading media... Using initial image if available.
              </div>
              <NextImage
                src={primaryDisplayImageUrl} // This is the one derived from listing.images[0].url or placeholder
                alt={listing.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  console.error(`Failed to load initial primary image: ${primaryDisplayImageUrl}`);
                  (e.target as HTMLImageElement).src = placeholderUrl;
                }}
              />
            </div>
          ) : currentMediaItem ? (
            // Media has loaded, display current item from allMediaItems
            currentMediaItem.type === 'video' ? (
              <div className="relative h-full w-full">
                <div className="absolute top-0 left-0 z-50 bg-black/80 text-white text-xs p-1">
                  Video: {currentMediaItem.url.substring(0, 30)}...
                </div>
                <video
                  key={currentMediaItem.url} // Simpler key, poster removed
                  src={currentMediaItem.url}
                  className="h-full w-full object-cover"
                  controls={false} autoPlay={false} muted loop
                  // poster attribute removed to show browser default for video + overlay icon
                  onError={(e) => {
                    console.error(`Failed to load video: ${(e.currentTarget as HTMLVideoElement).src}`);
                    (e.currentTarget as HTMLVideoElement).style.display = 'none'; 
                    // Consider logic to advance to next media item or show placeholder explicitly
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-background/60 p-3">
                    <VideoIconLucide className="h-8 w-8 text-primary" />
                  </div>
                </div>
              </div>
            ) : ( // type === 'image'
              <div className="relative h-full w-full">
                <div className="absolute top-0 left-0 z-50 bg-black/80 text-white text-xs p-1">
                  Image: {currentMediaItem.url.substring(0, 30)}...
                </div>
                <NextImage
                  src={currentMediaItem.url}
                  alt={listing.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    console.error(`Failed to load image: ${currentMediaItem.url}`);
                    (e.target as HTMLImageElement).src = placeholderUrl;
                     // Consider logic to advance to next media item
                  }}
                />
              </div>
            )
          ) : (
            // Loading finished, but allMediaItems is empty. Fallback to initial primary or placeholder.
            <div className="relative h-full w-full">
              <div className="absolute top-0 left-0 z-50 bg-black/80 text-white text-xs p-1">
                No fetched media. Using initial image if available.
              </div>
              <NextImage
                src={primaryDisplayImageUrl} // This is the one derived from listing.images[0].url or placeholder
                alt={listing.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  (e.target as HTMLImageElement).src = placeholderUrl;
                }}
              />
            </div>
          )}

          {/* Media type indicators */}
          {mediaCount > 0 && (
            <div className="absolute left-2 bottom-2 flex space-x-2">
              {hasImages && (
                <Badge variant="outline" className="bg-background/80 text-foreground">
                  <ImageIconLucide className="mr-1 h-3 w-3" />
                  {imagesInAllItems.length}
                </Badge>
              )}
              {hasVideos && (
                <Badge variant="outline" className="bg-background/80 text-foreground">
                  <VideoIconLucide className="mr-1 h-3 w-3" />
                  {videosInAllItems.length}
                </Badge>
              )}
            </div>
          )}

          {/* Media navigation arrows */}
          {allMediaItems.length > 1 && (
            <>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute left-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-background/60 text-foreground hover:bg-background/80"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goToPrevMediaItem();
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full bg-background/60 text-foreground hover:bg-background/80"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goToNextMediaItem();
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Listing badges */}
          {listing.is_featured && (
            <Badge className="absolute left-2 top-2 bg-primary text-primary-foreground">Destacado</Badge>
          )}

          {listing.price && (
            <div className="absolute bottom-2 right-2 rounded-md bg-background/90 px-2 py-1 text-sm font-medium">
              {listing.price}
            </div>
          )}

          {showActions && (
            <Button
              variant="ghost"
              size="icon"
              className={`absolute right-2 top-2 h-8 w-8 rounded-full bg-background/80 ${
                isFavorited ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-foreground"
              }`}
              onClick={handleFavoriteToggle}
              disabled={isLoadingFavorite}
            >
              {isLoadingFavorite ? <Loader2 className="h-5 w-5 animate-spin" /> : <Heart className={`h-5 w-5 ${isFavorited ? "fill-red-500 text-red-500" : "text-gray-500"}`} />}
              <span className="sr-only">Favorito</span>
            </Button>
          )}
        </div>

        <div className="p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {listing.category && (
                <Badge variant="outline" className="text-xs">
                  {listing.category.name}
                </Badge>
              )}
              {listing.status === "pending_approval" && (
                <Badge variant="outline" className="ml-2 border-yellow-500 text-yellow-600 text-xs">
                  <Clock className="mr-1 h-3 w-3" />
                  Pendiente
                </Badge>
              )}
              {listing.is_verified && (
                <Badge variant="outline" className="border-green-500 text-green-600 text-xs">
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Verificado
                </Badge>
              )}
            </div>

            {listing.average_rating && listing.average_rating > 0 && (
              <div className="flex items-center text-sm">
                <Star className="mr-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span>{listing.average_rating.toFixed(1)}</span>
                {listing.reviews_count && (
                  <span className="ml-1 text-xs text-muted-foreground">({listing.reviews_count})</span>
                )}
              </div>
            )}
          </div>

          <h3 className="mb-1 line-clamp-2 font-semibold">{listing.title}</h3>

          {listing.city && (
            <div className="mb-2 flex items-center text-sm text-muted-foreground">
              <MapPin className="mr-1 h-3 w-3" />
              <span>{listing.city}</span>
            </div>
          )}

          <p className="line-clamp-2 text-sm text-muted-foreground">{listing.description}</p>
          
          <div className="mt-4 flex flex-wrap gap-2 justify-between items-center">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/servicios/${listing.id}/editar`}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Editar
                </Link>
              </Button>
              <DeleteServiceButton serviceId={listing.id} />
            </div>
            <Button variant="default" size="sm" asChild>
              <Link href={`/servicios/${listing.id}`} target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                Ver anuncio
              </Link>
            </Button>
          </div>
        </div>
      </div>
  )
}
