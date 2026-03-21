/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },

  // ── Environment variables exposed to the browser (NEXT_PUBLIC_*) ──────────
  // Server-side vars (ADMIN_PRIVATE_KEY etc.) are NOT listed here intentionally.
  env: {
    NEXT_PUBLIC_POLYGON_RPC_URL:    process.env.NEXT_PUBLIC_POLYGON_RPC_URL    ?? 'https://rpc-amoy.polygon.technology',
    NEXT_PUBLIC_CONTRACT_ADDRESS:   process.env.NEXT_PUBLIC_CONTRACT_ADDRESS   ?? '0xA3D7B89A83a6a5B6956194b510AB1b591A916920',
    NEXT_PUBLIC_CHAIN_ID:           '80002',
    NEXT_PUBLIC_CHAIN_NAME:         'Polygon Amoy',
    NEXT_PUBLIC_EXPLORER_URL:       'https://amoy.polygonscan.com',
  },

  // ── Rewrites: proxy AI service calls through Next.js (avoids CORS) ────────
  async rewrites() {
    const biobertUrl  = process.env.BIOBERT_SERVICE_URL  ?? process.env.BACKEND_URL ?? 'http://localhost:8200';
    const medgemmaUrl = process.env.MEDGEMMA_SERVICE_URL ?? 'http://localhost:8100';

    return [
      {
        source:      '/biobert/:path*',
        destination: `${biobertUrl}/:path*`,
      },
      {
        source:      '/medgemma/:path*',
        destination: `${medgemmaUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
