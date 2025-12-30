const readline = require('readline');
const { colors } = require('../core/utils');

async function showMainMenu() {
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
        console.log(`${colors.cyan}║${colors.reset}  ${colors.bright}${colors.blue}1.${colors.reset} ${colors.white}🔗 Поиск ссылок Telegram${colors.reset}                                                   ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}     ${colors.dim}Поиск и проверка ссылок на чаты и каналы${colors.reset}                                   ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}                                                                                ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}  ${colors.bright}${colors.magenta}2.${colors.reset} ${colors.white}🔑 Поиск токенов BotFather${colors.reset}                                                 ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}     ${colors.dim}Поиск и проверка токенов Telegram ботов${colors.reset}                                    ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}                                                                                ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}  ${colors.bright}${colors.red}0.${colors.reset} ${colors.white}❌ Выход${colors.reset}                                                                   ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}                                                                                ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.bright}${colors.cyan}╚════════════════════════════════════════════════════════════════════════════════╝${colors.reset}`);
        console.log();

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(`${colors.bright}${colors.cyan}Выберите категорию (1/2/0): ${colors.reset}`, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

async function showLinkSearchMenu() {
    return new Promise((resolve) => {
        console.clear();
        console.log(`${colors.bright}${colors.bgBlue}${colors.white}                                                                                  ${colors.reset}`);
        console.log(`${colors.bright}${colors.bgBlue}${colors.white}                            🔗 ПОИСК ССЫЛОК TELEGRAM 🔗                           ${colors.reset}`);
        console.log(`${colors.bright}${colors.bgBlue}${colors.white}                                                                                  ${colors.reset}`);
        console.log();
        console.log(`${colors.bright}${colors.blue}╔════════════════════════════════════════════════════════════════════════════════╗${colors.reset}`);
        console.log(`${colors.bright}${colors.blue}║${colors.reset}  ${colors.bright}ВЫБЕРИТЕ ДЕЙСТВИЕ${colors.reset}                                                             ${colors.blue}║${colors.reset}`);
        console.log(`${colors.bright}${colors.blue}╠════════════════════════════════════════════════════════════════════════════════╣${colors.reset}`);
        console.log(`${colors.blue}║${colors.reset}                                                                                ${colors.blue}║${colors.reset}`);
        console.log(`${colors.blue}║${colors.reset}  ${colors.bright}${colors.green}1.${colors.reset} ${colors.white}🔍 Проверить одну ссылку${colors.reset}                                                   ${colors.blue}║${colors.reset}`);
        console.log(`${colors.blue}║${colors.reset}     ${colors.dim}Протестировать ссылку и увидеть подробный ответ${colors.reset}                            ${colors.blue}║${colors.reset}`);
        console.log(`${colors.blue}║${colors.reset}                                                                                ${colors.blue}║${colors.reset}`);
        console.log(`${colors.blue}║${colors.reset}  ${colors.bright}${colors.yellow}2.${colors.reset} ${colors.white}🚀 Массовый поиск ссылок${colors.reset}                                                   ${colors.blue}║${colors.reset}`);
        console.log(`${colors.blue}║${colors.reset}     ${colors.dim}Запустить автоматический поиск чатов и каналов${colors.reset}                             ${colors.blue}║${colors.reset}`);
        console.log(`${colors.blue}║${colors.reset}                                                                                ${colors.blue}║${colors.reset}`);
        console.log(`${colors.blue}║${colors.reset}  ${colors.bright}${colors.red}0.${colors.reset} ${colors.white}⬅ Назад в главное меню${colors.reset}                                                     ${colors.blue}║${colors.reset}`);
        console.log(`${colors.blue}║${colors.reset}                                                                                ${colors.blue}║${colors.reset}`);
        console.log(`${colors.bright}${colors.blue}╚════════════════════════════════════════════════════════════════════════════════╝${colors.reset}`);
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

async function showTokenSearchMenu() {
    return new Promise((resolve) => {
        console.clear();
        console.log(`${colors.bright}${colors.bgMagenta}${colors.white}                                                                                  ${colors.reset}`);
        console.log(`${colors.bright}${colors.bgMagenta}${colors.white}                         🔑 ПОИСК ТОКЕНОВ BOTFATHER 🔑                          ${colors.reset}`);
        console.log(`${colors.bright}${colors.bgMagenta}${colors.white}                                                                                  ${colors.reset}`);
        console.log();
        console.log(`${colors.bright}${colors.magenta}╔════════════════════════════════════════════════════════════════════════════════╗${colors.reset}`);
        console.log(`${colors.bright}${colors.magenta}║${colors.reset}  ${colors.bright}ВЫБЕРИТЕ ДЕЙСТВИЕ${colors.reset}                                                             ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.bright}${colors.magenta}╠════════════════════════════════════════════════════════════════════════════════╣${colors.reset}`);
        console.log(`${colors.magenta}║${colors.reset}                                                                                ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.magenta}║${colors.reset}  ${colors.bright}${colors.green}1.${colors.reset} ${colors.white}🔑 Проверить один токен${colors.reset}                                                    ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.magenta}║${colors.reset}     ${colors.dim}Проверить токен бота и получить полную информацию${colors.reset}                          ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.magenta}║${colors.reset}                                                                                ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.magenta}║${colors.reset}  ${colors.bright}${colors.yellow}2.${colors.reset} ${colors.white}🔍 Массовый поиск токенов${colors.reset}                                                  ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.magenta}║${colors.reset}     ${colors.dim}Запустить автоматический поиск токенов ботов${colors.reset}                               ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.magenta}║${colors.reset}                                                                                ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.magenta}║${colors.reset}  ${colors.bright}${colors.red}0.${colors.reset} ${colors.white}⬅ Назад в главное меню${colors.reset}                                                     ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.magenta}║${colors.reset}                                                                                ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.bright}${colors.magenta}╚════════════════════════════════════════════════════════════════════════════════╝${colors.reset}`);
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

module.exports = {
    showMainMenu,
    showLinkSearchMenu,
    showTokenSearchMenu
};