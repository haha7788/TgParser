const { makeRequest } = require('../core/http-client');

async function checkLink(url, variant, attemptNumber, proxy, stats, results, addLog, saveResults) {
    try {
        stats[variant].recentAttempts.push(Date.now());

        const response = await makeRequest(url, proxy);
        const data = response.data;

        let isValidChat = false;

        if (variant === 'variant1') {
            if (data.includes('If you have Telegram, you can view posts by')) {
                isValidChat = true;
                addLog(`✓ Вариант 1 - найден канал: ${url}`, 'success');
            } else if (data.includes('View in Telegram') && data.includes('Preview channel')) {
                isValidChat = true;
                addLog(`✓ Вариант 1 - найден канал (View in Telegram): ${url}`, 'success');
            } else if (data.includes('If you have Telegram, you can contact')) {
                addLog(`○ Вариант 1 - личный аккаунт (пропуск): ${url}`, 'check');
                isValidChat = false;
            } else {
                addLog(`○ Вариант 1 - не подходит: ${url}`, 'check');
                isValidChat = false;
            }
        }

        else if (variant === 'variant2') {
            if (data.includes('You are invited to a group chat on Telegram. Click to join')) {
                addLog(`✗ Вариант 2 - закрытая группа (блок): ${url}`, 'check');
                isValidChat = false;
            }
            else if (data.includes('You are invited to the group') && data.includes('Click above to join')) {
                isValidChat = true;
                addLog(`✓ Вариант 2 - найдена открытая группа: ${url}`, 'success');
            } else {
                addLog(`○ Вариант 2 - не подходит: ${url}`, 'check');
                isValidChat = false;
            }
        }

        else if (variant === 'variant3') {
            if (
                (data.includes('You are invited to the channel') && data.includes('Click above to join')) ||
                (data.includes('You are invited to the group') && data.includes('Click above to join'))
            ) {
                isValidChat = true;
                addLog(`✓ Вариант 3 - найден чат (канал или группа): ${url}`, 'success');
            } else if (data.includes('You are invited to a group chat on Telegram. Click to join')) {
                addLog(`✗ Вариант 3 - группа, не канал (пропуск): ${url}`, 'check');
                isValidChat = false;
            } else {
                addLog(`○ Вариант 3 - не подходит: ${url}`, 'check');
                isValidChat = false;
            }
        }

        if (isValidChat) {
            const foundTime = new Date().toISOString();
            const result = {
                url,
                attempts: attemptNumber,
                foundAt: foundTime
            };

            results[variant].links.push(result);
            stats[variant].found++;
            stats[variant].lastFound = url;

            addLog(`🎉 НАЙДЕН РАБОЧИЙ ЧАТ/КАНАЛ: ${url}`, 'success');

            saveResults(variant);
            return true;
        }

        return false;
    } catch (error) {
        stats[variant].errors++;
        addLog(`✗ Ошибка при проверке ${url}: ${error.message}`, 'error');
        return false;
    }
}

function detectLinkType(url) {
    if (url.includes('t.me/joinchat/')) {
        return { type: 'variant2', value: url.split('t.me/joinchat/')[1] };
    } else if (url.includes('t.me/+')) {
        return { type: 'variant3', value: url.split('t.me/+')[1] };
    } else if (url.includes('t.me/')) {
        return { type: 'variant1', value: url.split('t.me/')[1] };
    }
    return null;
}

module.exports = {
    checkLink,
    detectLinkType
};