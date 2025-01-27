const { createClient } = require('./utils/clientBuilder');
const { Collection } = require('discord.js');
const logger = require('./utils/logger');
const config = require('../config.json');
const path = require('path');
const fs = require('fs');

function validateConfig() {
    const requiredBotFields = ['DISCORD_TOKEN', 'APP_ID', 'APP_SECRET'];
    const missingFields = [];

    for (const field of requiredBotFields) {
        if (!config.bot?.[field]) {
            missingFields.push(field);
        }
    }

    if (missingFields.length > 0) {
        throw new Error(`Missing required bot configuration: ${missingFields.join(', ')}`);
    }

    if (config.database?.DB_MODE === true) {
        if (!config.database.MONGO_URI) {
            throw new Error('MONGO_URI is required when DB_MODE is true');
        }
    }

    return true;
}

const client = createClient();

client.commands = new Collection();
client.cooldowns = new Collection();
client.events = new Collection();

async function init() {
    try {
        validateConfig();
        
        const handlersPath = path.join(__dirname, 'handlers');
        const handlerFiles = fs.readdirSync(handlersPath).filter(file => file.endsWith('.js'));

        for (const file of handlerFiles) {
            try {
                const handler = require(path.join(handlersPath, file));
                await handler(client);
                logger.info(`Loaded handler: ${file}`);
            } catch (error) {
                logger.error(`Error loading handler ${file}:`, error);
            }
        }
    } catch (error) {
        logger.error('Initialization Error:', error);
        process.exit(1);
    }
}

if (config.database?.DB_MODE) {
    const { connectDatabase } = require('./database/connection');
    connectDatabase().catch(err => logger.error('Database Error:', err));
}

client.on('ready', () => {
    logger.info(`Logged in as ${client.user.tag}`);
    client.user.setActivity('Nebula Labs', { type: 3 });
});

process.on('unhandledRejection', error => logger.error('Unhandled Rejection:', error));
process.on('uncaughtException', error => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

init().then(() => client.login(config.bot.DISCORD_TOKEN));

module.exports = client;