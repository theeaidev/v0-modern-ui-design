import { createServerClient } from "@/lib/supabase-server"

// Prevent prerendering during build
export const dynamic = 'force-dynamic'

export default async function DebugStoragePage() {
  const supabase = await createServerClient()
  
  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const userId = session?.user?.id || 'f90ad218-8ced-4467-bdad-744d2e6ef3c8' // Default to test user ID
  
  // Get all service listings for this user
  const { data: listings } = await supabase
    .from("service_listings")
    .select("id, title, user_id")
    .eq("user_id", userId)
  
  // Check storage for each listing
  const mediaInfo: any[] = []
  
  // Get direct storage contents
  const { data: allStorageFolders } = await supabase.storage.from('service-listings').list()
  
  // Attempt to list files in the user's folder
  const { data: userFolders, error: userFolderError } = 
    await supabase.storage.from('service-listings').list(`${userId}`)

  // Try to get images and videos
  let imageFiles: Array<{ name: string; url: string }> = []
  let videoFiles: Array<{ name: string; url: string }> = []
  
  if (!userFolderError && userFolders) {
    // Check for images folder
    if (userFolders.some(f => f.name === 'images')) {
      const { data: images } = await supabase.storage
        .from('service-listings')
        .list(`${userId}/images`)
      
      if (images && images.length > 0) {
        imageFiles = images.map(file => {
          const { data } = supabase.storage
            .from('service-listings')
            .getPublicUrl(`${userId}/images/${file.name}`)
          return {
            name: file.name,
            url: data.publicUrl
          }
        })
      }
    }
    
    // Check for videos folder
    if (userFolders.some(f => f.name === 'videos')) {
      const { data: videos } = await supabase.storage
        .from('service-listings')
        .list(`${userId}/videos`)
      
      if (videos && videos.length > 0) {
        videoFiles = videos.map(file => {
          const { data } = supabase.storage
            .from('service-listings')
            .getPublicUrl(`${userId}/videos/${file.name}`)
          return {
            name: file.name,
            url: data.publicUrl
          }
        })
      }
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Storage Debugging</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">User Information</h2>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
          {JSON.stringify({
            userId,
            isLoggedIn: !!session,
          }, null, 2)}
        </pre>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Storage Bucket Root</h2>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
          {JSON.stringify(allStorageFolders, null, 2)}
        </pre>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">User Folder Contents</h2>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
          {JSON.stringify({
            folders: userFolders,
            error: userFolderError
          }, null, 2)}
        </pre>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">User Listings</h2>
        <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
          {JSON.stringify(listings, null, 2)}
        </pre>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Media Files Found</h2>
        
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Images ({imageFiles.length})</h3>
          {imageFiles.length === 0 ? (
            <p className="text-red-500">No images found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {imageFiles.map((file: any) => (
                <div key={file.name} className="border rounded-md p-2">
                  <img 
                    src={file.url} 
                    alt={file.name}
                    className="w-full h-48 object-cover mb-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg";
                      target.nextSibling!.textContent = "Failed to load image";
                    }}
                  />
                  <p className="text-sm break-all">{file.name}</p>
                  <p className="text-xs break-all">{file.url}</p>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">Videos ({videoFiles.length})</h3>
          {videoFiles.length === 0 ? (
            <p className="text-red-500">No videos found</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videoFiles.map((file: any) => (
                <div key={file.name} className="border rounded-md p-2">
                  <video 
                    src={file.url}
                    controls
                    className="w-full h-48 object-cover mb-2"
                    onError={(e) => {
                      const target = e.target as HTMLVideoElement;
                      target.style.display = "none";
                      target.nextSibling!.textContent = "Failed to load video";
                    }}
                  />
                  <p className="text-sm break-all">{file.name}</p>
                  <p className="text-xs break-all">{file.url}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-8 bg-blue-50 p-4 rounded-md">
        <h2 className="text-xl font-semibold mb-2">Storage Structure Guide</h2>
        <p className="mb-2">Your media should be stored following this structure:</p>
        <pre className="bg-gray-100 p-4 rounded-md">
{`service-listings/
  └── [user_id]/
      ├── images/
      │   ├── image1.jpg
      │   ├── image2.png
      │   └── ...
      └── videos/
          ├── video1.mp4
          └── ...`}
        </pre>
        <p className="mt-4">If your media files aren't showing up, check:</p>
        <ul className="list-disc pl-5">
          <li>The storage bucket is named 'service-listings'</li>
          <li>Files are in the correct user_id folder</li>
          <li>Images are in the 'images' subfolder</li>
          <li>Videos are in the 'videos' subfolder</li>
          <li>Your RLS policies allow reading these files</li>
        </ul>
      </div>
    </div>
  )
}
