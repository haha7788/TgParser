
const fs = require('fs');
const path = require('path');

class TokenStorage {
    constructor(outputDir = './results/tokens') {
        this.outputDir = outputDir;
        this.progressFile = path.join(outputDir, 'token_search_progress.json');
        this.foundTokensFile = path.join(outputDir, 'found_tokens.json');

        this.ensureDirectory();
        this.initializeFiles();
    }

    ensureDirectory() {
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
    }

    initializeFiles() {
        if (!fs.existsSync(this.progressFile)) {
            this.saveProgress({
                mode: 'sequential',
                currentToken: '0000000000:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
                startedAt: new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
                attempts: 0,
                found: 0
            });
        }

        if (!fs.existsSync(this.foundTokensFile)) {
            this.saveFoundTokens({
                startTime: new Date().toISOString(),
                totalFound: 0,
                tokens: []
            });
        }
    }

    saveProgress(progressData) {
        progressData.lastUpdated = new Date().toISOString();
        fs.writeFileSync(this.progressFile, JSON.stringify(progressData, null, 2));
    }

    loadProgress() {
        try {
            if (fs.existsSync(this.progressFile)) {
                const data = fs.readFileSync(this.progressFile, 'utf8');
                return JSON.parse(data);
            }
        } catch (e) {
            console.error('Ошибка загрузки прогресса:', e.message);
        }
        return null;
    }

    saveFoundTokens(tokensData) {
        fs.writeFileSync(this.foundTokensFile, JSON.stringify(tokensData, null, 2));
    }

    loadFoundTokens() {
        try {
            if (fs.existsSync(this.foundTokensFile)) {
                const data = fs.readFileSync(this.foundTokensFile, 'utf8');
                return JSON.parse(data);
            }
        } catch (e) {
            console.error('Ошибка загрузки найденных токенов:', e.message);
        }
        return { startTime: new Date().toISOString(), totalFound: 0, tokens: [] };
    }

    addFoundToken(tokenInfo) {
        const tokensData = this.loadFoundTokens();

        tokensData.tokens.push({
            token: tokenInfo.token,
            foundAt: new Date().toISOString(),
            getMe: tokenInfo.getMe,
            getWebhookInfo: tokenInfo.getWebhookInfo,
            getMyCommands: tokenInfo.getMyCommands
        });

        tokensData.totalFound = tokensData.tokens.length;
        this.saveFoundTokens(tokensData);
    }

    updateProgress(attempts, found, currentToken, mode) {
        const progress = this.loadProgress() || {};

        progress.attempts = attempts;
        progress.found = found;
        progress.currentToken = currentToken;
        progress.mode = mode;

        this.saveProgress(progress);
    }


    getStatistics() {
        const progress = this.loadProgress();
        const found = this.loadFoundTokens();

        return {
            progress: progress || {},
            found: found || { totalFound: 0, tokens: [] }
        };
    }

    reset() {
        if (fs.existsSync(this.progressFile)) {
            fs.unlinkSync(this.progressFile);
        }
        this.initializeFiles();
    }
}

module.exports = { TokenStorage };