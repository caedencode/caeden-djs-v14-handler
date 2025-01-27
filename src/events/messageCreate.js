const { Events } = require('discord.js');
const logger = require('../../utils/logger');

module.exports = {
    name: Events.MessageCreate,
    once: false,
    execute: async (message, client) => {
        try {
            if (message.author.bot) return;
            if (message.content.toLowerCase() === 'hi') {
                await message.reply('Hello!');
                logger.info(`Replied to ${message.author.tag}'s greeting in ${message.guild.name}`);
            }
        } catch (error) {
            logger.error('Error:', error);
        }
    }
};