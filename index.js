const { showMainMenu } = require('./src/ui/menu');
const { pause } = require('./src/ui/prompts');
const { colors } = require('./src/core/utils');
const { handleLinkSearch } = require('./src/workflows/link-search-workflow');
const { handleTokenSearch } = require('./src/workflows/token-search-workflow');

async function main() {
    while (true) {
        const choice = await showMainMenu();

        if (choice === '1') {
            await handleLinkSearch();
        } else if (choice === '2') {
            await handleTokenSearch();
        } else if (choice === '0') {
            console.log(`\n${colors.yellow}👋 До свидания!${colors.reset}\n`);
            break;
        } else {
            console.log(`\n${colors.red}Неверный выбор! Попробуйте снова.${colors.reset}`);
            await pause();
        }
    }
}

main().catch(console.error);