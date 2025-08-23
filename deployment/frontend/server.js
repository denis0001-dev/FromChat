// server.js
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
const backendHost = process.env.BACKEND_HOST || "http://localhost:8300";
const file_path = process.env.STATIC_FILE_PATH || ".";

app.use('/api', createProxyMiddleware({
    target: backendHost,
    changeOrigin: true,
    pathRewrite: { '^/api': '' },
    ws: true
}));

app.use(express.static(path.resolve(file_path)));

app.listen(port, () => {
    console.log(`Server launched на http://localhost:${port}`);
});