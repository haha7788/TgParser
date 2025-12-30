
const readline = require('readline');

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

const recentLogs = [];
const MAX_LOGS = 8;

function addLog(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString('ru-RU');
    const log = { timestamp, message, type };
    recentLogs.push(log);
    if (recentLogs.length > MAX_LOGS) {
        recentLogs.shift();
    }
}

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}ч ${minutes % 60}м`;
    if (minutes > 0) return `${minutes}м ${seconds % 60}с`;
    return `${seconds}с`;
}

function displayTokenScanStats(stats, config) {
    process.stdout.write('\x1Bc');

    console.log(`${colors.bright}${colors.bgCyan}${colors.white}                                                                                  ${colors.reset}`);
    console.log(`${colors.bright}${colors.bgCyan}${colors.white}                           🔍 ПОИСК ТОКЕНОВ BOTFATHER 🔍                          ${colors.reset}`);
    console.log(`${colors.bright}${colors.bgCyan}${colors.white}                                                                                  ${colors.reset}`);
    console.log();

    console.log(`${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}║${colors.reset}  ${colors.bright}ОБЩАЯ СТАТИСТИКА${colors.reset}                                                              ${colors.cyan}║${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}╠════════════════════════════════════════════════════════════════════════════════╣${colors.reset}`);

    const modeText = config.mode === 'sequential' ? 'Последовательный' :
                     config.mode === 'from-value' ? 'С заданного' : 'Случайный';

    console.log(`${colors.cyan}║${colors.reset}  ${colors.green}✓ Найдено токенов:${colors.reset} ${colors.bright}${stats.found}${colors.reset}  │  ${colors.yellow}⚡ Попыток:${colors.reset} ${colors.bright}${stats.attempts}${colors.reset}  │  ${colors.red}✗ Ошибок:${colors.reset} ${colors.bright}${stats.errors}${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}  ${colors.blue}⏱ Время работы:${colors.reset} ${colors.bright}${formatTime(stats.uptime)}${colors.reset}  │  ${colors.cyan}🚀 Скорость:${colors.reset} ${colors.bright}${stats.speed} req/s${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}  ${colors.magenta}🎯 Режим:${colors.reset} ${colors.bright}${modeText}${colors.reset}`);
    console.log(`${colors.cyan}║${colors.reset}  ${colors.white}📍 Текущий:${colors.reset} ${colors.bright}${stats.current}${colors.reset}`);

    if (stats.lastFound) {
        console.log(`${colors.cyan}║${colors.reset}  ${colors.green}🎉 Последний:${colors.reset} ${colors.bright}${stats.lastFound}${colors.reset}          ${colors.cyan}║${colors.reset}`);
    }

    console.log(`${colors.bright}${colors.cyan}╚════════════════════════════════════════════════════════════════════════════════╝${colors.reset}`);
    console.log();

    console.log(`${colors.bright}${colors.yellow}╔════════════════════════════════════════════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.bright}${colors.yellow}║${colors.reset}  ${colors.bright}ПОСЛЕДНИЕ ДЕЙСТВИЯ${colors.reset}                                                            ${colors.yellow}║${colors.reset}`);
    console.log(`${colors.bright}${colors.yellow}╠════════════════════════════════════════════════════════════════════════════════╣${colors.reset}`);

    if (recentLogs.length === 0) {
        console.log(`${colors.yellow}║${colors.reset}  ${colors.dim}Ожидание логов...${colors.reset}`);
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
            console.log(`${colors.yellow}║${colors.reset}  ${color}${icon} [${log.timestamp}] ${msg}${colors.reset}`);
        });
    }

    console.log(`${colors.bright}${colors.yellow}╚════════════════════════════════════════════════════════════════════════════════╝${colors.reset}`);
    console.log();
}

async function promptTokenScanMode(hasProgress = false, progressInfo = null) {
    return new Promise((resolve) => {
        console.clear();
        console.log(`${colors.bright}${colors.bgCyan}${colors.white}                                                                                  ${colors.reset}`);
        console.log(`${colors.bright}${colors.bgCyan}${colors.white}                           🔍 ПОИСК ТОКЕНОВ BOTFATHER 🔍                          ${colors.reset}`);
        console.log(`${colors.bright}${colors.bgCyan}${colors.white}                                                                                  ${colors.reset}`);
        console.log();

        console.log(`${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════════════════════════════╗${colors.reset}`);
        console.log(`${colors.bright}${colors.cyan}║${colors.reset}  ${colors.bright}ВЫБЕРИТЕ РЕЖИМ ПОИСКА${colors.reset}                                                         ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.bright}${colors.cyan}╠════════════════════════════════════════════════════════════════════════════════╣${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}                                                                                ${colors.cyan}║${colors.reset}`);

        if (hasProgress && progressInfo) {
            console.log(`${colors.cyan}║${colors.reset}  ${colors.bright}${colors.blue}1.${colors.reset} ${colors.white}▶ Продолжить с последнего прогресса${colors.reset}                                        ${colors.cyan}║${colors.reset}`);
            const tokenPreview = progressInfo.currentToken ? progressInfo.currentToken.substring(0, 40) : 'N/A';
            console.log(`${colors.cyan}║${colors.reset}     ${colors.dim}Последний: ${tokenPreview}...${colors.reset}${' '.repeat(Math.max(0, 28 - tokenPreview.length))}                     ${colors.cyan}║${colors.reset}`);
            console.log(`${colors.cyan}║${colors.reset}     ${colors.dim}Попыток: ${progressInfo.attempts || 0} | Найдено: ${progressInfo.found || 0}${colors.reset}${' '.repeat(Math.max(0, 42 - String(progressInfo.attempts || 0).length - String(progressInfo.found || 0).length))}            ${colors.cyan}║${colors.reset}`);
            console.log(`${colors.cyan}║${colors.reset}                                                                                ${colors.cyan}║${colors.reset}`);
        }

        const num1 = hasProgress ? '2' : '1';
        const num2 = hasProgress ? '3' : '2';
        const num3 = hasProgress ? '4' : '3';
        const num4 = hasProgress ? '5' : '4';

        console.log(`${colors.cyan}║${colors.reset}  ${colors.bright}${colors.green}${num1}.${colors.reset} ${colors.white}🔢 Последовательный поиск${colors.reset}                                                  ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}     ${colors.dim}Начинается с 0000000000:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa${colors.reset}                ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}                                                                                ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}  ${colors.bright}${colors.yellow}${num2}.${colors.reset} ${colors.white}📍 Поиск с заданного токена${colors.reset}                                                ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}     ${colors.dim}Вы укажете токен, с которого начать${colors.reset}                                        ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}                                                                                ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}  ${colors.bright}${colors.magenta}${num3}.${colors.reset} ${colors.white}🎲 Случайный поиск${colors.reset}                                                         ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}     ${colors.dim}Генерирует случайные токены${colors.reset}                                                ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}                                                                                ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}  ${colors.bright}${colors.blue}${num4}.${colors.reset} ${colors.white}🎯 Фиксированный Bot ID (перебор секрета)${colors.reset}                                  ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}     ${colors.dim}Bot ID фиксирован, перебирается секрет${colors.reset}                                     ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}                                                                                ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}  ${colors.bright}${colors.red}0.${colors.reset} ${colors.white}⬅ Назад в главное меню${colors.reset}                                                     ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}                                                                                ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.bright}${colors.cyan}╚════════════════════════════════════════════════════════════════════════════════╝${colors.reset}`);
        console.log();

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const options = hasProgress ? '1/2/3/4/5/0' : '1/2/3/4/0';
        rl.question(`${colors.bright}${colors.cyan}Выберите режим (${options}): ${colors.reset}`, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

async function promptStartToken() {
    return new Promise((resolve) => {
        console.log();
        console.log(`${colors.yellow}Формат: 10 цифр : 35 символов (a-z, A-Z, 0-9, _, -)${colors.reset}`);
        console.log(`${colors.yellow}Пример: 8500000000:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa${colors.reset}`);

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(`${colors.bright}${colors.cyan}Введите стартовый токен: ${colors.reset}`, (answer) => {
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

module.exports = {
    colors,
    addLog,
    displayTokenScanStats,
    promptTokenScanMode,
    promptStartToken,
    pause
};