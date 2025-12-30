const https = require('https');
const http = require('http');
const { SocksProxyAgent } = require('socks-proxy-agent');

function makeRequest(url, proxy = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const options = {
            hostname: urlObj.hostname,
            path: urlObj.pathname,
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 10000
        };

        if (proxy) {
            if (proxy.type === 'socks5') {
                const proxyUrl = proxy.auth
                    ? `socks5://${proxy.auth.username}:${proxy.auth.password}@${proxy.host}:${proxy.port}`
                    : `socks5://${proxy.host}:${proxy.port}`;
                options.agent = new SocksProxyAgent(proxyUrl);
            } else if (proxy.type === 'http') {
                options.agent = new http.Agent({
                    proxy: {
                        host: proxy.host,
                        port: proxy.port,
                        auth: proxy.auth ? `${proxy.auth.username}:${proxy.auth.password}` : undefined
                    }
                });
            }
        }

        const client = urlObj.protocol === 'https:' ? https : http;

        const req = client.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({ statusCode: res.statusCode, data });
            });
        });

        req.on('error', reject);
        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Timeout'));
        });

        req.end();
    });
}

module.exports = { makeRequest };