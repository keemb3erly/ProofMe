import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Prisma loads its native query engine dynamically. Explicitly trace the
  // Vercel Linux binary so it is bundled with every API route.
  outputFileTracingIncludes: {
    "/api/*": ["./src/generated/prisma/libquery_engine-rhel-openssl-3.0.x.so.node"],
  },
};

export default nextConfig;
