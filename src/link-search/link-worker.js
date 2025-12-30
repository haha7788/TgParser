const { checkLink } = require('./link-checker');

async function worker(generator, variant, workerId, CONFIG, stats, results, addLog, saveResults, saveProgress, displayStats) {
    const proxy = CONFIG.useProxy && CONFIG.proxyList.length > 0
        ? CONFIG.proxyList[workerId % CONFIG.proxyList.length]
        : null;

    const limit = CONFIG[`${variant}Limit`];

    while (true) {
        if (limit && stats[variant].attempts >= limit) {
            break;
        }

        const value = generator.next();
        stats[variant].current = value;

        let url;
        if (variant === 'variant1') {
            url = `https://t.me/${value}`;
        } else if (variant === 'variant2') {
            url = `https://t.me/joinchat/${value}`;
        } else {
            url = `https://t.me/+${value}`;
        }

        stats[variant].attempts++;
        await checkLink(url, variant, stats[variant].attempts, proxy, stats, results, addLog, saveResults);

        if (variant === 'variant1' && stats[variant].attempts % 100 === 0) {
            saveProgress(generator, variant);
        } else if (variant !== 'variant1' && stats[variant].attempts % 50 === 0) {
            saveProgress(generator, variant);
        }

        if (stats[variant].attempts % 5 === 0) {
            displayStats();
        }
    }
}

module.exports = { worker };