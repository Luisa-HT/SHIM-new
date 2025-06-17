// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    // Add images domain if you plan to use external image hosts with Next.js Image component
    // images: {
    //     domains: ['example.com'],
    // },
    async rewrites() {
        return [
            {
                // Proxy API requests to the ASP.NET Core backend during development
                // This assumes your ASP.NET Core backend runs on HTTPS port defined by ASPNETCORE_HTTPS_PORT
                // or HTTP port 5000/5001 if not HTTPS.
                // You might need to adjust the target based on your backend's actual URL.
                source: '/api/:path*',
                destination: `${process.env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${process.env.ASPNETCORE_HTTPS_PORT}` : 'http://localhost:5000'}/api/:path*`,
            },
            // Add other backend-related paths if your backend serves them directly
            {
                source: '/_configuration/:path*',
                destination: `${process.env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${process.env.ASPNETCORE_HTTPS_PORT}` : 'http://localhost:5000'}/_configuration/:path*`,
            },
            {
                source: '/.well-known/:path*',
                destination: `${process.env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${process.env.ASPNETCORE_HTTPS_PORT}` : 'http://localhost:5000'}/.well-known/:path*`,
            },
            {
                source: '/Identity/:path*',
                destination: `${process.env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${process.env.ASPNETCORE_HTTPS_PORT}` : 'http://localhost:5000'}/Identity/:path*`,
            },
            {
                source: '/connect/:path*',
                destination: `${process.env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${process.env.ASPNETCORE_HTTPS_PORT}` : 'http://localhost:5000'}/connect/:path*`,
            },
            {
                source: '/_framework/:path*',
                destination: `${process.env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${process.env.ASPNETCORE_HTTPS_PORT}` : 'http://localhost:5000'}/_framework/:path*`,
            },
            {
                source: '/_vs/browserLink/:path*',
                destination: `${process.env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${process.env.ASPNETCORE_HTTPS_PORT}` : 'http://localhost:5000'}/_vs/browserLink/:path*`,
            },
            {
                source: '/_host/:path*',
                destination: `${process.env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${process.env.ASPNETCORE_HTTPS_PORT}` : 'http://localhost:5000'}/_host/:path*`,
            },
            {
                source: '/WeatherForecast/:path*', // Example endpoint from default template, remove if not needed
                destination: `${process.env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${process.env.ASPNETCORE_HTTPS_PORT}` : 'http://localhost:5000'}/WeatherForecast/:path*`,
            },
        ];
    },
};

module.exports = nextConfig;