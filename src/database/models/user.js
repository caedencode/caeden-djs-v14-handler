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
const userSchema = require('../schemas/userSchema');

module.exports = mongoose.model('User', userSchema);