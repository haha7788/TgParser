# 🚀 ParseGram - Telegram Scanner & Bot Token Finder

[English](#english) | [Русский](#russian)

---

<a name="english"></a>
## 🇬🇧 English

**ParseGram** is a powerful and modular Node.js tool for discovering and validating Telegram chat links and bot tokens. Features clean architecture, proxy support, and multi-threaded processing.

### ✨ Features

#### 🔗 Link Scanner
- **Variant 1 (`t.me/username`):** Searches for public channels/chats by iterating usernames
- **Variant 2 (`t.me/joinchat/...`):** Finds private groups using old invitation format
- **Variant 3 (`t.me/+...`):** Discovers private channels/groups using new hash format
- **Smart Validation:** Detects channel type (public/private/personal account)
- **Progress Tracking:** Auto-saves position and resumes from checkpoint

#### 🔑 Bot Token Scanner
- **Sequential Mode:** Systematic token generation and validation
- **Random Mode:** Random token bruteforce
- **Fixed Bot ID Mode:** Brute-force secret for known Bot ID
- **Full Bot Info:** Extracts username, name, webhook configuration
- **Smart Storage:** Saves valid tokens with complete metadata

#### ⚡ Performance
- **Multi-threading:** Configurable concurrent requests (default: 15)
- **Proxy Support:** SOCKS5 and HTTP proxies
- **Speed Metrics:** Real-time req/s statistics
- **Progress Bars:** Visual progress tracking
- **Auto-Save:** Periodic progress checkpoints

#### 📊 User Interface
- **Beautiful Console Menu:** Intuitive navigation
- **Real-time Logs:** Colored, timestamped event logging
- **Live Statistics:** Found items, attempts, errors, speed
- **Test Mode:** Single link/token validation with detailed analysis

### 🏗️ Project Structure

```
src/
├── core/                   # Core utilities
│   ├── config.js          # Application configuration
│   ├── http-client.js     # HTTP client with proxy support
│   └── utils.js           # Helper functions & formatters
│
├── link-search/           # Link scanning engine
│   ├── generators.js      # URL pattern generators
│   ├── link-checker.js    # Link validation logic
│   ├── link-worker.js     # Worker threads
│   └── results-manager.js # Progress & results storage
│
├── token-scanner/         # Token scanning engine
│   ├── scanner.js         # Main scanner orchestrator
│   ├── token-generator.js # Token generation algorithms
│   ├── token-checker.js   # Token validation via Telegram API
│   ├── token-storage.js   # Token storage & progress
│   └── test-single.js     # Single token testing
│
├── ui/                    # User interface
│   ├── menu.js            # Main menu screens
│   ├── display.js         # Statistics display
│   ├── prompts.js         # Link search prompts
│   ├── token-display.js   # Token scan display
│   └── token-prompts.js   # Token search prompts
│
└── workflows/             # Business logic
    ├── link-search-workflow.js  # Link search orchestration
    └── token-search-workflow.js # Token search orchestration
```

### 🛠 Installation

**Prerequisites:**
- [Node.js](https://nodejs.org/) v14+ installed

**Steps:**
```bash
git clone https://github.com/yourusername/parsertg.git
cd parsertg
npm install
```

### ⚙️ Configuration

Edit `src/core/config.js`:

```javascript
const CONFIG = {
    useProxy: false,              // Enable/disable proxy
    proxyList: [],               // Proxy servers array (see example below)
    concurrentRequests: 15,      // Concurrent threads (higher = faster, but more load)

    // Link scanner limits (null = infinite)
    variant1Limit: null,         // Max attempts for t.me/username
    variant2Limit: null,         // Max attempts for t.me/joinchat/...
    variant3Limit: null,         // Max attempts for t.me/+...

    // Starting positions (null = start from beginning)
    variant1StartFrom: null,     // Example: {length: 4, current: 'aaaa'}
    variant2StartFrom: null,     // Example: {current: 'aaaaaaaaaaaaaaaa'}
    variant3StartFrom: null,     // Example: {current: 'aaaaaaaaaaaaaaaa'}

    // Output directories
    outputDir: './results/links',        // Link scanner results
    tokenOutputDir: './results/tokens',  // Token scanner results

    // Token scanner settings
    tokenSaveInterval: 50        // Save progress every N attempts
};
```

**Proxy Configuration Example:**
```javascript
proxyList: [
    {
        type: 'socks5',              // 'socks5' or 'http'
        host: '127.0.0.1',
        port: 9050,
        auth: {                       // Optional authentication
            username: 'user',
            password: 'pass'
        }
    },
    {
        type: 'http',
        host: '192.168.1.100',
        port: 8080
        // No auth for this proxy
    }
]
```

### ▶️ Usage

**Start the application:**
```bash
npm start
```

**Main Menu:**
```
🚀 ParseGram 🚀

ГЛАВНОЕ МЕНЮ
╔════════════════════════════════════════════╗
║                                            ║
║  1. 🔗 Telegram Link Search                ║
║     Search and validate Telegram links     ║
║                                            ║
║  2. 🔑 Bot Token Search                    ║
║     Search and validate bot tokens         ║
║                                            ║
║  0. ❌ Exit                                ║
║                                            ║
╚════════════════════════════════════════════╝

Choose category (1/2/0):
```

#### Link Search Menu:
1. **Test Single Link** - Validate one link with detailed analysis
2. **Mass Link Scanning** - Scan all 3 variants simultaneously

**Scanning Modes:**
- **Continue from Progress** - Resume from last checkpoint (if available)
- **Sequential Search** - Start from beginning (aaaa, aaab, aaac...)
- **Start from Value** - Begin from specific value
- **Random Search** - Generate random combinations

#### Token Search Menu:
1. **Test Single Token** - Validate one token with full bot info
2. **Mass Token Scanning** - Automated token discovery

**Scanning Modes:**
- **Continue from Progress** - Resume from last checkpoint
- **Sequential Search** - Systematic enumeration
- **Start from Value** - Begin from specific token
- **Random Search** - Random token generation
- **Fixed Bot ID** - Brute-force secret for known Bot ID

### 📂 Results Structure

**Link Scanner** (`./results/links/`):
```
results/links/
├── variant1.json          # Public channels/usernames
├── variant2.json          # Private groups (joinchat)
├── variant3.json          # Private channels/groups (+hash)
├── variant1_progress.json # Checkpoint for variant 1
├── variant2_progress.json # Checkpoint for variant 2
└── variant3_progress.json # Checkpoint for variant 3
```

**Token Scanner** (`./results/tokens/`):
```
results/tokens/
├── found_tokens.json      # Valid tokens with metadata
└── progress.json          # Scanner checkpoint
```

**Example Link Result:**
```json
{
  "startTime": "2025-01-15T10:00:00.000Z",
  "links": [
    {
      "url": "https://t.me/example_channel",
      "attempts": 154,
      "foundAt": "2025-01-15T10:00:05.123Z"
    },
    {
      "url": "https://t.me/another_chat",
      "attempts": 892,
      "foundAt": "2025-01-15T10:02:15.456Z"
    }
  ]
}
```

**Example Token Result:**
```json
{
  "startTime": "2025-01-15T10:00:00.000Z",
  "tokens": [
    {
      "token": "1234567890:ABCdefGHIjklMNOpqrsTUVwxyz123456789",
      "foundAt": "2025-01-15T10:05:30.789Z",
      "attempts": 1547,
      "getMe": {
        "ok": true,
        "result": {
          "id": 1234567890,
          "is_bot": true,
          "first_name": "MyAwesomeBot",
          "username": "my_awesome_bot",
          "can_join_groups": true,
          "can_read_all_group_messages": false,
          "supports_inline_queries": false
        }
      },
      "getWebhookInfo": {
        "ok": true,
        "result": {
          "url": "",
          "has_custom_certificate": false,
          "pending_update_count": 0
        }
      }
    }
  ]
}
```

### 🎯 Key Features

- **25-line index.js:** Ultra-clean entry point (95% reduction from original!)
- **Modular Architecture:** 19 organized modules across 6 logical domains
- **Zero Comments:** Self-documenting, clean code
- **Full Functionality:** All features preserved and working
- **Easy Maintenance:** Changes isolated to specific modules
- **Professional Structure:** Industry-standard organization

### 💡 Tips & Best Practices

1. **Start with low `concurrentRequests`** (3-5) to avoid rate limiting
2. **Use proxies** for higher request rates and IP rotation
3. **Enable progress saving** to avoid losing work on interruption
4. **Monitor speed metrics** to optimize your configuration
5. **Use test mode** first to verify links/tokens before mass scanning

### ⚠️ Disclaimer

This software is for **educational and research purposes only**. The author is not responsible for misuse. Please comply with:
- [Telegram's Terms of Service](https://telegram.org/tos)
- Your local laws and regulations
- Ethical hacking guidelines

**Do not use for:**
- Spamming or harassment
- Privacy violations
- Unauthorized access
- Any illegal activities

### 📄 License

MIT License - See LICENSE file for details

---

<a name="russian"></a>
## 🇷🇺 Русский

**ParseGram** — мощный и модульный инструмент на Node.js для поиска и валидации ссылок на Telegram-чаты и токенов ботов. Отличается чистой архитектурой, поддержкой прокси и многопоточной обработкой.

### ✨ Возможности

#### 🔗 Сканер Ссылок
- **Вариант 1 (`t.me/username`):** Поиск публичных каналов/чатов через перебор username
- **Вариант 2 (`t.me/joinchat/...`):** Поиск приватных групп по старому формату приглашений
- **Вариант 3 (`t.me/+...`):** Поиск приватных каналов/групп по новому формату (хэш)
- **Умная Валидация:** Определение типа чата (публичный/приватный/личный аккаунт)
- **Отслеживание Прогресса:** Автосохранение позиции и возобновление с контрольной точки

#### 🔑 Сканер Токенов Ботов
- **Последовательный Режим:** Систематическая генерация и проверка токенов
- **Случайный Режим:** Случайный перебор токенов
- **Режим Фиксированного Bot ID:** Перебор секрета для известного Bot ID
- **Полная Информация о Боте:** Извлечение username, имени, конфигурации webhook
- **Умное Хранилище:** Сохранение валидных токенов с полными метаданными

#### ⚡ Производительность
- **Многопоточность:** Настраиваемое количество одновременных запросов (по умолчанию: 15)
- **Поддержка Прокси:** SOCKS5 и HTTP прокси
- **Метрики Скорости:** Статистика req/s в реальном времени
- **Прогресс-бары:** Визуальное отслеживание прогресса
- **Автосохранение:** Периодические контрольные точки прогресса

#### 📊 Пользовательский Интерфейс
- **Красивое Консольное Меню:** Интуитивная навигация
- **Логи в Реальном Времени:** Цветные, с метками времени логи событий
- **Живая Статистика:** Найденные элементы, попытки, ошибки, скорость
- **Режим Тестирования:** Проверка одной ссылки/токена с детальным анализом

### 🏗️ Структура Проекта

```
src/
├── core/                   # Основные утилиты
│   ├── config.js          # Конфигурация приложения
│   ├── http-client.js     # HTTP-клиент с поддержкой прокси
│   └── utils.js           # Вспомогательные функции и форматтеры
│
├── link-search/           # Движок сканирования ссылок
│   ├── generators.js      # Генераторы URL-паттернов
│   ├── link-checker.js    # Логика валидации ссылок
│   ├── link-worker.js     # Рабочие потоки
│   └── results-manager.js # Хранение прогресса и результатов
│
├── token-scanner/         # Движок сканирования токенов
│   ├── scanner.js         # Главный оркестратор сканера
│   ├── token-generator.js # Алгоритмы генерации токенов
│   ├── token-checker.js   # Валидация токенов через Telegram API
│   ├── token-storage.js   # Хранение токенов и прогресса
│   └── test-single.js     # Тестирование одного токена
│
├── ui/                    # Пользовательский интерфейс
│   ├── menu.js            # Главные экраны меню
│   ├── display.js         # Отображение статистики
│   ├── prompts.js         # Запросы поиска ссылок
│   ├── token-display.js   # Отображение сканирования токенов
│   └── token-prompts.js   # Запросы поиска токенов
│
└── workflows/             # Бизнес-логика
    ├── link-search-workflow.js  # Оркестрация поиска ссылок
    └── token-search-workflow.js # Оркестрация поиска токенов
```

### 🛠 Установка

**Требования:**
- [Node.js](https://nodejs.org/) v14+ установлен

**Шаги:**
```bash
git clone https://github.com/yourusername/parsertg.git
cd parsertg
npm install
```

### ⚙️ Конфигурация

Отредактируйте `src/core/config.js`:

```javascript
const CONFIG = {
    useProxy: false,              // Включить/выключить прокси
    proxyList: [],               // Массив прокси-серверов (см. пример ниже)
    concurrentRequests: 15,      // Количество потоков (больше = быстрее, но выше нагрузка)

    // Лимиты сканера ссылок (null = бесконечно)
    variant1Limit: null,         // Макс. попыток для t.me/username
    variant2Limit: null,         // Макс. попыток для t.me/joinchat/...
    variant3Limit: null,         // Макс. попыток для t.me/+...

    // Стартовые позиции (null = начать с начала)
    variant1StartFrom: null,     // Пример: {length: 4, current: 'aaaa'}
    variant2StartFrom: null,     // Пример: {current: 'aaaaaaaaaaaaaaaa'}
    variant3StartFrom: null,     // Пример: {current: 'aaaaaaaaaaaaaaaa'}

    // Директории для результатов
    outputDir: './results/links',        // Результаты сканера ссылок
    tokenOutputDir: './results/tokens',  // Результаты сканера токенов

    // Настройки сканера токенов
    tokenSaveInterval: 50        // Сохранять прогресс каждые N попыток
};
```

**Пример настройки прокси:**
```javascript
proxyList: [
    {
        type: 'socks5',              // 'socks5' или 'http'
        host: '127.0.0.1',
        port: 9050,
        auth: {                       // Опциональная аутентификация
            username: 'user',
            password: 'pass'
        }
    },
    {
        type: 'http',
        host: '192.168.1.100',
        port: 8080
        // Без авторизации для этого прокси
    }
]
```

### ▶️ Использование

**Запустите приложение:**
```bash
npm start
```

**Главное Меню:**
```
🚀 ParseGram 🚀

ГЛАВНОЕ МЕНЮ
╔════════════════════════════════════════════╗
║                                            ║
║  1. 🔗 Поиск Ссылок Telegram               ║
║     Поиск и проверка ссылок на чаты        ║
║                                            ║
║  2. 🔑 Поиск Токенов BotFather             ║
║     Поиск и проверка токенов ботов         ║
║                                            ║
║  0. ❌ Выход                               ║
║                                            ║
╚════════════════════════════════════════════╝

Выберите категорию (1/2/0):
```

#### Меню Поиска Ссылок:
1. **Проверить одну ссылку** - Валидация одной ссылки с детальным анализом
2. **Массовое сканирование ссылок** - Сканирование всех 3 вариантов одновременно

**Режимы сканирования:**
- **Продолжить с прогресса** - Возобновить с последней контрольной точки (если доступно)
- **Последовательный поиск** - Начать с начала (aaaa, aaab, aaac...)
- **Начать с значения** - Начать с конкретного значения
- **Случайный поиск** - Генерировать случайные комбинации

#### Меню Поиска Токенов:
1. **Проверить один токен** - Валидация одного токена с полной информацией о боте
2. **Массовое сканирование токенов** - Автоматический поиск токенов

**Режимы сканирования:**
- **Продолжить с прогресса** - Возобновить с последней контрольной точки
- **Последовательный поиск** - Систематический перебор
- **Начать с значения** - Начать с конкретного токена
- **Случайный поиск** - Случайная генерация токенов
- **Фиксированный Bot ID** - Перебор секрета для известного Bot ID

### 📂 Структура Результатов

**Сканер Ссылок** (`./results/links/`):
```
results/links/
├── variant1.json          # Публичные каналы/username
├── variant2.json          # Приватные группы (joinchat)
├── variant3.json          # Приватные каналы/группы (+hash)
├── variant1_progress.json # Контрольная точка для варианта 1
├── variant2_progress.json # Контрольная точка для варианта 2
└── variant3_progress.json # Контрольная точка для варианта 3
```

**Сканер Токенов** (`./results/tokens/`):
```
results/tokens/
├── found_tokens.json      # Валидные токены с метаданными
└── progress.json          # Контрольная точка сканера
```

**Пример результата ссылки:**
```json
{
  "startTime": "2025-01-15T10:00:00.000Z",
  "links": [
    {
      "url": "https://t.me/example_channel",
      "attempts": 154,
      "foundAt": "2025-01-15T10:00:05.123Z"
    },
    {
      "url": "https://t.me/another_chat",
      "attempts": 892,
      "foundAt": "2025-01-15T10:02:15.456Z"
    }
  ]
}
```

**Пример результата токена:**
```json
{
  "startTime": "2025-01-15T10:00:00.000Z",
  "tokens": [
    {
      "token": "1234567890:ABCdefGHIjklMNOpqrsTUVwxyz123456789",
      "foundAt": "2025-01-15T10:05:30.789Z",
      "attempts": 1547,
      "getMe": {
        "ok": true,
        "result": {
          "id": 1234567890,
          "is_bot": true,
          "first_name": "MyAwesomeBot",
          "username": "my_awesome_bot",
          "can_join_groups": true,
          "can_read_all_group_messages": false,
          "supports_inline_queries": false
        }
      },
      "getWebhookInfo": {
        "ok": true,
        "result": {
          "url": "",
          "has_custom_certificate": false,
          "pending_update_count": 0
        }
      }
    }
  ]
}
```

### 🎯 Ключевые Особенности

- **25-строчный index.js:** Ультра-чистая точка входа (уменьшение на 95% от оригинала!)
- **Модульная Архитектура:** 19 организованных модулей в 6 логических доменах
- **Без Комментариев:** Самодокументирующийся, чистый код
- **Полный Функционал:** Все возможности сохранены и работают
- **Легкая Поддержка:** Изменения изолированы в конкретных модулях
- **Профессиональная Структура:** Организация по отраслевым стандартам

### 💡 Советы и Лучшие Практики

1. **Начните с низкого `concurrentRequests`** (3-5), чтобы избежать rate limiting
2. **Используйте прокси** для более высокой скорости запросов и ротации IP
3. **Включите сохранение прогресса**, чтобы не потерять работу при прерывании
4. **Следите за метриками скорости** для оптимизации вашей конфигурации
5. **Используйте режим тестирования** сначала для проверки ссылок/токенов перед массовым сканированием

### ⚠️ Отказ от Ответственности

Это ПО предназначено **исключительно для образовательных и исследовательских целей**. Автор не несет ответственности за неправильное использование. Соблюдайте:
- [Условия использования Telegram](https://telegram.org/tos)
- Ваши местные законы и нормативные акты
- Руководства по этичному хакингу

**Не используйте для:**
- Спама или преследования
- Нарушения конфиденциальности
- Несанкционированного доступа
- Любой незаконной деятельности

### 📄 Лицензия

MIT License - Подробности в файле LICENSE
