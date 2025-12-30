const fs = require('fs');
const { CONFIG } = require('../core/config');

function saveResults(variant, results) {
    if (!fs.existsSync(CONFIG.outputDir)) {
        fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    const filename = `${CONFIG.outputDir}/${variant}.json`;
    fs.writeFileSync(filename, JSON.stringify(results[variant], null, 2));
}

function saveProgress(generator, variant) {
    const progress = {
        length: generator.length,
        current: generator.current.join('')
    };
    fs.writeFileSync(`${CONFIG.outputDir}/${variant}_progress.json`, JSON.stringify(progress, null, 2));
}

function loadProgress(variant) {
    const filename = `${CONFIG.outputDir}/${variant}_progress.json`;
    if (fs.existsSync(filename)) {
        try {
            const data = fs.readFileSync(filename, 'utf8');
            return JSON.parse(data);
        } catch (e) {
            return null;
        }
    }
    return null;
}

module.exports = {
    saveResults,
    saveProgress,
    loadProgress
};