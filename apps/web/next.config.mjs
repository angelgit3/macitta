/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ["@maccita/shared"],
    experimental: {
        // reactCompiler: true,
    },
};

export default nextConfig;
