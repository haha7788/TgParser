const https = require('https');
const http = require('http');
const fs = require('fs');
const readline = require('readline');
const { SocksProxyAgent } = require('socks-proxy-agent');

const CONFIG = {
    useProxy: false,
    proxyList: [], // [{type: 'socks5'|'http', host: '', port: 0, auth: {username: '', password: ''}}]
    concurrentRequests: 3,

    // Limits for all variants (null = infinitely)
    variant1Limit: null,
    variant2Limit: null,
    variant3Limit: null,

    variant1StartFrom: null, // or {length: 4, current: 'aaaa'}
    variant2StartFrom: null, // or {current: 'aaaaaaaaaaaaaaaa'} (16 symbols)
    variant3StartFrom: null, // or {current: 'aaaaaaaaaaaaaaaa'} (16 symbols)
    outputDir: './results'
};

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    magenta: '\x1b[35m',
    white: '\x1b[37m',
    bgGreen: '\x1b[42m',
    bgRed: '\x1b[41m',
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m'
};

const stats = {
    variant1: {
        found: 0,
        attempts: 0,
        errors: 0,
        current: '',
        lastFound: null,
        recentAttempts: [],
        startTime: Date.now()
    },
    variant2: {
        found: 0,
        attempts: 0,
        errors: 0,
        current: '',
        lastFound: null,
        recentAttempts: [],
        startTime: Date.now()
    },
    variant3: {
        found: 0,
        attempts: 0,
        errors: 0,
        current: '',
        lastFound: null,
        recentAttempts: [],
        startTime: Date.now()
    }
};

const results = {
    variant1: { startTime: new Date().toISOString(), links: [] },
    variant2: { startTime: new Date().toISOString(), links: [] },
    variant3: { startTime: new Date().toISOString(), links: [] }
};

const recentLogs = [];
const MAX_LOGS = 8;

class Variant1Generator {
    constructor(startLength = 4, startValue = null) {
        this.chars = 'abcdefghijklmnopqrstuvwxyz0123456789_';
        this.length = startLength;
        this.current = startValue ? startValue.split('') : new Array(startLength).fill('a');
    }

    next() {
        const result = this.current.join('');

        let i = this.current.length - 1;
        while (i >= 0) {
            const charIndex = this.chars.indexOf(this.current[i]);
            if (charIndex < this.chars.length - 1) {
                this.current[i] = this.chars[charIndex + 1];
                break;
            } else {
                this.current[i] = this.chars[0];
                i--;
            }
        }

        if (i < 0) {
            this.length++;
            this.current = new Array(this.length).fill('a');
        }

        return result;
    }
}

class Variant2Generator {
    constructor(startValue = null) {
        this.chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-';
        this.current = startValue ? startValue.split('') : new Array(16).fill('a');
    }

    next() {
        const result = this.current.join('');

        let i = 15;
        while (i >= 0) {
            const charIndex = this.chars.indexOf(this.current[i]);
            if (charIndex < this.chars.length - 1) {
                this.current[i] = this.chars[charIndex + 1];
                break;
            } else {
                this.current[i] = this.chars[0];
                i--;
            }
        }

        return result;
    }
}

class Variant3Generator {
    constructor(startValue = null) {
        this.chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-';
        this.current = startValue ? startValue.split('') : new Array(16).fill('a');
    }

    next() {
        const result = this.current.join('');

        let i = 15;
        while (i >= 0) {
            const charIndex = this.chars.indexOf(this.current[i]);
            if (charIndex < this.chars.length - 1) {
                this.current[i] = this.chars[charIndex + 1];
                break;
            } else {
                this.current[i] = this.chars[0];
                i--;
            }
        }

        return result;
    }
}

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

function addLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString('ru-RU');
    const log = { timestamp, message, type };
    recentLogs.push(log);
    if (recentLogs.length > MAX_LOGS) {
        recentLogs.shift();
    }
}

