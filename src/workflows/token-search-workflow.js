const { CONFIG } = require('../core/config');
const { colors } = require('../core/utils');
const { showTokenSearchMenu } = require('../ui/menu');
const { promptForToken, pause } = require('../ui/prompts');
const { TokenScanner } = require('../token-scanner/scanner');
const { testSingleToken } = require('../token-scanner/test-single');
const { TokenStorage } = require('../token-scanner/token-storage');
const {
    addLog: addTokenLog,
    displayTokenScanStats,
    promptTokenScanMode,
    promptStartToken,
    pause: tokenPause
} = require('../ui/token-display');
const {
    promptBotIdMode,
    promptBotId,
    promptSecret
} = require('../ui/token-prompts');

function setupScannerHandlers(scanner, scanMode, startInfo) {
    scanner.onStart = function() {
        addTokenLog('Сканирование токенов запущено', 'info');
        addTokenLog(`Режим: ${scanMode}`, 'info');
        if (startInfo) {
            if (scanMode === 'botid-only') {
                addTokenLog(`Старт с Bot ID: ${startInfo}`, 'info');
            } else {
                addTokenLog(`Старт с: ${startInfo}`, 'info');
            }
        }
    };

    scanner.onCheckAttempt = function(token) {
        addTokenLog(`Проверка: ${token}`, 'check');
    };

    scanner.onInvalidToken = function(token, error) {
        addTokenLog(`○ Невалидный: ${token.substring(0, 25)}...`, 'check');
    };

    scanner.onTokenFound = function(tokenInfo) {
        addTokenLog(`🎉 НАЙДЕН ТОКЕН: ${tokenInfo.token}`, 'success');
        if (tokenInfo.getMe?.result?.username) {
            addTokenLog(`  @${tokenInfo.getMe.result.username} - ${tokenInfo.getMe.result.first_name}`, 'success');
        }
        if (tokenInfo.getWebhookInfo?.result?.url) {
            addTokenLog(`  Webhook: ${tokenInfo.getWebhookInfo.result.url.substring(0, 40)}...`, 'success');
        }
    };

    scanner.onError = function(token, error) {
        if (error.message !== 'Timeout') {
            addTokenLog(`Ошибка: ${error.message}`, 'error');
        }
    };

    scanner.onUpdate = function() {
        const stats = scanner.getStats();
        displayTokenScanStats(stats, { mode: scanMode });
    };

    scanner.onFinish = function() {
        const stats = scanner.getStats();
        displayTokenScanStats(stats, { mode: scanMode });
        addTokenLog('Сканирование завершено!', 'info');
        console.log(`\n${colors.green}${colors.bright}✓ Работа завершена!${colors.reset}`);
        console.log(`${colors.cyan}Всего попыток:${colors.reset} ${colors.bright}${stats.attempts}${colors.reset}`);
        console.log(`${colors.cyan}Найдено токенов:${colors.reset} ${colors.bright}${stats.found}${colors.reset}`);
        console.log(`${colors.cyan}Результаты сохранены в:${colors.reset} ${colors.bright}${CONFIG.tokenOutputDir}${colors.reset}\n`);
    };
}

async function startTokenScanning() {
    const storage = new TokenStorage(CONFIG.tokenOutputDir);

    const progress = storage.loadProgress();
    const hasProgress = progress && progress.currentToken && progress.mode !== 'random';

    const mode = await promptTokenScanMode(hasProgress, progress);

    if (mode === '0') {
        return;
    }

    let scanMode, startToken = null;

    if (mode === '1' && hasProgress) {
        scanMode = 'from-value';
        startToken = progress.currentToken;
        console.log(`${colors.green}Продолжаем с токена: ${startToken}${colors.reset}`);
        console.log(`${colors.dim}Предыдущий прогресс: ${progress.attempts} попыток, ${progress.found} найдено${colors.reset}`);
        await tokenPause();
    } else if ((mode === '2' && hasProgress) || (mode === '1' && !hasProgress)) {
        scanMode = 'sequential';
    } else if ((mode === '3' && hasProgress) || (mode === '2' && !hasProgress)) {
        scanMode = 'from-value';
        startToken = await promptStartToken();
        if (!startToken) {
            console.log(`${colors.red}Токен не указан! Возврат в меню.${colors.reset}`);
            await tokenPause();
            return;
        }
    } else if ((mode === '4' && hasProgress) || (mode === '3' && !hasProgress)) {
        scanMode = 'random';
    } else if ((mode === '5' && hasProgress) || (mode === '4' && !hasProgress)) {
        const fixedBotId = await promptBotId();
        if (!fixedBotId || fixedBotId.length !== 10) {
            console.log(`${colors.red}Неверный Bot ID! Должно быть 10 цифр.${colors.reset}`);
            await tokenPause();
            return;
        }

        const secretMode = await promptBotIdMode();

        if (secretMode === '0') {
            return await startTokenScanning();
        }

        let secretModeStr, startSecret = null;

        if (secretMode === '1') {
            secretModeStr = 'sequential';
        } else if (secretMode === '2') {
            secretModeStr = 'from-value';
            startSecret = await promptSecret();
            if (!startSecret || startSecret.length !== 35) {
                console.log(`${colors.red}Неверный секрет! Должно быть 35 символов.${colors.reset}`);
                await tokenPause();
                return;
            }
        } else if (secretMode === '3') {
            secretModeStr = 'random';
        } else {
            console.log(`\n${colors.red}Неверный выбор!${colors.reset}`);
            await tokenPause();
            return;
        }

        scanMode = 'fixed-botid';
        startToken = null;

        const scanner = new TokenScanner({
            mode: scanMode,
            startToken: null,
            concurrentRequests: CONFIG.concurrentRequests,
            outputDir: CONFIG.tokenOutputDir,
            limit: null,
            saveInterval: CONFIG.tokenSaveInterval,
            fixedBotId: fixedBotId,
            secretMode: secretModeStr,
            startSecret: startSecret
        });

        setupScannerHandlers(scanner, scanMode, `${fixedBotId} (секрет: ${secretModeStr})`);

        await scanner.start();
        return;
    } else {
        console.log(`\n${colors.red}Неверный выбор! Попробуйте снова.${colors.reset}`);
        await tokenPause();
        return;
    }

    const scanner = new TokenScanner({
        mode: scanMode,
        startToken: startToken,
        concurrentRequests: CONFIG.concurrentRequests,
        outputDir: CONFIG.tokenOutputDir,
        limit: null,
        saveInterval: CONFIG.tokenSaveInterval
    });

    setupScannerHandlers(scanner, scanMode, startToken);
    await scanner.start();
}

async function handleTokenSearch() {
    while (true) {
        const choice = await showTokenSearchMenu();

        if (choice === '1') {
            const token = await promptForToken();
            if (token) {
                await testSingleToken(token);
                await pause();
            }
        } else if (choice === '2') {
            await startTokenScanning();
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

module.exports = { handleTokenSearch };