
const { BotTokenChecker } = require('./token-checker');

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
    bgCyan: '\x1b[46m'
};

async function testSingleToken(token) {
    console.clear();
    console.log(`${colors.bright}${colors.bgCyan}${colors.white}                                                                                ${colors.reset}`);
    console.log(`${colors.bright}${colors.bgCyan}${colors.white}                        🔍 ПРОВЕРКА ТОКЕНА БОТА 🔍                              ${colors.reset}`);
    console.log(`${colors.bright}${colors.bgCyan}${colors.white}                                                                                ${colors.reset}`);
    console.log();

    console.log(`${colors.cyan}🔑 Токен:${colors.reset} ${colors.bright}${token}${colors.reset}`);
    console.log();
    console.log(`${colors.yellow}⏳ Проверка токена...${colors.reset}`);
    console.log();

    const checker = new BotTokenChecker();

    try {
        const result = await checker.checkToken(token);

        if (!result.valid) {
            console.log(`${colors.bright}${colors.bgRed}${colors.white} ТОКЕН НЕВАЛИДНЫЙ ✗ ${colors.reset}`);
            console.log();
            console.log(`${colors.red}Ошибка:${colors.reset} ${result.error || 'Неизвестная ошибка'}`);
            console.log();
            return;
        }

        console.log(`${colors.bright}${colors.bgGreen}${colors.white} ТОКЕН ВАЛИДНЫЙ ✓ ${colors.reset}`);
        console.log();

        if (result.getMe && result.getMe.ok) {
            const bot = result.getMe.result;
            console.log(`${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════════════════════════════╗${colors.reset}`);
            console.log(`${colors.bright}${colors.cyan}║${colors.reset}  ${colors.bright}ИНФОРМАЦИЯ О БОТЕ (getMe)${colors.reset}                                                  ${colors.cyan}║${colors.reset}`);
            console.log(`${colors.bright}${colors.cyan}╠════════════════════════════════════════════════════════════════════════════════╣${colors.reset}`);
            console.log(`${colors.cyan}║${colors.reset}                                                                                ${colors.cyan}║${colors.reset}`);
            console.log(`${colors.cyan}║${colors.reset}  ${colors.green}ID:${colors.reset} ${colors.bright}${bot.id}${colors.reset}                                                                   ${colors.cyan}║${colors.reset}`);
            console.log(`${colors.cyan}║${colors.reset}  ${colors.green}Имя:${colors.reset} ${colors.bright}${bot.first_name}${colors.reset}${' '.repeat(Math.max(0, 70 - bot.first_name.length))}${colors.cyan}║${colors.reset}`);

            if (bot.username) {
                console.log(`${colors.cyan}║${colors.reset}  ${colors.green}Username:${colors.reset} ${colors.bright}@${bot.username}${colors.reset}${' '.repeat(Math.max(0, 63 - bot.username.length))}${colors.cyan}║${colors.reset}`);
            }

            console.log(`${colors.cyan}║${colors.reset}  ${colors.green}Бот:${colors.reset} ${colors.bright}${bot.is_bot ? 'Да' : 'Нет'}${colors.reset}                                                              ${colors.cyan}║${colors.reset}`);
            console.log(`${colors.cyan}║${colors.reset}  ${colors.yellow}Может вступать в группы:${colors.reset} ${colors.bright}${bot.can_join_groups ? 'Да' : 'Нет'}${colors.reset}                                    ${colors.cyan}║${colors.reset}`);
            console.log(`${colors.cyan}║${colors.reset}  ${colors.yellow}Читает все сообщения:${colors.reset} ${colors.bright}${bot.can_read_all_group_messages ? 'Да' : 'Нет'}${colors.reset}                                 ${colors.cyan}║${colors.reset}`);
            console.log(`${colors.cyan}║${colors.reset}  ${colors.yellow}Поддерживает inline:${colors.reset} ${colors.bright}${bot.supports_inline_queries ? 'Да' : 'Нет'}${colors.reset}                                  ${colors.cyan}║${colors.reset}`);
            console.log(`${colors.cyan}║${colors.reset}  ${colors.yellow}Может подключаться к бизнесу:${colors.reset} ${colors.bright}${bot.can_connect_to_business ? 'Да' : 'Нет'}${colors.reset}                         ${colors.cyan}║${colors.reset}`);
            console.log(`${colors.cyan}║${colors.reset}  ${colors.yellow}Имеет главное веб-приложение:${colors.reset} ${colors.bright}${bot.has_main_web_app ? 'Да' : 'Нет'}${colors.reset}                         ${colors.cyan}║${colors.reset}`);
            console.log(`${colors.cyan}║${colors.reset}                                                                                ${colors.cyan}║${colors.reset}`);
            console.log(`${colors.bright}${colors.cyan}╚════════════════════════════════════════════════════════════════════════════════╝${colors.reset}`);
            console.log();
        }

        if (result.getWebhookInfo && result.getWebhookInfo.ok) {
            const webhook = result.getWebhookInfo.result;
            console.log(`${colors.bright}${colors.magenta}╔════════════════════════════════════════════════════════════════════════════════╗${colors.reset}`);
            console.log(`${colors.bright}${colors.magenta}║${colors.reset}  ${colors.bright}ИНФОРМАЦИЯ О WEBHOOK (getWebhookInfo)${colors.reset}                                      ${colors.magenta}║${colors.reset}`);
            console.log(`${colors.bright}${colors.magenta}╠════════════════════════════════════════════════════════════════════════════════╣${colors.reset}`);
            console.log(`${colors.magenta}║${colors.reset}                                                                                ${colors.magenta}║${colors.reset}`);

            if (webhook.url) {
                const url = webhook.url.length > 70 ? webhook.url.substring(0, 67) + '...' : webhook.url;
                console.log(`${colors.magenta}║${colors.reset}  ${colors.blue}URL:${colors.reset} ${colors.bright}${url}${colors.reset}${' '.repeat(Math.max(0, 72 - url.length))}${colors.magenta}║${colors.reset}`);
            } else {
                console.log(`${colors.magenta}║${colors.reset}  ${colors.blue}URL:${colors.reset} ${colors.dim}не установлен${colors.reset}                                                          ${colors.magenta}║${colors.reset}`);
            }

            console.log(`${colors.magenta}║${colors.reset}  ${colors.blue}Пользовательский сертификат:${colors.reset} ${colors.bright}${webhook.has_custom_certificate ? 'Да' : 'Нет'}${colors.reset}                       ${colors.magenta}║${colors.reset}`);
            console.log(`${colors.magenta}║${colors.reset}  ${colors.blue}Ожидающих обновлений:${colors.reset} ${colors.bright}${webhook.pending_update_count}${colors.reset}                                           ${colors.magenta}║${colors.reset}`);

            if (webhook.ip_address) {
                console.log(`${colors.magenta}║${colors.reset}  ${colors.blue}IP адрес:${colors.reset} ${colors.bright}${webhook.ip_address}${colors.reset}                                                     ${colors.magenta}║${colors.reset}`);
            }

            if (webhook.max_connections) {
                console.log(`${colors.magenta}║${colors.reset}  ${colors.blue}Максимум соединений:${colors.reset} ${colors.bright}${webhook.max_connections}${colors.reset}                                            ${colors.magenta}║${colors.reset}`);
            }

            if (webhook.allowed_updates && webhook.allowed_updates.length > 0) {
                console.log(`${colors.magenta}║${colors.reset}  ${colors.blue}Разрешенные обновления:${colors.reset} ${colors.bright}${webhook.allowed_updates.join(', ')}${colors.reset}${' '.repeat(Math.max(0, 51 - webhook.allowed_updates.join(', ').length))}${colors.magenta}║${colors.reset}`);
            }

            console.log(`${colors.magenta}║${colors.reset}                                                                                ${colors.magenta}║${colors.reset}`);
            console.log(`${colors.bright}${colors.magenta}╚════════════════════════════════════════════════════════════════════════════════╝${colors.reset}`);
            console.log();
        }

        if (result.getMyCommands && result.getMyCommands.ok) {
            const commands = result.getMyCommands.result;
            console.log(`${colors.bright}${colors.yellow}╔════════════════════════════════════════════════════════════════════════════════╗${colors.reset}`);
            console.log(`${colors.bright}${colors.yellow}║${colors.reset}  ${colors.bright}КОМАНДЫ БОТА (getMyCommands)${colors.reset}                                               ${colors.yellow}║${colors.reset}`);
            console.log(`${colors.bright}${colors.yellow}╠════════════════════════════════════════════════════════════════════════════════╣${colors.reset}`);
            console.log(`${colors.yellow}║${colors.reset}                                                                                ${colors.yellow}║${colors.reset}`);

            if (commands.length === 0) {
                console.log(`${colors.yellow}║${colors.reset}  ${colors.dim}Команды не установлены${colors.reset}                                                         ${colors.yellow}║${colors.reset}`);
            } else {
                commands.forEach((cmd, index) => {
                    const desc = cmd.description.length > 55 ? cmd.description.substring(0, 52) + '...' : cmd.description;
                    console.log(`${colors.yellow}║${colors.reset}  ${colors.green}/${cmd.command}${colors.reset} - ${desc}${' '.repeat(Math.max(0, 65 - cmd.command.length - desc.length))}${colors.yellow}║${colors.reset}`);
                });
            }

            console.log(`${colors.yellow}║${colors.reset}                                                                                ${colors.yellow}║${colors.reset}`);
            console.log(`${colors.bright}${colors.yellow}╚════════════════════════════════════════════════════════════════════════════════╝${colors.reset}`);
            console.log();
        }

        console.log(`${colors.dim}═══════════════════════════════════════════════════════════════════════════════${colors.reset}`);
        console.log(`${colors.bright}${colors.white}ПОЛНЫЙ JSON ОТВЕТ:${colors.reset}`);
        console.log(`${colors.dim}═══════════════════════════════════════════════════════════════════════════════${colors.reset}`);
        console.log(JSON.stringify(result, null, 2));
        console.log();

    } catch (error) {
        console.log(`${colors.red}✗ Ошибка при проверке токена: ${error.message}${colors.reset}`);
        console.log();
    }
}

module.exports = { testSingleToken };