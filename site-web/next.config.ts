import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["172.20.10.3"],

  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "vully-veterinaire.ch" }],
        destination: "https://xn--vully-vtrinaire-hnbb.ch/:path*",
        statusCode: 301,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.vully-veterinaire.ch" }],
        destination: "https://xn--vully-vtrinaire-hnbb.ch/:path*",
        statusCode: 301,
      },
    ];
  },
};

export default nextConfig;
