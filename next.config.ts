import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Утаснаас гэрийн Wi-Fi-аар (192.168.x.x) dev сервер рүү хандахыг зөвшөөрнө.
  allowedDevOrigins: ["192.168.*.*"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
