/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        port: "",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "cms.openbook.gamesundefined",
        port: "",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "wallpapers.com",
        port: "",
      },
       {
        protocol: "https",
        hostname: "cms.openbook.games",
        port: "",
      },
      
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "aiad.s3.amazonaws.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
        port:""
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "oaidalleapiprodscus.blob.core.windows.net",
        port: "",
      },
      {
        protocol: "https",
        hostname: "api.krakengames.quest",
        port: "",
      },
      {
        protocol: "https",
        hostname: "qa.api.krakengames.quest",
        port: "",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
      }
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config) => {
    // Add rule for GLSL shader files
    config.module.rules.push({
      test: /\.(vert|frag|glsl)$/,
      type: 'asset/source',
    });
    
    return config;
  },
};

export default nextConfig;