async function checkLink(url, variant, attemptNumber, proxy = null) {
    try {
        stats[variant].recentAttempts.push(Date.now());

        const response = await makeRequest(url, proxy);
        const data = response.data;

        let isValidChat = false;

        if (variant === 'variant1') {
            if (data.includes('If you have Telegram, you can view posts by')) {
                isValidChat = true;
                addLog(`✓ Вариант 1 - найден канал: ${url}`, 'success');
            } else if (data.includes('View in Telegram') && data.includes('Preview channel')) {
                isValidChat = true;
                addLog(`✓ Вариант 1 - найден канал (View in Telegram): ${url}`, 'success');
            } else if (data.includes('If you have Telegram, you can contact')) {
                addLog(`○ Вариант 1 - личный аккаунт (пропуск): ${url}`, 'check');
                isValidChat = false;
            } else {
                addLog(`○ Вариант 1 - не подходит: ${url}`, 'check');
                isValidChat = false;
            }
        }

        else if (variant === 'variant2') {
            if (data.includes('You are invited to a group chat on Telegram. Click to join')) {
                addLog(`✗ Вариант 2 - закрытая группа (блок): ${url}`, 'check');
                isValidChat = false;
            }
            else if (data.includes('You are invited to the group') && data.includes('Click above to join')) {
                isValidChat = true;
                addLog(`✓ Вариант 2 - найдена открытая группа: ${url}`, 'success');
            } else {
                addLog(`○ Вариант 2 - не подходит: ${url}`, 'check');
                isValidChat = false;
            }
        }

        else if (variant === 'variant3') {
            if (
                (data.includes('You are invited to the channel') && data.includes('Click above to join')) ||
                (data.includes('You are invited to the group') && data.includes('Click above to join'))
            ) {
                isValidChat = true;
                addLog(`✓ Вариант 3 - найден чат (канал или группа): ${url}`, 'success');
            } else if (data.includes('You are invited to a group chat on Telegram. Click to join')) {
                addLog(`✗ Вариант 3 - группа, не канал (пропуск): ${url}`, 'check');
                isValidChat = false;
            } else {
                addLog(`○ Вариант 3 - не подходит: ${url}`, 'check');
                isValidChat = false;
            }
        }

        if (isValidChat) {
            const foundTime = new Date().toISOString();
            const result = {
                url,
                attempts: attemptNumber,
                foundAt: foundTime
            };

            results[variant].links.push(result);
            stats[variant].found++;
            stats[variant].lastFound = url;

            addLog(`🎉 НАЙДЕН РАБОЧИЙ ЧАТ/КАНАЛ: ${url}`, 'success');

            saveResults(variant);
            return true;
        }

        return false;
    } catch (error) {
        stats[variant].errors++;
        addLog(`✗ Ошибка при проверке ${url}: ${error.message}`, 'error');
        return false;
    }
}

