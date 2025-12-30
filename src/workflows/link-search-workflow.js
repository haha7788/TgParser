const fs = require('fs');
const { CONFIG } = require('../core/config');
const { colors } = require('../core/utils');
const { makeRequest } = require('../core/http-client');
const { Variant1Generator, Variant2Generator, Variant3Generator } = require('../link-search/generators');
const { detectLinkType } = require('../link-search/link-checker');
const { worker } = require('../link-search/link-worker');
const { saveResults, saveProgress, loadProgress } = require('../link-search/results-manager');
const { showLinkSearchMenu } = require('../ui/menu');
const { addLog, displayStats } = require('../ui/display');
const {
    promptForLink,
    pause,
    promptLinkSearchMode,
    promptVariant1Start,
    promptVariant2Start,
    promptVariant3Start
} = require('../ui/prompts');

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

async function startParsing() {
    if (!fs.existsSync(CONFIG.outputDir)) {
        fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    const v1Progress = loadProgress('variant1');
    const v2Progress = loadProgress('variant2');
    const v3Progress = loadProgress('variant3');

    const hasProgress = {};
    if (v1Progress && v1Progress.current) {
        hasProgress.variant1 = { current: v1Progress.current, attempts: 0 };
    }
    if (v2Progress && v2Progress.current) {
        hasProgress.variant2 = { current: v2Progress.current, attempts: 0 };
    }
    if (v3Progress && v3Progress.current) {
        hasProgress.variant3 = { current: v3Progress.current, attempts: 0 };
    }

    const mode = await promptLinkSearchMode(hasProgress);

    if (mode === '0') {
        return;
    }

    let gen1StartFrom = null;
    let gen2StartFrom = null;
    let gen3StartFrom = null;
    let randomMode = false;

    const hasAnyProgress = hasProgress.variant1 || hasProgress.variant2 || hasProgress.variant3;

    if (mode === '1' && hasAnyProgress) {
        if (v1Progress && v1Progress.current) {
            gen1StartFrom = v1Progress;
            addLog(`Вариант 1: продолжение с ${v1Progress.current} (длина ${v1Progress.length})`, 'info');
        }
        if (v2Progress && v2Progress.current) {
            gen2StartFrom = v2Progress;
            addLog(`Вариант 2: продолжение с ${v2Progress.current}`, 'info');
        }
        if (v3Progress && v3Progress.current) {
            gen3StartFrom = v3Progress;
            addLog(`Вариант 3: продолжение с ${v3Progress.current}`, 'info');
        }
    } else if ((mode === '2' && hasAnyProgress) || (mode === '1' && !hasAnyProgress)) {
        addLog('Режим: Последовательный поиск', 'info');
    } else if ((mode === '3' && hasAnyProgress) || (mode === '2' && !hasAnyProgress)) {
        addLog('Режим: Поиск с заданных значений', 'info');
        gen1StartFrom = await promptVariant1Start();
        gen2StartFrom = await promptVariant2Start();
        gen3StartFrom = await promptVariant3Start();

        if (gen1StartFrom) {
            addLog(`Вариант 1: старт с ${gen1StartFrom.current} (длина ${gen1StartFrom.length})`, 'info');
        }
        if (gen2StartFrom) {
            addLog(`Вариант 2: старт с ${gen2StartFrom.current}`, 'info');
        }
        if (gen3StartFrom) {
            addLog(`Вариант 3: старт с ${gen3StartFrom.current}`, 'info');
        }
    } else if ((mode === '4' && hasAnyProgress) || (mode === '3' && !hasAnyProgress)) {
        randomMode = true;
        addLog('Режим: Случайный поиск', 'info');
    } else {
        console.log(`\n${colors.red}Неверный выбор! Попробуйте снова.${colors.reset}`);
        await pause();
        return;
    }

    addLog('Программа запущена', 'info');
    addLog(`Прокси: ${CONFIG.useProxy ? 'Включены' : 'Выключены'}`, 'info');
    addLog(`Потоков: ${CONFIG.concurrentRequests}`, 'info');

    const gen1 = new Variant1Generator(
        gen1StartFrom?.length || 4,
        gen1StartFrom?.current || null,
        randomMode
    );

    const gen2 = new Variant2Generator(gen2StartFrom?.current || null, randomMode);
    const gen3 = new Variant3Generator(gen3StartFrom?.current || null, randomMode);

    displayStats(stats);

    const uiUpdateInterval = setInterval(() => {
        displayStats(stats);
    }, 500);

    const workers = [];

    for (let i = 0; i < CONFIG.concurrentRequests; i++) {
        workers.push(worker(gen1, 'variant1', i, CONFIG, stats, results, addLog, (v) => saveResults(v, results), saveProgress, () => {}));
        workers.push(worker(gen2, 'variant2', i, CONFIG, stats, results, addLog, (v) => saveResults(v, results), saveProgress, () => {}));
        workers.push(worker(gen3, 'variant3', i, CONFIG, stats, results, addLog, (v) => saveResults(v, results), saveProgress, () => {}));
    }

    await Promise.all(workers);

    clearInterval(uiUpdateInterval);

    displayStats(stats);
    console.log(`\n${colors.green}${colors.bright}✓ Работа завершена!${colors.reset}`);
    console.log(`${colors.cyan}Результаты сохранены в папке:${colors.reset} ${colors.bright}${CONFIG.outputDir}${colors.reset}\n`);
}

async function handleLinkSearch() {
    while (true) {
        const choice = await showLinkSearchMenu();

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
            return;
        } else {
            console.log(`\n${colors.red}Неверный выбор! Попробуйте снова.${colors.reset}`);
            await pause();
        }
    }
}

module.exports = { handleLinkSearch };