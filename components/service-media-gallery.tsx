"use client"

import React, { useState, useEffect, useRef } from "react";
import NextImage from "next/image";
import { ChevronLeft, ChevronRight, Video as VideoIconLucide, Image as ImageIconLucide, Loader2, Maximize, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import supabase from "@/lib/client";

// IMPORTANT: Ensure NEXT_PUBLIC_SUPABASE_URL is set in your environment variables.
const SUPABASE_STORAGE_PUBLIC_URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/service-listings`
  : "YOUR_SUPABASE_PROJECT_URL_HERE/storage/v1/object/public/service-listings"; // Fallback

function stripSlashes(str: string): string {
  if (!str) return "";
  let s = str;
  while (s.startsWith('/')) s = s.substring(1);
  while (s.endsWith('/')) s = s.substring(0, s.length - 1);
  return s;
}

function getFullSupabaseUrl(
  fileNameOrFullUrl: string,
  userId: string | undefined,
  listingId: string | undefined,
  itemType: "images" | "videos"
): string {
  if (!fileNameOrFullUrl) return "";
  if (fileNameOrFullUrl.startsWith("http://") || fileNameOrFullUrl.startsWith("https://") || fileNameOrFullUrl.startsWith("blob:") || fileNameOrFullUrl.startsWith("data:")) {
    return fileNameOrFullUrl;
  }
  if (!userId || !listingId) {
    console.warn(`Cannot construct Supabase URL for '${fileNameOrFullUrl}': userId or listingId missing.`);
    return fileNameOrFullUrl;
  }
  if (SUPABASE_STORAGE_PUBLIC_URL_BASE.includes("YOUR_SUPABASE_PROJECT_URL_HERE")) {
    console.warn("Supabase project URL not configured.");
  }
  const cleanBase = stripSlashes(SUPABASE_STORAGE_PUBLIC_URL_BASE);
  const cleanUserId = stripSlashes(userId);
  const cleanListingId = stripSlashes(listingId);
  const cleanItemType = stripSlashes(itemType);
  const cleanFileName = stripSlashes(fileNameOrFullUrl);
  return `${cleanBase}/${cleanUserId}/${cleanListingId}/${cleanItemType}/${cleanFileName}`;
}

interface ServiceMediaGalleryProps {
  listingId: string;
  userId: string;
  title: string;
  initialPrimaryImageUrl?: string; // Optional: for immediate display while fetching
  /**
   * Variant for layout: 'main' (large banner, default) or 'card' (compact for card/grid usage)
   */
  variant?: 'main' | 'card';
}

export function ServiceMediaGallery({ listingId, userId, title, initialPrimaryImageUrl, variant = 'main' }: ServiceMediaGalleryProps) {
  const [allMediaItems, setAllMediaItems] = useState<{ type: 'image' | 'video'; url: string }[]>([]);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isLoadingMedia, setIsLoadingMedia] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMedia, setModalMedia] = useState<{ type: 'image' | 'video'; url: string } | null>(null);

  const placeholderUrl = "/placeholder.svg?height=400&width=600";
  const displayInitialImage = initialPrimaryImageUrl || placeholderUrl;

  useEffect(() => {
    const fetchMedia = async () => {
      if (!listingId || !userId) {
        console.warn(`ServiceMediaGallery (${listingId}): Missing userId or listingId, skipping media fetch.`);
        setAllMediaItems([]);
        setCurrentMediaIndex(0);
        setIsLoadingMedia(false);
        return;
      }
      setIsLoadingMedia(true);
      let fetchedImageUrls: string[] = [];
      let fetchedVideoUrls: string[] = [];

      try {
        const imagePathPrefix = `${userId}/${listingId}/images`;
        const { data: imageFiles, error: imageError } = await supabase.storage
          .from('service-listings')
          .list(imagePathPrefix, { limit: 100, offset: 0, sortBy: { column: 'name', order: 'asc' } });
        if (imageError) console.error(`Error fetching images from ${imagePathPrefix}:`, imageError.message);
        else if (imageFiles) fetchedImageUrls = imageFiles.map(file => getFullSupabaseUrl(file.name, userId, listingId, 'images')).filter(url => !!url);

        const videoPathPrefix = `${userId}/${listingId}/videos`;
        const { data: videoFiles, error: videoError } = await supabase.storage
          .from('service-listings')
          .list(videoPathPrefix, { limit: 100, offset: 0, sortBy: { column: 'name', order: 'asc' } });
        if (videoError) console.error(`Error fetching videos from ${videoPathPrefix}:`, videoError.message);
        else if (videoFiles) fetchedVideoUrls = videoFiles.map(file => getFullSupabaseUrl(file.name, userId, listingId, 'videos')).filter(url => !!url);

      } catch (error: any) {
        console.error(`General error during media fetch for listing ${listingId}:`, error.message);
      } finally {
        const newAllItems = [
          ...fetchedImageUrls.map(url => ({ type: 'image' as const, url })),
          ...fetchedVideoUrls.map(url => ({ type: 'video' as const, url }))
        ];
        if (newAllItems.length === 0 && initialPrimaryImageUrl) {
            // If fetch yields nothing but we had an initial image, use that as the sole item.
            newAllItems.push({ type: 'image', url: initialPrimaryImageUrl });
        }
        setAllMediaItems(newAllItems);
        setCurrentMediaIndex(0);
        setIsLoadingMedia(false);
      }
    };
    fetchMedia();
  }, [listingId, userId, initialPrimaryImageUrl]);

  const mediaCount = allMediaItems.length;
  const currentMediaItem = mediaCount > 0 ? allMediaItems[currentMediaIndex] : null;

  const goToPrevMediaItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex(prev => (prev === 0 ? Math.max(0, mediaCount - 1) : prev - 1));
  };

  const goToNextMediaItem = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentMediaIndex(prev => (prev === Math.max(0, mediaCount - 1) ? 0 : prev + 1));
  };

  const openModalWithMedia = (item: { type: 'image' | 'video'; url: string }) => {
    setModalMedia(item);
    setIsModalOpen(true);
  };

  if (isLoadingMedia && !initialPrimaryImageUrl) {
    return (
      <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] flex items-center justify-center bg-muted">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // Determine what to display: fetched media, initial image, or placeholder
  let imageToDisplay = placeholderUrl;
  let itemToDisplay = currentMediaItem;

  if (!isLoadingMedia && currentMediaItem) {
    // Fetched media is available
    imageToDisplay = currentMediaItem.type === 'image' ? currentMediaItem.url : placeholderUrl; // Video will use its own src
  } else if (isLoadingMedia && initialPrimaryImageUrl) {
    // Loading, but have an initial image to show
    imageToDisplay = initialPrimaryImageUrl;
    itemToDisplay = { type: 'image', url: initialPrimaryImageUrl }; // Treat initial as the item for now
  } else if (!isLoadingMedia && !currentMediaItem && initialPrimaryImageUrl) {
    // Not loading, no fetched media, but had an initial image
    imageToDisplay = initialPrimaryImageUrl;
    itemToDisplay = { type: 'image', url: initialPrimaryImageUrl };
  } else if (!isLoadingMedia && !currentMediaItem && !initialPrimaryImageUrl) {
    // Not loading, no fetched media, no initial image - use placeholder
    itemToDisplay = { type: 'image', url: placeholderUrl };
    imageToDisplay = placeholderUrl;
  }

  // Responsive container classes depending on variant
  const containerClassName =
    variant === 'card'
      ? 'relative w-full aspect-[4/3] h-auto rounded-md overflow-hidden group bg-muted shadow-sm'
      : 'relative w-full h-[220px] sm:h-[280px] md:h-[360px] lg:h-[480px] xl:h-[540px] max-h-[70vw] rounded-lg overflow-hidden group bg-muted shadow-sm';

  return (
    <div className={containerClassName}>

      {itemToDisplay ? (
        itemToDisplay.type === 'video' ? (
          <div
            className="relative h-full w-full cursor-pointer"
            onClick={() => openModalWithMedia(itemToDisplay!)}
          >
            <video
              key={itemToDisplay.url}
              src={itemToDisplay.url}
              className={variant === 'card' ? 'h-full w-full object-cover rounded-md' : 'h-full w-full object-cover rounded-md sm:rounded-lg'}
              controls={false}
              autoPlay={false}
              muted
              loop
              style={{ pointerEvents: 'auto' }}
              onError={(e) => {
                console.error(`Failed to load video: ${(e.currentTarget as HTMLVideoElement).src}`);
                (e.currentTarget as HTMLVideoElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors pointer-events-none">
              <PlayCircle className="h-14 w-14 sm:h-16 sm:w-16 text-white/80 group-hover:text-white" />
            </div>
          </div>
        ) : (
          <div
            className="relative h-full w-full cursor-pointer"
            onClick={() => openModalWithMedia(itemToDisplay!)}
          >
            <NextImage
              src={imageToDisplay}
              alt={title}
              fill
              className={
                variant === 'card'
                  ? 'object-cover rounded-md transition-transform duration-300 group-hover:scale-105'
                  : 'object-cover rounded-md sm:rounded-lg transition-transform duration-300 group-hover:scale-105'
              }
              priority
              sizes={variant === 'card' ? '(max-width: 640px) 100vw, 400px' : '(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 60vw'}
              style={{ pointerEvents: 'auto' }}
              onError={(e) => {
                console.error(`Failed to load image: ${imageToDisplay}`);
                (e.target as HTMLImageElement).src = placeholderUrl;
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none">
              <Maximize className="h-10 w-10 sm:h-12 sm:w-12 text-white/70 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        )
      ) : (
         <NextImage src={placeholderUrl} alt="Placeholder" fill className={variant === 'card' ? 'object-cover rounded-md' : 'object-cover rounded-md sm:rounded-lg'} />
      )}

      {mediaCount > 1 && (
        <>
          {/* Navigation Buttons */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-1 sm:left-2 top-1/2 h-8 w-8 sm:h-10 sm:w-10 -translate-y-1/2 rounded-full bg-black/40 text-white hover:bg-black/60 hover:text-white z-10 focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={goToPrevMediaItem}
            tabIndex={0}
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 sm:right-2 top-1/2 h-8 w-8 sm:h-10 sm:w-10 -translate-y-1/2 rounded-full bg-black/40 text-white hover:bg-black/60 hover:text-white z-10 focus:outline-none focus:ring-2 focus:ring-primary"
            onClick={goToNextMediaItem}
            tabIndex={0}
            aria-label="Siguiente"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
          {/* Dot Indicators */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex space-x-2 sm:space-x-1.5">
            {allMediaItems.map((_, index) => (
              <button
                key={index}
                onClick={(e) => { e.stopPropagation(); setCurrentMediaIndex(index); }}
                className={`h-3 w-3 sm:h-2 sm:w-2 rounded-full border border-white/60 focus:outline-none focus:ring-2 focus:ring-primary ${currentMediaIndex === index ? 'bg-white' : 'bg-white/50 hover:bg-white/75'}`}
                aria-label={`Go to media ${index + 1}`}
                tabIndex={0}
              />
            ))}
          </div>
        </>
      )}
      
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[96vw] sm:max-w-2xl md:max-w-3xl p-0 bg-black border-0 rounded-lg overflow-hidden flex items-center justify-center">
          {modalMedia && (
            modalMedia.type === 'video' ? (
              <video
                src={modalMedia.url}
                className="w-full max-h-[80vh] object-contain bg-black"
                controls
                autoPlay
                style={{ borderRadius: '0.5rem' }}
              />
            ) : (
              <NextImage
                src={modalMedia.url}
                alt={title}
                width={1920}
                height={1080}
                className="w-full max-h-[80vh] object-contain bg-black rounded-lg"
                style={{ borderRadius: '0.5rem' }}
                sizes="(max-width: 640px) 96vw, (max-width: 1024px) 80vw, 60vw"
              />
            )
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}
