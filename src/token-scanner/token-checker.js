
const https = require('https');
const http = require('http');

class BotTokenChecker {
    constructor(proxy = null) {
        this.proxy = proxy;
        this.baseUrl = 'https://api.telegram.org/bot';
    }

    async makeRequest(url) {
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

            const client = urlObj.protocol === 'https:' ? https : http;

            const req = client.request(url, options, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    try {
                        const json = JSON.parse(data);
                        resolve({ statusCode: res.statusCode, data: json });
                    } catch (e) {
                        resolve({ statusCode: res.statusCode, data: { ok: false, error: 'Invalid JSON' } });
                    }
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

    async checkToken(token) {
        const result = {
            token,
            valid: false,
            checkedAt: new Date().toISOString(),
            getMe: null,
            getWebhookInfo: null,
            getMyCommands: null,
            error: null
        };

        try {
            const meUrl = `${this.baseUrl}${token}/getMe`;
            const meResponse = await this.makeRequest(meUrl);

            if (!meResponse.data.ok) {
                result.error = meResponse.data.description || 'Unknown error';
                return result;
            }

            result.getMe = meResponse.data;
            result.valid = true;

            try {
                const webhookUrl = `${this.baseUrl}${token}/getWebhookInfo`;
                const webhookResponse = await this.makeRequest(webhookUrl);
                if (webhookResponse.data.ok) {
                    result.getWebhookInfo = webhookResponse.data;
                }
            } catch (e) {
            }

            try {
                const commandsUrl = `${this.baseUrl}${token}/getMyCommands`;
                const commandsResponse = await this.makeRequest(commandsUrl);
                if (commandsResponse.data.ok) {
                    result.getMyCommands = commandsResponse.data;
                }
            } catch (e) {
            }

            return result;

        } catch (error) {
            result.error = error.message;
            return result;
        }
    }

    async quickCheck(token) {
        try {
            const meUrl = `${this.baseUrl}${token}/getMe`;
            const meResponse = await this.makeRequest(meUrl);
            return meResponse.data.ok === true;
        } catch (error) {
            return false;
        }
    }
}

module.exports = { BotTokenChecker };