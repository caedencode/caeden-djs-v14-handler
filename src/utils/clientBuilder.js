/**
 * ╔═══════════════════════════════════════════════════════════════════════════╗
 * ║                                                                           ║
 * ║           Caeden's Discord.js v14 Command Handler                         ║
 * ║                     © 2025 Nebula Labs                                    ║
 * ║                                                                           ║
 * ║           Developed with ❤️ by Caeden                                     ║
 * ║           Contact: caeden@lunaralab.com                                   ║
 * ║           Website: https://nebulalab.xyz                                  ║
 * ║                                                                           ║
 * ╚═══════════════════════════════════════════════════════════════════════════╝
 * 
 * 
 */

const { Client } = require('discord.js');
const { calculateIntents } = require('./intentCalculator');

function createClient() {
    return new Client({
        intents: calculateIntents(),
        allowedMentions: { 
            parse: ['users', 'roles'], 
            repliedUser: true 
        },
        failIfNotExists: false,
        rest: { 
            timeout: 15000,
            retries: 3
        },
        partials: ['MESSAGE', 'CHANNEL', 'REACTION', 'USER', 'GUILD_MEMBER'],
        presence: {
            activities: [{
                name: 'Nebula Labs',
                type: 3
            }],
            status: 'online'
        }
    });
}

module.exports = { createClient };