function saveResults(variant) {
    if (!fs.existsSync(CONFIG.outputDir)) {
        fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    const filename = `${CONFIG.outputDir}/${variant}.json`;
    fs.writeFileSync(filename, JSON.stringify(results[variant], null, 2));
}

function saveProgress(generator, variant) {
    const progress = {
        length: generator.length,
        current: generator.current.join('')
    };
    fs.writeFileSync(`${CONFIG.outputDir}/${variant}_progress.json`, JSON.stringify(progress, null, 2));
}

function loadProgress(variant) {
    const filename = `${CONFIG.outputDir}/${variant}_progress.json`;
    if (fs.existsSync(filename)) {
        try {
            const data = fs.readFileSync(filename, 'utf8');
            return JSON.parse(data);
        } catch (e) {
            return null;
        }
    }
    return null;
}

function calculateSpeed(variant) {
    const now = Date.now();
    const timeWindow = 30000;

    stats[variant].recentAttempts = stats[variant].recentAttempts.filter(
        timestamp => now - timestamp < timeWindow
    );

    if (stats[variant].recentAttempts.length === 0) return 0;

    const oldestTimestamp = stats[variant].recentAttempts[0];
    const timeSpan = (now - oldestTimestamp) / 1000;

    if (timeSpan === 0) return 0;

    return (stats[variant].recentAttempts.length / timeSpan).toFixed(1);
}

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}ч ${minutes % 60}м`;
    if (minutes > 0) return `${minutes}м ${seconds % 60}с`;
    return `${seconds}с`;
}

function getProgressBar(current, total, width = 30) {
    if (!total) return `[${'━'.repeat(width)}]`;

    const percentage = Math.min(100, (current / total) * 100);
    const filled = Math.floor((percentage / 100) * width);
    const empty = width - filled;

    return `[${colors.green}${'█'.repeat(filled)}${colors.dim}${'░'.repeat(empty)}${colors.reset}] ${percentage.toFixed(1)}%`;
}

function displayStats() {
    console.clear();

    const totalFound = stats.variant1.found + stats.variant2.found + stats.variant3.found;
    const totalAttempts = stats.variant1.attempts + stats.variant2.attempts + stats.variant3.attempts;
    const totalErrors = stats.variant1.errors + stats.variant2.errors + stats.variant3.errors;
    const uptime = Date.now() - Math.min(stats.variant1.startTime, stats.variant2.startTime, stats.variant3.startTime);

    console.log(`${colors.bright}${colors.bgMagenta}${colors.white}                                                                                  ${colors.reset}`);
    console.log(`${colors.bright}${colors.bgMagenta}${colors.white}                                🚀 ParseGram 🚀                                   ${colors.reset}`);
    console.log(`${colors.bright}${colors.bgMagenta}${colors.white}                                                                                  ${colors.reset}`);
    console.log();

    console.log(`${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}║${colors.reset}  ${colors.bright}ОБЩАЯ СТАТИСТИКА${colors.reset}                                                              ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}╠════════════════════════════════════════════════════════════════════════════════╣${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}  ${colors.green}✓ Найдено чатов:${colors.reset} ${colors.bright}${totalFound}${colors.reset}  │  ${colors.yellow}⚡ Попыток:${colors.reset} ${colors.bright}${totalAttempts}${colors.reset}  │  ${colors.red}✗ Ошибок:${colors.reset} ${colors.bright}${totalErrors}${colors.reset}           ${colors.cyan}${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}  ${colors.blue}⏱ Время работы:${colors.reset} ${colors.bright}${formatTime(uptime)}${colors.reset}                                                  ${colors.cyan}${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}  ${colors.magenta}🌐 Прокси:${colors.reset} ${CONFIG.useProxy ? colors.green + 'Включены' : colors.red + 'Выключены'}${colors.reset}  │  ${colors.cyan}🔄 Потоков:${colors.reset} ${colors.bright}${CONFIG.concurrentRequests}${colors.reset}                       ${colors.cyan}${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}╚════════════════════════════════════════════════════════════════════════════════╝${colors.reset}`);
    console.log();

    const v1Progress = CONFIG.variant1Limit ? getProgressBar(stats.variant1.attempts, CONFIG.variant1Limit) : '∞';
    const v1Speed = calculateSpeed('variant1');
    console.log(`${colors.bright}${colors.blue}╔════════════════════════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}║${colors.reset}  ${colors.bright}ВАРИАНТ 1${colors.reset} ${colors.dim}(t.me/username)${colors.reset}                                                     ${colors.blue}║${colors.reset}`);
    console.log(`${colors.bright}${colors.blue}╠════════════════════════════════════════════════════════════════════════════════╣${colors.reset}`);
    console.log(`${colors.blue}║${colors.reset}  ${colors.green}Найдено:${colors.reset} ${colors.bright}${stats.variant1.found}${colors.reset}  │  ${colors.yellow}Попыток:${colors.reset} ${colors.bright}${stats.variant1.attempts}${colors.reset}  │  ${colors.red}Ошибок:${colors.reset} ${colors.bright}${stats.variant1.errors}${colors.reset}                   ${colors.blue}${colors.reset}`);
    console.log(`${colors.blue}║${colors.reset}  ${colors.cyan}Скорость:${colors.reset} ${colors.bright}${v1Speed} req/s${colors.reset}                                                   ${colors.blue}${colors.reset}`);
    console.log(`${colors.blue}║${colors.reset}  ${colors.magenta}Текущая:${colors.reset} ${colors.bright}${stats.variant1.current}${colors.reset}                                                     ${colors.blue}${colors.reset}`);
    console.log(`${colors.blue}║${colors.reset}  ${colors.yellow}Прогресс:${colors.reset} ${v1Progress}${colors.reset}                                                                              ${colors.blue}${colors.reset}`);
    if (stats.variant1.lastFound) {
        console.log(`${colors.blue}║${colors.reset}  ${colors.green}Последний:${colors.reset} ${colors.bright}${stats.variant1.lastFound}${colors.reset}                                        ${colors.blue}${colors.reset}`);
    }
    console.log(`${colors.bright}${colors.blue}╚════════════════════════════════════════════════════════════════════════════════╝${colors.reset}`);
    console.log();

    const v2Progress = CONFIG.variant2Limit ? getProgressBar(stats.variant2.attempts, CONFIG.variant2Limit) : '∞';
    const v2Speed = calculateSpeed('variant2');
    console.log(`${colors.bright}${colors.yellow}╔════════════════════════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bright}${colors.yellow}║${colors.reset}  ${colors.bright}ВАРИАНТ 2${colors.reset} ${colors.dim}(t.me/joinchat/...)${colors.reset}                                                 ${colors.yellow}║${colors.reset}`);
    console.log(`${colors.bright}${colors.yellow}╠════════════════════════════════════════════════════════════════════════════════╣${colors.reset}`);
    console.log(`${colors.yellow}║${colors.reset}  ${colors.green}Найдено:${colors.reset} ${colors.bright}${stats.variant2.found}${colors.reset}  │  ${colors.yellow}Попыток:${colors.reset} ${colors.bright}${stats.variant2.attempts}${colors.reset}  │  ${colors.red}Ошибок:${colors.reset} ${colors.bright}${stats.variant2.errors}${colors.reset}                   ${colors.yellow}${colors.reset}`);
    console.log(`${colors.yellow}║${colors.reset}  ${colors.cyan}Скорость:${colors.reset} ${colors.bright}${v2Speed} req/s${colors.reset}                                                   ${colors.yellow}${colors.reset}`);
    console.log(`${colors.yellow}║${colors.reset}  ${colors.magenta}Текущая:${colors.reset} ${colors.bright}${stats.variant2.current}${colors.reset}                                    ${colors.yellow}${colors.reset}`);
    console.log(`${colors.yellow}║${colors.reset}  ${colors.yellow}Прогресс:${colors.reset} ${v2Progress}${colors.reset}                                                                              ${colors.yellow}${colors.reset}`);
    if (stats.variant2.lastFound) {
        console.log(`${colors.yellow}║${colors.reset}  ${colors.green}Последний:${colors.reset} ${colors.bright}${stats.variant2.lastFound}${colors.reset}                       ${colors.yellow}${colors.reset}`);
    }
    console.log(`${colors.bright}${colors.yellow}╚════════════════════════════════════════════════════════════════════════════════╝${colors.reset}`);
    console.log();

    const v3Progress = CONFIG.variant3Limit ? getProgressBar(stats.variant3.attempts, CONFIG.variant3Limit) : '∞';
    const v3Speed = calculateSpeed('variant3');
    console.log(`${colors.bright}${colors.magenta}╔════════════════════════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bright}${colors.magenta}║${colors.reset}  ${colors.bright}ВАРИАНТ 3${colors.reset} ${colors.dim}(t.me/+...)${colors.reset}                                                         ${colors.magenta}║${colors.reset}`);
    console.log(`${colors.bright}${colors.magenta}╠════════════════════════════════════════════════════════════════════════════════╣${colors.reset}`);
    console.log(`${colors.magenta}║${colors.reset}  ${colors.green}Найдено:${colors.reset} ${colors.bright}${stats.variant3.found}${colors.reset}  │  ${colors.yellow}Попыток:${colors.reset} ${colors.bright}${stats.variant3.attempts}${colors.reset}  │  ${colors.red}Ошибок:${colors.reset} ${colors.bright}${stats.variant3.errors}${colors.reset}                   ${colors.magenta}${colors.reset}`);
    console.log(`${colors.magenta}║${colors.reset}  ${colors.cyan}Скорость:${colors.reset} ${colors.bright}${v3Speed} req/s${colors.reset}                                                   ${colors.magenta}${colors.reset}`);
    console.log(`${colors.magenta}║${colors.reset}  ${colors.magenta}Текущая:${colors.reset} ${colors.bright}${stats.variant3.current}${colors.reset}                                    ${colors.magenta}${colors.reset}`);
    console.log(`${colors.magenta}║${colors.reset}  ${colors.yellow}Прогресс:${colors.reset} ${v3Progress}${colors.reset}                                                                              ${colors.magenta}${colors.reset}`);
    if (stats.variant3.lastFound) {
        console.log(`${colors.magenta}║${colors.reset}  ${colors.green}Последний:${colors.reset} ${colors.bright}${stats.variant3.lastFound}${colors.reset}                            ${colors.magenta}${colors.reset}`);
    }
    console.log(`${colors.bright}${colors.magenta}╚════════════════════════════════════════════════════════════════════════════════╝${colors.reset}`);
    console.log();

    console.log(`${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}║${colors.reset}  ${colors.bright}ПОСЛЕДНИЕ ДЕЙСТВИЯ${colors.reset}                                                            ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}╠════════════════════════════════════════════════════════════════════════════════╣${colors.reset}`);

    if (recentLogs.length === 0) {
        console.log(`${colors.cyan}║${colors.reset}  ${colors.dim}Ожидание логов...${colors.reset}                                                              ${colors.cyan}${colors.reset}`);
    } else {
        recentLogs.slice(-MAX_LOGS).forEach(log => {
            let icon = '•';
            let color = colors.white;

            if (log.type === 'success') {
                icon = '✓';
                color = colors.green;
            } else if (log.type === 'error') {
                icon = '✗';
                color = colors.red;
            } else if (log.type === 'check') {
                icon = '○';
                color = colors.dim;
            }

            const msg = log.message.length > 65 ? log.message.substring(0, 62) + '...' : log.message;
            const padding = ' '.repeat(Math.max(0, 70 - msg.length));
            console.log(`${colors.cyan}║${colors.reset}  ${color}${icon} [${log.timestamp}] ${msg}${colors.reset}${padding}${colors.cyan}${colors.reset}`);
        });
    }

    console.log(`${colors.bright}${colors.cyan}╚════════════════════════════════════════════════════════════════════════════════╝${colors.reset}`);
    console.log();
}

async function worker(generator, variant, workerId) {
    const proxy = CONFIG.useProxy && CONFIG.proxyList.length > 0
        ? CONFIG.proxyList[workerId % CONFIG.proxyList.length]
        : null;

    const limit = CONFIG[`${variant}Limit`];

    while (true) {
        if (limit && stats[variant].attempts >= limit) {
            break;
        }

        const value = generator.next();
        stats[variant].current = value;

        let url;
        if (variant === 'variant1') {
            url = `https://t.me/${value}`;
        } else if (variant === 'variant2') {
            url = `https://t.me/joinchat/${value}`;
        } else {
            url = `https://t.me/+${value}`;
        }

        stats[variant].attempts++;
        await checkLink(url, variant, stats[variant].attempts, proxy);

        if (variant === 'variant1' && stats[variant].attempts % 100 === 0) {
            saveProgress(generator, variant);
        } else if (variant !== 'variant1' && stats[variant].attempts % 50 === 0) {
            saveProgress(generator, variant);
        }

        if (stats[variant].attempts % 5 === 0) {
            displayStats();
        }
    }
}

