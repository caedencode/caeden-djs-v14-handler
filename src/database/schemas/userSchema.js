
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
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    guildId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = userSchema;