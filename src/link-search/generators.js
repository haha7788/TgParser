class Variant1Generator {
    constructor(startLength = 4, startValue = null, randomMode = false) {
        this.chars = 'abcdefghijklmnopqrstuvwxyz0123456789_';
        this.length = startLength;
        this.current = startValue ? startValue.split('') : new Array(startLength).fill('a');
        this.randomMode = randomMode;
    }

    next() {
        if (this.randomMode) {
            const randomLength = 4 + Math.floor(Math.random() * 12);
            let result = '';
            for (let i = 0; i < randomLength; i++) {
                result += this.chars[Math.floor(Math.random() * this.chars.length)];
            }
            return result;
        }

        const result = this.current.join('');

        let i = this.current.length - 1;
        while (i >= 0) {
            const charIndex = this.chars.indexOf(this.current[i]);
            if (charIndex < this.chars.length - 1) {
                this.current[i] = this.chars[charIndex + 1];
                break;
            } else {
                this.current[i] = this.chars[0];
                i--;
            }
        }

        if (i < 0) {
            this.length++;
            this.current = new Array(this.length).fill('a');
        }

        return result;
    }
}

class Variant2Generator {
    constructor(startValue = null, randomMode = false) {
        this.chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-';
        this.current = startValue ? startValue.split('') : new Array(16).fill('a');
        this.randomMode = randomMode;
    }

    next() {
        if (this.randomMode) {
            let result = '';
            for (let i = 0; i < 16; i++) {
                result += this.chars[Math.floor(Math.random() * this.chars.length)];
            }
            return result;
        }

        const result = this.current.join('');

        let i = 15;
        while (i >= 0) {
            const charIndex = this.chars.indexOf(this.current[i]);
            if (charIndex < this.chars.length - 1) {
                this.current[i] = this.chars[charIndex + 1];
                break;
            } else {
                this.current[i] = this.chars[0];
                i--;
            }
        }

        return result;
    }
}

class Variant3Generator {
    constructor(startValue = null, randomMode = false) {
        this.chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-';
        this.current = startValue ? startValue.split('') : new Array(16).fill('a');
        this.randomMode = randomMode;
    }

    next() {
        if (this.randomMode) {
            let result = '';
            for (let i = 0; i < 16; i++) {
                result += this.chars[Math.floor(Math.random() * this.chars.length)];
            }
            return result;
        }

        const result = this.current.join('');

        let i = 15;
        while (i >= 0) {
            const charIndex = this.chars.indexOf(this.current[i]);
            if (charIndex < this.chars.length - 1) {
                this.current[i] = this.chars[charIndex + 1];
                break;
            } else {
                this.current[i] = this.chars[0];
                i--;
            }
        }

        return result;
    }
}

module.exports = {
    Variant1Generator,
    Variant2Generator,
    Variant3Generator
};