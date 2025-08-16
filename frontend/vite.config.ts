import { defineConfig } from 'vite'
import { createHtmlPlugin } from 'vite-plugin-html'
import autoprefixer from 'autoprefixer'

export default defineConfig({
    plugins: [
        createHtmlPlugin({
            minify: {
                collapseWhitespace: true,
                removeComments: true,
                removeRedundantAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                useShortDoctype: true,
                minifyCSS: true,
                minifyJS: true
            }
        })
    ],
    server: {
        host: '0.0.0.0',
        port: 8301,
        strictPort: true,
        proxy: {
            "/api": {
                target: "http://127.0.0.1:8300/",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, "")
            }
        },
    },
    appType: "mpa",
    css: {
        postcss: {
            plugins: [autoprefixer()],
        },
    },
    build: {
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        },
        rollupOptions: {
            external: [
                /^webfonts/
            ]
        },
        cssMinify: true
    }
})