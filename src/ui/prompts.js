const readline = require('readline');
const { colors } = require('../core/utils');

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

async function promptForToken() {
    return new Promise((resolve) => {
        console.log();
        console.log(`${colors.yellow}Пример токена: 8188479584:AAEiu15STvfoEkM0yTPRLtrLZtPeivMpXIE${colors.reset}`);
        console.log();

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(`${colors.bright}${colors.cyan}Введите токен для проверки: ${colors.reset}`, (answer) => {
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

async function promptLinkSearchMode(hasProgress = {}) {
    return new Promise((resolve) => {
        console.clear();
        console.log(`${colors.bright}${colors.bgMagenta}${colors.white}                                                                                  ${colors.reset}`);
        console.log(`${colors.bright}${colors.bgMagenta}${colors.white}                          🔍 ПОИСК ССЫЛОК TELEGRAM 🔍                            ${colors.reset}`);
        console.log(`${colors.bright}${colors.bgMagenta}${colors.white}                                                                                  ${colors.reset}`);
        console.log();

        console.log(`${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════════════════════════════╗${colors.reset}`);
        console.log(`${colors.bright}${colors.cyan}║${colors.reset}  ${colors.bright}ВЫБЕРИТЕ РЕЖИМ ПОИСКА${colors.reset}                                                        ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.bright}${colors.cyan}╠════════════════════════════════════════════════════════════════════════════════╣${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}                                                                                ${colors.cyan}║${colors.reset}`);

        const hasAnyProgress = hasProgress.variant1 || hasProgress.variant2 || hasProgress.variant3;

        if (hasAnyProgress) {
            console.log(`${colors.cyan}║${colors.reset}  ${colors.bright}${colors.blue}1.${colors.reset} ${colors.white}▶ Продолжить с последнего прогресса${colors.reset}                                   ${colors.cyan}║${colors.reset}`);

            if (hasProgress.variant1) {
                const v1Display = hasProgress.variant1.current.length > 20
                    ? hasProgress.variant1.current.substring(0, 20) + '...'
                    : hasProgress.variant1.current;
                console.log(`${colors.cyan}║${colors.reset}     ${colors.dim}Вариант 1: ${v1Display}${' '.repeat(Math.max(0, 47 - v1Display.length))}${colors.reset}${colors.cyan}║${colors.reset}`);
            }
            if (hasProgress.variant2) {
                console.log(`${colors.cyan}║${colors.reset}     ${colors.dim}Вариант 2: ${hasProgress.variant2.current}${colors.reset}                                ${colors.cyan}║${colors.reset}`);
            }
            if (hasProgress.variant3) {
                console.log(`${colors.cyan}║${colors.reset}     ${colors.dim}Вариант 3: ${hasProgress.variant3.current}${colors.reset}                                ${colors.cyan}║${colors.reset}`);
            }
            console.log(`${colors.cyan}║${colors.reset}                                                                                ${colors.cyan}║${colors.reset}`);
        }

        const num1 = hasAnyProgress ? '2' : '1';
        const num2 = hasAnyProgress ? '3' : '2';
        const num3 = hasAnyProgress ? '4' : '3';

        console.log(`${colors.cyan}║${colors.reset}  ${colors.bright}${colors.green}${num1}.${colors.reset} ${colors.white}🔢 Последовательный поиск${colors.reset}                                               ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}     ${colors.dim}Вариант 1: aaaa, aaab, aaac...${colors.reset}                                          ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}     ${colors.dim}Вариант 2: aaaaaaaaaaaaaaaa, aaaaaaaaaaaaaaab...${colors.reset}                        ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}     ${colors.dim}Вариант 3: aaaaaaaaaaaaaaaa, aaaaaaaaaaaaaaab...${colors.reset}                        ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}                                                                                ${colors.cyan}║${colors.reset}`);

        console.log(`${colors.cyan}║${colors.reset}  ${colors.bright}${colors.yellow}${num2}.${colors.reset} ${colors.white}📍 Поиск с заданных значений${colors.reset}                                           ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}     ${colors.dim}Укажете стартовые значения для каждого варианта${colors.reset}                         ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}                                                                                ${colors.cyan}║${colors.reset}`);

        console.log(`${colors.cyan}║${colors.reset}  ${colors.bright}${colors.magenta}${num3}.${colors.reset} ${colors.white}🎲 Случайный поиск${colors.reset}                                                     ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}     ${colors.dim}Генерирует случайные значения для всех вариантов${colors.reset}                        ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}                                                                                ${colors.cyan}║${colors.reset}`);

        console.log(`${colors.cyan}║${colors.reset}  ${colors.bright}${colors.red}0.${colors.reset} ${colors.white}⬅ Назад в главное меню${colors.reset}                                                 ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.cyan}║${colors.reset}                                                                                ${colors.cyan}║${colors.reset}`);
        console.log(`${colors.bright}${colors.cyan}╚════════════════════════════════════════════════════════════════════════════════╝${colors.reset}`);
        console.log();

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        const options = hasAnyProgress ? '1/2/3/4/0' : '1/2/3/0';
        rl.question(`${colors.bright}${colors.cyan}Выберите режим (${options}): ${colors.reset}`, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

async function promptVariant1Start() {
    return new Promise((resolve) => {
        console.log();
        console.log(`${colors.blue}${colors.bright}=== Вариант 1 (t.me/username) ===${colors.reset}`);
        console.log(`${colors.yellow}Формат: от 4 символов (a-z, 0-9, _)${colors.reset}`);
        console.log(`${colors.yellow}Примеры: aaaa, test, abc123_${colors.reset}`);
        console.log(`${colors.dim}Оставьте пустым для начала с "aaaa" (4 символа)${colors.reset}`);
        console.log();

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(`${colors.bright}${colors.cyan}Стартовое значение (или Enter): ${colors.reset}`, (answer) => {
            rl.close();
            const value = answer.trim();
            if (!value) {
                resolve(null);
            } else {
                resolve({
                    length: value.length,
                    current: value
                });
            }
        });
    });
}

async function promptVariant2Start() {
    return new Promise((resolve) => {
        console.log();
        console.log(`${colors.yellow}${colors.bright}=== Вариант 2 (t.me/joinchat/...) ===${colors.reset}`);
        console.log(`${colors.yellow}Формат: 16 символов (a-z, A-Z, 0-9, -)${colors.reset}`);
        console.log(`${colors.yellow}Пример: aaaaaaaaaaaaaaaa${colors.reset}`);
        console.log(`${colors.dim}Оставьте пустым для начала с "aaaaaaaaaaaaaaaa"${colors.reset}`);
        console.log();

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(`${colors.bright}${colors.cyan}Стартовое значение (или Enter): ${colors.reset}`, (answer) => {
            rl.close();
            const value = answer.trim();
            if (!value) {
                resolve(null);
            } else {
                resolve({ current: value });
            }
        });
    });
}

async function promptVariant3Start() {
    return new Promise((resolve) => {
        console.log();
        console.log(`${colors.magenta}${colors.bright}=== Вариант 3 (t.me/+...) ===${colors.reset}`);
        console.log(`${colors.yellow}Формат: 16 символов (a-z, A-Z, 0-9, -)${colors.reset}`);
        console.log(`${colors.yellow}Пример: aaaaaaaaaaaaaaaa${colors.reset}`);
        console.log(`${colors.dim}Оставьте пустым для начала с "aaaaaaaaaaaaaaaa"${colors.reset}`);
        console.log();

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(`${colors.bright}${colors.cyan}Стартовое значение (или Enter): ${colors.reset}`, (answer) => {
            rl.close();
            const value = answer.trim();
            if (!value) {
                resolve(null);
            } else {
                resolve({ current: value });
            }
        });
    });
}

module.exports = {
    promptForLink,
    promptForToken,
    pause,
    promptLinkSearchMode,
    promptVariant1Start,
    promptVariant2Start,
    promptVariant3Start
};