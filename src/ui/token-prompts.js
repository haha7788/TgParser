
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
    bgCyan: '\x1b[46m'
};

async function promptBotIdMode() {
    return new Promise((resolve) => {
        console.clear();
        console.log(`${colors.bright}${colors.bgCyan}${colors.white}                                                                                  ${colors.reset}`);
        console.log(`${colors.bright}${colors.bgCyan}${colors.white}                🎯 ФИКСИРОВАННЫЙ BOT ID (ПЕРЕБОР СЕКРЕТА)                        ${colors.reset}`);
        console.log(`${colors.bright}${colors.bgCyan}${colors.white}                                                                                  ${colors.reset}`);
        console.log();

        console.log(`${colors.bright}${colors.magenta}╔════════════════════════════════════════════════════════════════════════════════╗${colors.reset}`);
        console.log(`${colors.bright}${colors.magenta}║${colors.reset}  ${colors.bright}ВЫБЕРИТЕ РЕЖИМ ПЕРЕБОРА СЕКРЕТА${colors.reset}                                               ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.bright}${colors.magenta}╠════════════════════════════════════════════════════════════════════════════════╣${colors.reset}`);
        console.log(`${colors.magenta}║${colors.reset}                                                                                ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.magenta}║${colors.reset}  ${colors.dim}Вы задаете Bot ID (10 цифр), он остается ФИКСИРОВАННЫМ${colors.reset}                        ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.magenta}║${colors.reset}  ${colors.dim}Перебирается только секретная часть (35 символов после :)${colors.reset}                     ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.magenta}║${colors.reset}                                                                                ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.bright}${colors.magenta}╠════════════════════════════════════════════════════════════════════════════════╣${colors.reset}`);
        console.log(`${colors.magenta}║${colors.reset}                                                                                ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.magenta}║${colors.reset}  ${colors.bright}${colors.green}1.${colors.reset} ${colors.white}🔢 Последовательный перебор секрета${colors.reset}                                        ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.magenta}║${colors.reset}     ${colors.dim}Начинается с aaaa... и идет по порядку${colors.reset}                                     ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.magenta}║${colors.reset}     ${colors.dim}Пример: 8500000000:aaaa..., 8500000000:aaab..., 8500000000:aaac...${colors.reset}         ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.magenta}║${colors.reset}                                                                                ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.magenta}║${colors.reset}  ${colors.bright}${colors.yellow}2.${colors.reset} ${colors.white}📍 Перебор секрета с заданного значения${colors.reset}                                    ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.magenta}║${colors.reset}     ${colors.dim}Вы укажете секрет, с которого начать${colors.reset}                                       ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.magenta}║${colors.reset}     ${colors.dim}Пример: начать с zzzzz... → 8500000000:zzzzz..., 8500000000:zzzza...${colors.reset}       ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.magenta}║${colors.reset}                                                                                ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.magenta}║${colors.reset}  ${colors.bright}${colors.blue}3.${colors.reset} ${colors.white}🎲 Случайный перебор секрета${colors.reset}                                               ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.magenta}║${colors.reset}     ${colors.dim}Генерирует случайные секреты${colors.reset}                                               ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.magenta}║${colors.reset}     ${colors.dim}Пример: 8500000000:xR4aB..., 8500000000:mP3dF..., 8500000000:kN7mV...${colors.reset}      ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.magenta}║${colors.reset}                                                                                ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.magenta}║${colors.reset}  ${colors.bright}${colors.red}0.${colors.reset} ${colors.white}⬅ Назад к выбору режима поиска${colors.reset}                                             ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.magenta}║${colors.reset}                                                                                ${colors.magenta}║${colors.reset}`);
        console.log(`${colors.bright}${colors.magenta}╚════════════════════════════════════════════════════════════════════════════════╝${colors.reset}`);
        console.log();

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(`${colors.bright}${colors.cyan}Выберите режим (1/2/3/0): ${colors.reset}`, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

async function promptBotId() {
    return new Promise((resolve) => {
        console.log();
        console.log(`${colors.yellow}Введите Bot ID (10 цифр, например: 8500000000)${colors.reset}`);
        console.log(`${colors.dim}Этот Bot ID будет фиксированным, перебираться будет только секрет${colors.reset}`);
        console.log();

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(`${colors.bright}${colors.cyan}Bot ID: ${colors.reset}`, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

async function promptSecret() {
    return new Promise((resolve) => {
        console.log();
        console.log(`${colors.yellow}Введите секрет (35 символов, a-z A-Z 0-9 _ -)${colors.reset}`);
        console.log(`${colors.yellow}Пример: aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa${colors.reset}`);
        console.log();

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(`${colors.bright}${colors.cyan}Секрет: ${colors.reset}`, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

module.exports = {
    promptBotIdMode,
    promptBotId,
    promptSecret
};