function detectLinkType(url) {
    if (url.includes('t.me/joinchat/')) {
        return { type: 'variant2', value: url.split('t.me/joinchat/')[1] };
    } else if (url.includes('t.me/+')) {
        return { type: 'variant3', value: url.split('t.me/+')[1] };
    } else if (url.includes('t.me/')) {
        return { type: 'variant1', value: url.split('t.me/')[1] };
    }
    return null;
}

async function testSingleLink(url) {
    console.clear();
    console.log(`${colors.bright}${colors.bgCyan}${colors.white}                                                                                ${colors.reset}`);
    console.log(`${colors.bright}${colors.bgCyan}${colors.white}                        🔍 ТЕСТИРОВАНИЕ ССЫЛКИ 🔍                                ${colors.reset}`);
    console.log(`${colors.bright}${colors.bgCyan}${colors.white}                                                                                ${colors.reset}`);
    console.log();

    const linkInfo = detectLinkType(url);

    if (!linkInfo) {
        console.log(`${colors.red}${colors.bright}✗ Неверный формат ссылки!${colors.reset}`);
        console.log(`${colors.yellow}Поддерживаемые форматы:${colors.reset}`);
        console.log(`  • https://t.me/username`);
        console.log(`  • https://t.me/joinchat/xxxxx`);
        console.log(`  • https://t.me/+xxxxx`);
        console.log();
        return;
    }

    console.log(`${colors.cyan}📎 URL:${colors.reset} ${colors.bright}${url}${colors.reset}`);
    console.log(`${colors.cyan}🔖 Тип:${colors.reset} ${colors.bright}${linkInfo.type === 'variant1' ? 'Username' : linkInfo.type === 'variant2' ? 'JoinChat' : 'Hash (+)'}${colors.reset}`);
    console.log(`${colors.cyan}💾 Значение:${colors.reset} ${colors.bright}${linkInfo.value}${colors.reset}`);
    console.log();
    console.log(`${colors.yellow}⏳ Отправка запроса...${colors.reset}`);

    try {
        const proxy = CONFIG.useProxy && CONFIG.proxyList.length > 0 ? CONFIG.proxyList[0] : null;
        const response = await makeRequest(url, proxy);

        console.log(`${colors.green}✓ Ответ получен!${colors.reset}`);
        console.log();
        console.log(`${colors.bright}${colors.magenta}╔════════════════════════════════════════════════════════════════════════════════╗${colors.reset}`);
        console.log(`${colors.bright}${colors.magenta}║${colors.reset}  ${colors.bright}АНАЛИЗ ОТВЕТА${colors.reset}                                                                 ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.bright}${colors.magenta}╠════════════════════════════════════════════════════════════════════════════════╣${colors.reset}`);
        console.log(`${colors.magenta}║${colors.reset}  ${colors.cyan}HTTP Status:${colors.reset} ${colors.bright}${response.statusCode}${colors.reset}                                                              ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.magenta}║${colors.reset}  ${colors.cyan}Content Length:${colors.reset} ${colors.bright}${response.data.length} bytes${colors.reset}                                                    ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.bright}${colors.magenta}╚════════════════════════════════════════════════════════════════════════════════╝${colors.reset}`);
        console.log();

        let isValid = false;
        let reason = '';

        if (linkInfo.type === 'variant1') {
            if (response.data.includes('If you have Telegram, you can view posts by')) {
                isValid = true;
                reason = 'Найден текст: "If you have Telegram, you can view posts by" - это канал с постами ✓';
            } else if (response.data.includes('View in Telegram') && response.data.includes('Preview channel')) {
                isValid = true;
                reason = 'Найден текст: "View in Telegram" и "Preview channel" - это валидный канал ✓';
            } else if (response.data.includes('If you have Telegram, you can contact')) {
                isValid = false;
                reason = 'Найден текст: "If you have Telegram, you can contact" - это личный аккаунт ✗';
            } else {
                isValid = false;
                reason = 'Не найдены ключевые маркеры канала ✗';
            }
        } else if (linkInfo.type === 'variant2') {
            if (response.data.includes('You are invited to a group chat on Telegram. Click to join')) {
                isValid = false;
                reason = 'Найден текст: "You are invited to a group chat on Telegram" - закрытая группа ✗';
            } else if (response.data.includes('You are invited to the group') && response.data.includes('Click above to join')) {
                isValid = true;
                reason = 'Найден текст: "You are invited to the group ... Click above to join" - открытая группа ✓';
            } else {
                isValid = false;
                reason = 'Не найдены ключевые маркеры группы ✗';
            }
        } else if (linkInfo.type === 'variant3') {
            if (response.data.includes('You are invited to the channel') && response.data.includes('Click above to join')) {
                isValid = true;
                reason = 'Найден текст: "You are invited to the channel ... Click above to join" - это канал ✓';
            } else if (response.data.includes('You are invited to the group') && response.data.includes('Click above to join')) {
                isValid = true;
                reason = 'Найден текст: "You are invited to the group ... Click above to join" - это группа ✓';
            } else if (response.data.includes('You are invited to a group chat on Telegram. Click to join')) {
                isValid = false;
                reason = 'Найден текст: "You are invited to a group chat" - закрытое приглашение без названия ✗';
            } else {
                isValid = false;
                reason = 'Не найдены ключевые маркеры канала или группы ✗';
            }
        }

        console.log(`${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════════════════════════════╗${colors.reset}`);
        console.log(`${colors.bright}${colors.cyan}║${colors.reset}  ${colors.bright}РЕЗУЛЬТАТ ПРОВЕРКИ${colors.reset}                                                            ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.bright}${colors.cyan}╠════════════════════════════════════════════════════════════════════════════════╣${colors.reset}`);

        if (isValid) {
            console.log(`${colors.cyan}║${colors.reset}  ${colors.bgGreen}${colors.white}${colors.bright} ВАЛИДНАЯ ССЫЛКА ✓ ${colors.reset}                                                           ${colors.cyan}║${colors.reset}`);
        } else {
            console.log(`${colors.cyan}║${colors.reset}  ${colors.bgRed}${colors.white}${colors.bright} НЕ ВАЛИДНАЯ ССЫЛКА ✗ ${colors.reset}                                                        ${colors.cyan}║${colors.reset}`);
        }

        console.log(`${colors.cyan}║${colors.reset}                                                                                ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}  ${colors.yellow}Причина:${colors.reset}                                                                      ${colors.cyan}║${colors.reset}`);

        const maxWidth = 76;
        const words = reason.split(' ');
        let line = '';

        words.forEach(word => {
            if ((line + word).length > maxWidth) {
                const padding = ' '.repeat(Math.max(0, maxWidth - line.length));
                console.log(`${colors.cyan}║${colors.reset}  ${line}${padding}${colors.cyan}║${colors.reset}`);
                line = word + ' ';
            } else {
                line += word + ' ';
            }
        });

        if (line.trim()) {
            const padding = ' '.repeat(Math.max(0, maxWidth - line.length));
            console.log(`${colors.cyan}║${colors.reset}  ${line}${padding}${colors.cyan}║${colors.reset}`);
        }

        console.log(`${colors.bright}${colors.cyan}╚════════════════════════════════════════════════════════════════════════════════╝${colors.reset}`);
        console.log();

        console.log(`${colors.bright}${colors.yellow}📄 ФРАГМЕНТ HTML ОТВЕТА:${colors.reset}`);
        console.log(`${colors.dim}${'─'.repeat(80)}${colors.reset}`);

        const textContent = response.data
            .replace(/<[^>]*>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 500);

        console.log(`${colors.dim}${textContent}...${colors.reset}`);
        console.log(`${colors.dim}${'─'.repeat(80)}${colors.reset}`);
        console.log();

    } catch (error) {
        console.log(`${colors.red}✗ Ошибка при запросе: ${error.message}${colors.reset}`);
        console.log();
    }
}

