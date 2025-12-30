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
    bgYellow: '\x1b[43m',
    bgBlue: '\x1b[44m',
    bgMagenta: '\x1b[45m',
    bgCyan: '\x1b[46m'
};

function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}ч ${minutes % 60}м`;
    if (minutes > 0) return `${minutes}м ${seconds % 60}с`;
    return `${seconds}с`;
}

function getProgressBar(current, total, width = 30) {
    if (!total) return `[${'━'.repeat(width)}]`;

    const percentage = Math.min(100, (current / total) * 100);
    const filled = Math.floor((percentage / 100) * width);
    const empty = width - filled;

    return `[${colors.green}${'█'.repeat(filled)}${colors.dim}${'░'.repeat(empty)}${colors.reset}] ${percentage.toFixed(1)}%`;
}

function calculateSpeed(stats, variant) {
    const now = Date.now();
    const timeWindow = 30000;

    stats[variant].recentAttempts = stats[variant].recentAttempts.filter(
        timestamp => now - timestamp < timeWindow
    );

    if (stats[variant].recentAttempts.length === 0) return 0;

    const oldestTimestamp = stats[variant].recentAttempts[0];
    const timeSpan = (now - oldestTimestamp) / 1000;

    if (timeSpan === 0) return 0;

    return (stats[variant].recentAttempts.length / timeSpan).toFixed(1);
}

module.exports = {
    colors,
    formatTime,
    getProgressBar,
    calculateSpeed
};