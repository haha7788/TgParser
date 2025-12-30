
class BotTokenGenerator {
    constructor(mode = 'sequential', startToken = null, options = {}) {

        this.mode = mode; // 'sequential', 'from-value', 'random', 'botid-only'
        this.botIdChars = '0123456789';
        this.secretChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';

        this.fixedBotId = options.fixedBotId || null; // Фиксированный bot ID для перебора только секрета
        this.secretMode = options.secretMode || 'sequential'; // 'sequential', 'from-value', 'random'

        if (mode === 'fixed-botid') {
            if (!this.fixedBotId) {
                throw new Error('Fixed Bot ID mode requires fixedBotId option');
            }
            this.currentBotId = this.parseBotId(this.fixedBotId);

            if (this.secretMode === 'sequential') {
                this.currentSecret = new Array(35).fill(0); // Начинаем с aaaa...
            } else if (this.secretMode === 'from-value' && options.startSecret) {
                this.currentSecret = this.parseSecret(options.startSecret);
            } else if (this.secretMode === 'random') {
                this.currentSecret = null; // Всегда случайный
            } else {
                this.currentSecret = new Array(35).fill(0);
            }
        } else if (mode === 'sequential') {
            this.currentBotId = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
            this.currentSecret = new Array(35).fill(0); // индексы в secretChars
        } else if (mode === 'from-value' && startToken) {
            this.parseToken(startToken);
        } else if (mode === 'random') {
            this.currentBotId = null;
            this.currentSecret = null;
        }
    }

    parseBotId(botIdStr) {
        if (botIdStr.length !== 10) {
            throw new Error(`Invalid bot ID length: expected 10, got ${botIdStr.length}. Bot ID: ${botIdStr}`);
        }

        return botIdStr.split('').map(char => {
            const index = this.botIdChars.indexOf(char);
            if (index === -1) throw new Error(`Invalid character in bot ID: ${char}`);
            return index;
        });
    }

    parseSecret(secretStr) {
        if (secretStr.length !== 35) {
            throw new Error(`Invalid secret length: expected 35, got ${secretStr.length}. Secret: ${secretStr}`);
        }

        return secretStr.split('').map(char => {
            const index = this.secretChars.indexOf(char);
            if (index === -1) throw new Error(`Invalid character in secret: ${char}`);
            return index;
        });
    }

    parseToken(token) {
        const parts = token.split(':');
        if (parts.length !== 2) {
            throw new Error('Invalid token format. Expected: XXXXXXXXXX:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX (10 digits : 35 chars)');
        }

        if (parts[0].length !== 10) {
            throw new Error(`Invalid bot ID length: expected 10, got ${parts[0].length}. Token: ${token}`);
        }

        if (parts[1].length !== 35) {
            throw new Error(`Invalid secret length: expected 35, got ${parts[1].length}. Token: ${token}`);
        }

        this.currentBotId = parts[0].split('').map(char => {
            const index = this.botIdChars.indexOf(char);
            if (index === -1) throw new Error(`Invalid character in bot ID: ${char}`);
            return index;
        });

        this.currentSecret = parts[1].split('').map(char => {
            const index = this.secretChars.indexOf(char);
            if (index === -1) throw new Error(`Invalid character in secret: ${char}`);
            return index;
        });
    }

    next() {
        if (this.mode === 'random') {
            return this.generateRandom();
        }

        if (this.mode === 'fixed-botid') {
            return this.generateFixedBotId();
        }

        const token = this.getCurrentToken();
        this.increment();
        return token;
    }

    generateFixedBotId() {
        const botId = this.currentBotId.map(idx => this.botIdChars[idx]).join('');

        let secret;

        if (this.secretMode === 'random') {
            secret = Array.from({ length: 35 }, () =>
                this.secretChars[Math.floor(Math.random() * this.secretChars.length)]
            ).join('');
        } else {
            secret = this.currentSecret.map(idx => this.secretChars[idx]).join('');

            let carry = true;
            for (let i = this.currentSecret.length - 1; i >= 0 && carry; i--) {
                this.currentSecret[i]++;
                if (this.currentSecret[i] >= this.secretChars.length) {
                    this.currentSecret[i] = 0;
                } else {
                    carry = false;
                }
            }

            if (carry) {
                this.currentSecret = new Array(35).fill(0);
            }
        }

        return `${botId}:${secret}`;
    }

    getCurrentToken() {
        if (this.mode === 'random' || !this.currentBotId || !this.currentSecret) {
            return null;
        }
        const botId = this.currentBotId.map(idx => this.botIdChars[idx]).join('');
        const secret = this.currentSecret.map(idx => this.secretChars[idx]).join('');
        return `${botId}:${secret}`;
    }

    increment() {
        let carry = true;
        for (let i = this.currentSecret.length - 1; i >= 0 && carry; i--) {
            this.currentSecret[i]++;
            if (this.currentSecret[i] >= this.secretChars.length) {
                this.currentSecret[i] = 0;
            } else {
                carry = false;
            }
        }

        if (carry) {
            carry = true;
            for (let i = this.currentBotId.length - 1; i >= 0 && carry; i--) {
                this.currentBotId[i]++;
                if (this.currentBotId[i] >= this.botIdChars.length) {
                    this.currentBotId[i] = 0;
                } else {
                    carry = false;
                }
            }

            if (carry) {
                this.currentBotId = new Array(10).fill(0);
                this.currentSecret = new Array(35).fill(0);
            }
        }
    }

    generateRandom() {
        const botId = Array.from({ length: 10 }, () =>
            this.botIdChars[Math.floor(Math.random() * this.botIdChars.length)]
        ).join('');

        const secretStart = 'AA';
        const secretRest = Array.from({ length: 33 }, () =>
            this.secretChars[Math.floor(Math.random() * this.secretChars.length)]
        ).join('');

        const secret = secretStart + secretRest;

        return `${botId}:${secret}`;
    }

    getState() {
        if (this.mode === 'random') {
            return {
                mode: 'random',
                currentToken: null
            };
        }

        return {
            mode: this.mode,
            currentToken: this.getCurrentToken()
        };
    }

    static fromState(state) {
        if (state.mode === 'random') {
            return new BotTokenGenerator('random');
        }

        const generator = new BotTokenGenerator('from-value', state.currentToken);
        return generator;
    }
}

module.exports = { BotTokenGenerator };