async function showMenu() {
    return new Promise((resolve) => {
        console.clear();
        console.log(`${colors.bright}${colors.bgMagenta}${colors.white}                                                                                  ${colors.reset}`);
        console.log(`${colors.bright}${colors.bgMagenta}${colors.white}                                🚀 ParseGram 🚀                                   ${colors.reset}`);
        console.log(`${colors.bright}${colors.bgMagenta}${colors.white}                                                                                  ${colors.reset}`);
        console.log();
        console.log(`${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════════════════════════════╗${colors.reset}`);
        console.log(`${colors.bright}${colors.cyan}║${colors.reset}  ${colors.bright}ГЛАВНОЕ МЕНЮ${colors.reset}                                                                  ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.bright}${colors.cyan}╠════════════════════════════════════════════════════════════════════════════════╣${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}                                                                                ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}  ${colors.bright}${colors.green}1.${colors.reset} ${colors.white}🔍 Проверить одну ссылку${colors.reset}                                                   ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}     ${colors.dim}Протестировать ссылку и увидеть подробный ответ${colors.reset}                            ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}                                                                                ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}  ${colors.bright}${colors.yellow}2.${colors.reset} ${colors.white}🚀 Запустить парсинг${colors.reset}                                                       ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}     ${colors.dim}Начать массовый поиск чатов и каналов${colors.reset}                                      ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}                                                                                ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}  ${colors.bright}${colors.red}0.${colors.reset} ${colors.white}❌ Выход${colors.reset}                                                                   ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}                                                                                ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.bright}${colors.cyan}╚════════════════════════════════════════════════════════════════════════════════╝${colors.reset}`);
        console.log();

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(`${colors.bright}${colors.cyan}Выберите действие (1/2/0): ${colors.reset}`, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

async function promptForLink() {
    return new Promise((resolve) => {
        console.log();
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(`${colors.bright}${colors.cyan}Введите ссылку для проверки: ${colors.reset}`, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

async function pause() {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(`\n${colors.dim}Нажмите Enter для продолжения...${colors.reset}`, () => {
            rl.close();
            resolve();
        });
    });
}

async function startParsing() {
    if (!fs.existsSync(CONFIG.outputDir)) {
        fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    addLog('Программа запущена', 'info');
    addLog(`Прокси: ${CONFIG.useProxy ? 'Включены' : 'Выключены'}`, 'info');
    addLog(`Потоков: ${CONFIG.concurrentRequests}`, 'info');
    
    let gen1StartFrom = CONFIG.variant1StartFrom;
    const gen1 = new Variant1Generator(
        gen1StartFrom?.length || 4,
        gen1StartFrom?.current || null
    );
    if (gen1StartFrom) {
        addLog(`Вариант 1: старт с ${gen1StartFrom.current} (длина ${gen1StartFrom.length})`, 'info');
    }

    let gen2StartFrom = CONFIG.variant2StartFrom;
    const v2Progress = loadProgress('variant2');

    if (gen2StartFrom && gen2StartFrom.current) {
        const gen2 = new Variant2Generator(gen2StartFrom.current);
        addLog(`Вариант 2: старт с ${gen2StartFrom.current} (из CONFIG)`, 'info');
    } else if (v2Progress && v2Progress.current) {
        gen2StartFrom = { current: v2Progress.current };
        const gen2 = new Variant2Generator(v2Progress.current);
        addLog(`Вариант 2: продолжение с ${v2Progress.current} (автосохранение)`, 'info');
    } else {
        const gen2 = new Variant2Generator();
    }
    const gen2 = new Variant2Generator(gen2StartFrom?.current || null);

    let gen3StartFrom = CONFIG.variant3StartFrom;
    const v3Progress = loadProgress('variant3');

    if (gen3StartFrom && gen3StartFrom.current) {
        const gen3 = new Variant3Generator(gen3StartFrom.current);
        addLog(`Вариант 3: старт с ${gen3StartFrom.current} (из CONFIG)`, 'info');
    } else if (v3Progress && v3Progress.current) {
        gen3StartFrom = { current: v3Progress.current };
        const gen3 = new Variant3Generator(v3Progress.current);
        addLog(`Вариант 3: продолжение с ${v3Progress.current} (автосохранение)`, 'info');
    } else {
        const gen3 = new Variant3Generator();
    }
    const gen3 = new Variant3Generator(gen3StartFrom?.current || null);

    displayStats();

    const workers = [];

    for (let i = 0; i < CONFIG.concurrentRequests; i++) {
        workers.push(worker(gen1, 'variant1', i));
        workers.push(worker(gen2, 'variant2', i));
        workers.push(worker(gen3, 'variant3', i));
    }

    await Promise.all(workers);

    displayStats();
    console.log(`\n${colors.green}${colors.bright}✓ Работа завершена!${colors.reset}`);
    console.log(`${colors.cyan}Результаты сохранены в папке:${colors.reset} ${colors.bright}${CONFIG.outputDir}${colors.reset}\n`);
}

async function main() {
    while (true) {
        const choice = await showMenu();

        if (choice === '1') {
            const url = await promptForLink();
            if (url) {
                await testSingleLink(url);
                await pause();
            }
        } else if (choice === '2') {
            await startParsing();
            await pause();
            break;
        } else if (choice === '0') {
            console.log(`\n${colors.yellow}👋 До свидания!${colors.reset}\n`);
            break;
        } else {
            console.log(`\n${colors.red}Неверный выбор! Попробуйте снова.${colors.reset}`);
            await pause();
        }
    }
}

main().catch(console.error);