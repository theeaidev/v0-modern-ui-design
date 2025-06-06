/** @type {import('next').NextConfig} */
const nextConfig = {
  // --- Configurations you initially provided (generally NOT recommended for production) ---

  // eslint: {
  //   // `ignoreDuringBuilds: true` is set here.
  //   // For production, this is NOT recommended. ESLint helps catch code quality issues,
  //   // potential bugs, and enforces consistent style. Ignoring it during builds means
  //   // these issues will go undetected and could be deployed to production.
  //   // In an optimized production setup, you want ESLint to run and report errors,
  //   // ideally preventing the build if critical issues are found.
  //   ignoreDuringBuilds: true,
  // },

  // typescript: {
  //   // `ignoreBuildErrors: true` is set here.
  //   // For production, this is NOT recommended. TypeScript provides type safety,
  //   // which significantly reduces runtime errors and improves code reliability.
  //   // Ignoring build errors means your production application could be deployed
  //   // with type-related issues that might cause unexpected behavior or crashes.
  //   // In an optimized production setup, TypeScript errors should always halt the build,
  //   // ensuring a type-safe and robust application.
  //   ignoreBuildErrors: true,
  // },

  // images: {
  //   // `unoptimized: true` is set here.
  //   // For production, this is NOT recommended. Next.js's Image Optimization
  //   // (when unoptimized is false or omitted, which is the default) automatically
  //   // resizes, optimizes, and serves images in modern formats (like WebP) based on the user's browser
  //   // and device. This significantly improves load times and performance.
  //   // Setting `unoptimized: true` disables all these performance benefits,
  //   // leading to larger image files and slower page loads for your users.
  //   unoptimized: true,
  // },

  // --- Optimized configurations for production ---

  // Images configuration:
  // Since you're using Supabase Storage buckets, you'll need to tell Next.js
  // that images can be loaded from your Supabase bucket's domain.
  // Replace `YOUR_SUPABASE_PROJECT_REF` and `YOUR_REGION` with your actual Supabase details.
  // You can find this in your Supabase project settings under 'Storage' -> 'URL'.
  // The hostname typically looks like `project-ref.supabase.co` or `project-ref.supabase.co/storage/v1/object/public`
  // It's safer to specify the full hostname or use `remotePatterns` for more flexibility.
  images: {
    // It's best practice to explicitly allow external domains for images.
    // Ensure this matches your Supabase Storage URL.
    // Example: https://<project-ref>.supabase.co/storage/v1/object/public/
    remotePatterns: [
      {
        protocol: 'https',
        // Make sure to use your actual Supabase project reference and region if applicable.
        // The hostname will be something like `project-ref.supabase.co`
        // or more specifically `project-ref.supabase.co` or `project-ref.supabase.in` etc.
        // Double-check your bucket's public URL for the exact hostname.
        hostname: 'emjvoktifutvnvrbuoln.supabase.co', // This wildcard covers `project-ref.supabase.co`
        pathname: '/storage/v1/object/public/**', // This ensures it's specifically for public objects
      },
      // If you have a custom domain for your Supabase Storage, add it here:
      // {
      //   protocol: 'https',
      //   hostname: 'your-custom-domain.com',
      // },
      {
        protocol: 'https',
  
        hostname: 'images.unsplash.com',
        pathname: '/**', 
      },
      {
        protocol: 'https',
  
        hostname: 'sazonytumbao.com',
        pathname: '/**', 
      }
    ],
  },

  // Other common production optimizations/configurations (optional, uncomment and configure as needed):

  // output: 'standalone', // Enables standalone output for Docker deployments. Recommended for serverless/container environments.

  // experimental: {
  //   // serverActions: true, // Enable Server Actions if you are using them.
  //   // This is stable as of Next.js 14, so you might not need it for recent versions.
  //   // If you are on an older version where it was experimental, enable it here.
  // },

  // webpack: (config, { isServer }) => {
  //   // You can extend webpack configuration here for advanced use cases
  //   // (e.g., adding specific loaders or plugins not covered by Next.js defaults).
  //   return config;
  // },
};

export default nextConfig;