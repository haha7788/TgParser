# 🚀 ParseGram - Telegram Chat Parser

**ParseGram** is a powerful and flexible Node.js tool for finding, iterating, and validating Telegram chat and channel links. It supports various link formats, proxy usage, and multi-threaded processing.

## ✨ Features

*   **Three Search Modes (Variants):**
    1.  **Variant 1 (`t.me/username`):** Searches for public channels and chats by iterating through usernames (starting from 4 characters).
    2.  **Variant 2 (`t.me/joinchat/...`):** Searches for private groups using the old invitation link format.
    3.  **Variant 3 (`t.me/+...`):** Searches for private channels and groups using the new invitation link format (hash).
*   **⚡ Multi-threading:** Configurable number of concurrent HTTP requests for faster operation.
*   **🌐 Proxy Support:** Works via SOCKS5 and HTTP proxies to bypass blocks and hide your IP.
*   **💾 Progress Saving:** Automatically saves the current iteration position. Upon restart, work will resume from where it left off.
*   **📊 Informative Interface:**
    *   Beautiful console menu.
    *   Real-time colored logs.
    *   Speed statistics (req/s), found chats, and errors.
    *   Progress bars.
*   **🔍 Validation Tool:** Built-in utility for detailed analysis of a specific link, showing the chat type (channel/group/private account) and HTTP response.

## 🛠 Installation

1.  **Prerequisites:**
    *   [Node.js](https://nodejs.org/) (version 14+) installed.

2.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/parsertg.git
    cd parsertg
    ```

3.  **Install dependencies:**
    ```bash
    npm install
    ```

## ⚙️ Configuration

All settings are configured at the beginning of the `index.js` file within the `CONFIG` object:

```javascript
const CONFIG = {
    useProxy: false, // true - enable proxy, false - disable
    
    // List of proxy servers
    proxyList: [
        // Example proxy configuration:
        // {
        //    type: 'socks5', // or 'http'
        //    host: '127.0.0.1',
        //    port: 9050,
        //    auth: { username: 'login', password: 'password' } // auth is optional
        // }
    ], 
    
    concurrentRequests: 3, // Number of concurrent threads (affects speed)

    // Attempt limits for each variant (null = infinite)
    variant1Limit: null,
    variant2Limit: null,
    variant3Limit: null,

    // Starting values (optional, null = from the beginning)
    variant1StartFrom: null, // example: {length: 4, current: 'aaaa'}
    variant2StartFrom: null,
    variant3StartFrom: null,
    
    outputDir: './results' // Folder for results
};
```

## ▶️ Usage

Start the application with the command:

```bash
npm start
```

### Program Menu

After launching, an interactive menu will be available:

1.  **🔍 Check a single link**
    *   Allows you to manually enter a link (e.g., `https://t.me/durov`) and get detailed information: whether the link is valid, if it's a channel or group, and see the technical server response.

2.  **🚀 Start Parsing**
    *   Starts the automatic link iteration process for all three variants simultaneously (depending on thread settings).
    *   You will see real-time statistics during operation.
    *   Results are saved "on the fly".

## 📂 Results Structure

All data is saved to the `results/` folder:

*   `variant1.json` — Found public channels/usernames.
*   `variant2.json` — Found private groups (joinchat).
*   `variant3.json` — Found private channels and groups (+hash).
*   `*_progress.json` — Service files with generator states (do not delete them if you want to resume from where you left off).

**Example result format (`variant1.json`):**
```json
{
  "startTime": "2023-10-27T10:00:00.000Z",
  "links": [
    {
      "url": "https://t.me/example",
      "attempts": 154,
      "foundAt": "2023-10-27T10:00:05.123Z"
    }
  ]
}
```

## ⚠️ Disclaimer

This software is developed solely for **educational and research purposes**. The author is not responsible for any misuse of this tool. Please comply with [Telegram's Terms of Service](https://telegram.org/tos) and the laws of your country. Do not use this script for spamming or violating user privacy.

## 📄 License

MIT