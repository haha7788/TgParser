const { colors, formatTime, getProgressBar, calculateSpeed } = require('../core/utils');
const { CONFIG } = require('../core/config');

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

function displayStats(stats) {
    process.stdout.write('\x1Bc');

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
    const v1Speed = calculateSpeed(stats, 'variant1');
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
    const v2Speed = calculateSpeed(stats, 'variant2');
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
    const v3Speed = calculateSpeed(stats, 'variant3');
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

module.exports = {
    addLog,
    displayStats
};