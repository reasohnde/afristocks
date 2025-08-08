/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Permet de build même avec des erreurs ESLint
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Permet de build même avec des erreurs TypeScript
        ignoreBuildErrors: true,
    },
}

module.exports = nextConfig 