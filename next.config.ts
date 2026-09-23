import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'i.ibb.co' }],
  },
  async headers() {
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'no-referrer' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
      {
        key: 'Content-Security-Policy',
        value: [
          "default-src 'self'",
          process.env.NODE_ENV === 'production'
            ? "script-src 'self' 'unsafe-inline'"
            : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: blob: https://i.ibb.co",
          "font-src 'self'",
          "connect-src 'self'",
          "object-src 'none'",
          "base-uri 'self'",
          "frame-ancestors 'none'",
          "form-action 'self'",
        ].join('; '),
      },
    ];

    if (process.env.NODE_ENV === 'production') {
      securityHeaders.push({
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains',
      });
    }

    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default nextConfig;
