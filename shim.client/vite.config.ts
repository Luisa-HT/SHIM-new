import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import { env } from 'process';

const baseFolder =
    env.APPDATA !== undefined && env.APPDATA !== ''
        ? `${env.APPDATA}/ASP.NET/https`
        : `${env.HOME}/.aspnet/https`;

const certificateName = "shim.client";
const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

if (!fs.existsSync(baseFolder)) {
    fs.mkdirSync(baseFolder, { recursive: true });
}

if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
    if (0 !== child_process.spawnSync('dotnet', [
        'dev-certs',
        'https',
        '--export-path',
        certFilePath,
        '--format',
        'Pem',
        '--no-password',
    ], { stdio: 'inherit', }).status) {
        throw new Error("Could not create certificate.");
    }
}

const target = env.ASPNETCORE_HTTPS_PORT ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}` :
    env.ASPNETCORE_URLS ? env.ASPNETCORE_URLS.split(';')[0] : 'https://localhost:7052';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        proxy: {
            '/api': {
                target: target, // The URL of your ASP.NET Core backend
                changeOrigin: true, // Needed for virtual hosted sites
                secure: false, // Set to true for production if using valid HTTPS certs, false for self-signed dev certs
                // rewrite: (path) => path.replace(/^\/api/, '/api'), // Optional: if your backend API base path differs
            },
            '/_configuration': {
                target: target,
                changeOrigin: true,
                secure: false,
            },
            '/.well-known': {
                target: target,
                changeOrigin: true,
                secure: false,
            },
            '/Identity': {
                target: target,
                changeOrigin: true,
                secure: false,
            },
            '/connect': {
                target: target,
                changeOrigin: true,
                secure: false,
            },
            '/_framework': {
                target: target,
                changeOrigin: true,
                secure: false,
            },
            '/_vs/browserLink': {
                target: target,
                changeOrigin: true,
                secure: false,
            },
            '/_host': {
                target: target,
                changeOrigin: true,
                secure: false,
            },
        },
        port: parseInt(env.DEV_SERVER_PORT || '50323'),
        https: {
            key: fs.readFileSync(keyFilePath),
            cert: fs.readFileSync(certFilePath),
        }
    },
    css: {
        preprocessorOptions: {
            less: {
                math: "always",
                relativeUrls: true,
                javascriptEnabled: true
            },
        },
    }
})
