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

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');
const Table = require('cli-table3');
const eventCache = new Map();

function displayEvents(events) {
    const table = new Table({
        head: ['Event Name', 'Category', 'Status'],
        colWidths: [30, 20, 20]
    });

    events.forEach(event => {
        table.push([
            event.name,
            event.category,
            event.status
        ]);
    });

    console.log(table.toString());
}

async function loadEvents(client, category, filePath) {
    try {
        delete require.cache[require.resolve(filePath)];
        const event = require(filePath);
        
        if ('name' in event && 'execute' in event) {
            client.removeAllListeners(event.name);
            client.on(event.name, (...args) => event.execute(...args, client));
            eventCache.set(filePath, {
                name: event.name,
                timestamp: Date.now(),
                category: category
            });
            return { name: event.name, category, status: 'Loaded' };
        }
    } catch (error) {
        logger.error(`Failed to load event from ${filePath}:`, error);
        return { name: path.basename(filePath), category, status: 'Error' };
    }
}

function watchEvents(client) {
    setInterval(async () => {
        const eventsPath = path.join(__dirname, '..', 'events');
        const trackedFiles = new Set();
        const eventStatus = [];

        function scanDirectory(dirPath) {
            const items = fs.readdirSync(dirPath);
            const category = path.basename(dirPath);

            for (const item of items) {
                const itemPath = path.join(dirPath, item);
                const stats = fs.statSync(itemPath);

                if (stats.isDirectory()) {
                    scanDirectory(itemPath);
                } else if (item.endsWith('.js')) {
                    trackedFiles.add(itemPath);
                    const cachedEvent = eventCache.get(itemPath);
                    
                    if (!cachedEvent || stats.mtime.getTime() > cachedEvent.timestamp) {
                        const status = loadEvents(client, category, itemPath);
                        eventStatus.push(status);
                        logger.info(`Reloaded event: ${item}`);
                    } else {
                        eventStatus.push({
                            name: cachedEvent.name,
                            category: cachedEvent.category,
                            status: 'Cached'
                        });
                    }
                }
            }
        }

        scanDirectory(eventsPath);

        for (const [filePath, eventData] of eventCache.entries()) {
            if (!trackedFiles.has(filePath)) {
                logger.info(`Detected deleted event: ${eventData.name}`);
                client.removeAllListeners(eventData.name);
                eventCache.delete(filePath);
                eventStatus.push({
                    name: eventData.name,
                    category: eventData.category,
                    status: 'Deleted'
                });
            }
        }

        displayEvents(eventStatus);
    }, 15000);
}

module.exports = async (client) => {
    const eventsPath = path.join(__dirname, '..', 'events');
    const eventStatus = [];

    function loadEventFolder(folderPath) {
        const category = path.basename(folderPath);
        const eventFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
        
        for (const file of eventFiles) {
            const filePath = path.join(folderPath, file);
            const status = loadEvents(client, category, filePath);
            eventStatus.push(status);
        }
    }

    const eventFolders = fs.readdirSync(eventsPath);
    for (const folder of eventFolders) {
        const folderPath = path.join(eventsPath, folder);
        if (fs.statSync(folderPath).isDirectory()) {
            loadEventFolder(folderPath);
        }
    }

    displayEvents(eventStatus);
    watchEvents(client);
};