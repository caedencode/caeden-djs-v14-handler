# 🤖 Caeden's Discord.js v14 Command Handler

A powerful and flexible command handler for Discord.js v14 with automatic command reloading, database support, and advanced error handling.

## ✨ Features

- 🔄 Automatic command reloading (15s intervals)
- 📊 Command & Event monitoring with CLI tables
- 🗄️ MongoDB database support (optional)
- ⚡ Advanced error handling
- 🔒 Permission system
- ⏲️ Cooldown system
- 📁 Organized folder structure

## 📥 Installation

```bash
git clone https://github.com/caedencode/caedens-djs-v14-handler.git
cd caedens-djs-v14-handler
npm install
```

## ⚙️  Configuration
Rename config.example.json to config.json:
```json
{
    "bot": {
        "DISCORD_TOKEN": "",
        "APP_ID": "",
        "APP_SECRET": ""
    },
    "database": {
        "DB_MODE": false,
        "MONGO_URI": "mongodb://username:password@host:port/database"
    }
}
```

## 💻 Command Example
```js
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    cooldown: 3,
    permissions: ['SendMessages'],
    
    async execute(interaction) {
        await interaction.reply('Pong!');
    }
};
```

## 🎉 Event Example
```js
const { Events } = require('discord.js');

module.exports = {
    name: Events.MessageCreate,
    once: false,
    
    async execute(message) {
        if (message.content === 'hello') {
            message.reply('Hi there!');
        }
    }
};
```

##  🚀 Quick start.
- 1. Clone repository.
- 2. Install dependencies.
- 3. Configure config.json.
- 4. Run the bot.

```js
npm start
```