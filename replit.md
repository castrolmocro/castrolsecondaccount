# replit.md

## Overview

IMRAN BOT V4 is a fully customizable Facebook Messenger bot built on Node.js. It provides automated messaging, group management, AI chat capabilities, image generation, and various entertainment features. The bot uses the unofficial Facebook Chat API (fca-ws3) to interact with Messenger and supports modular command/event systems for extensibility.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Core Application Structure

The bot follows a modular architecture with clear separation of concerns:

- **Entry Point**: `index.js` → `main/catalogs/IMRANA.js` (spawns the main bot process)
- **Main Bot Logic**: `main/catalogs/IMRANB.js` (obfuscated core bot handler)
- **Event Listener**: `main/system/listen.js` (handles incoming Facebook events)
- **Logger Utility**: `main/catalogs/IMRANC.js` (custom console logging with chalk/gradient styling)
- **Helper Utilities**: `main/catalogs/IMRAND.js` (encryption, GUID generation, utility functions)

### Command System

Commands are stored in `scripts/commands/` as individual JavaScript modules. Each command exports:
- `config`: Metadata (name, version, permission level, prefix requirement, cooldown, etc.)
- `run`: Main execution function
- `handleReply` (optional): For multi-step conversations
- `handleEvent` (optional): For event-based triggers
- `handleReaction` (optional): For reaction-based interactions

### Permission Levels
- **0**: All users
- **1**: Group admins
- **2**: Bot admins (defined in Config.json ADMINBOT array)
- **3**: Bot operators (defined in Config.json OPERATOR array)

### Configuration Files

| File | Purpose |
|------|---------|
| `Config.json` | Bot name, prefix, admin/operator UIDs, disabled commands |
| `main/configs/Config.json` | Facebook login options, API keys, feature toggles |
| `main/configs/api.json` | External API endpoints |
| `main/configs/console.json` | Console output styling configuration |
| `appstate.json` | Encrypted Facebook session state |

### Data Storage

- **SQLite**: Used via Sequelize ORM for persistent data (users, threads, settings)
- **JSON Files**: 
  - `main/botdata/approvedlists.json`: Approved group IDs
  - `main/botdata/premiumlists.json`: Premium user IDs
- **Global State**: In-memory Maps for runtime data (threadData, userBanned, threadBanned)

### Auto-Management Features (IMRAN.js)

- Auto bio update
- Scheduled greetings (morning/afternoon/evening) — interval fixed to 60s (was 1s)
- Auto cache deletion — paths made absolute using `__dirname`
- Auto restart intervals
- Auto-accept pending messages

### Web Server

Express.js server runs on port 5000 serving a status page at `main/catalogs/website/ryuko.html`.

## External Dependencies

### Facebook Integration
- **fca-ws3**: Unofficial Facebook Chat API client for Messenger interactions
- **appstate.json**: Encrypted session cookies for authentication (AES encryption)

### External APIs
- `masterapi.fun`: Primary API for various bot features
- `canvas-api-imran.vercel.app`: Image generation/manipulation
- `love-api-imran-smco.onrender.com`: Love-themed image generation
- `openweathermap.org`: Weather data
- `kaiz-apis.gleeze.com`: AI chat (GPT-4.1)
- `simsimi-fun.vercel.app`: Simsimi-style chat bot
- `ephoto360.com`: Text-to-image effects
- `imgur`: Image hosting/upload

### Key NPM Dependencies
- **axios**: HTTP requests
- **express**: Web server
- **sequelize + sqlite3**: Database ORM
- **moment-timezone**: Time handling (Asia/Dhaka, Asia/Manila)
- **chalk + gradient-string**: Console styling
- **jimp**: Image processing
- **nodemailer**: Email notifications
- **node-cron**: Scheduled tasks
- **openai**: OpenAI API integration
- **fs-extra**: Enhanced file system operations

### Email Notifications
- Nodemailer configured for box approval notifications (configurable via Config.json)