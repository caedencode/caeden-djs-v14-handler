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
const config = require('../../config.json');
const logger = require('../utils/logger');

async function connectDatabase() {
    if (!config.database.DB_MODE) return;
    
    try {
        await mongoose.connect(config.database.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        logger.info('Connected to MongoDB');
    } catch (error) {
        logger.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

module.exports = { connectDatabase };