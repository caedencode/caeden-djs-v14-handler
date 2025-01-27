const { EmbedBuilder, Collection, REST, Routes } = require('discord.js');
const logger = require('../utils/logger');
const config = require('../../config.json');
const Table = require('cli-table3');
const fs = require('fs');
const path = require('path');

const commands = [];
const commandCache = new Map();

function displayCommandTable(loadedCommands) {
    const table = new Table({
        head: ['Command', 'Category', 'Status', 'Cooldown', 'Permissions'],
        colWidths: [20, 15, 10, 10, 30],
        style: { head: ['cyan'] }
    });

    loadedCommands.forEach(cmd => {
        table.push([
            cmd.name,
            cmd.category,
            cmd.status,
            cmd.cooldown || '3s',
            cmd.permissions?.join(', ') || 'None'
        ]);
    });

    console.log('\nLoaded Commands:');
    console.log(table.toString());
}

async function load(client) {
    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandFolders = fs.readdirSync(commandsPath);
    commands.length = 0;
    const loadedCommands = [];

    for (const folder of commandFolders) {
        const folderPath = path.join(commandsPath, folder);
        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const filePath = path.join(folderPath, file);
            try {
                delete require.cache[require.resolve(filePath)];
                const command = require(filePath);

                if ('data' in command && 'execute' in command) {
                    client.commands.set(command.data.name, command);
                    commands.push(command.data.toJSON());
                    commandCache.set(filePath, { 
                        name: command.data.name, 
                        timestamp: Date.now() 
                    });
                    loadedCommands.push({
                        name: command.data.name,
                        category: folder,
                        status: 'Loaded',
                        cooldown: command.cooldown,
                        permissions: command.permissions
                    });
                    logger.info(`Loaded command: ${command.data.name}`);
                }
            } catch (error) {
                loadedCommands.push({
                    name: file.replace('.js', ''),
                    category: folder,
                    status: 'Error',
                    cooldown: 'N/A',
                    permissions: ['Error loading']
                });
                logger.error(`Failed to load command ${file}:`, error);
            }
        }
    }
    displayCommandTable(loadedCommands);
}

async function register() {
    const rest = new REST().setToken(config.bot.DISCORD_TOKEN);

    try {
        logger.info('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(config.bot.APP_ID),
            { body: commands }
        );

        /* Guild Only Registration
        await rest.put(
            Routes.applicationGuildCommands(config.bot.APP_ID, 'GUILD_ID_HERE'),
            { body: commands }
        );
        */

        logger.info('Successfully reloaded application (/) commands.');
    } catch (error) {
        logger.error('Error registering commands:', error);
    }
}

function watchCommands(client) {
    setInterval(async () => {
        const commandsPath = path.join(__dirname, '..', 'commands');
        const trackedFiles = new Set();

        function scanDirectory(dirPath) {
            const items = fs.readdirSync(dirPath);

            for (const item of items) {
                const itemPath = path.join(dirPath, item);
                const stats = fs.statSync(itemPath);

                if (stats.isDirectory()) {
                    scanDirectory(itemPath);
                } else if (item.endsWith('.js')) {
                    trackedFiles.add(itemPath);
                    const cachedCommand = commandCache.get(itemPath);
                    
                    if (!cachedCommand || stats.mtime.getTime() > cachedCommand.timestamp) {
                        try {
                            delete require.cache[require.resolve(itemPath)];
                            const command = require(itemPath);

                            if ('data' in command && 'execute' in command) {
                                client.commands.set(command.data.name, command);
                                const existingIndex = commands.findIndex(cmd => cmd.name === command.data.name);
                                if (existingIndex > -1) {
                                    commands[existingIndex] = command.data.toJSON();
                                } else {
                                    commands.push(command.data.toJSON());
                                }
                                commandCache.set(itemPath, { name: command.data.name, timestamp: Date.now() });
                                logger.info(`Reloaded command: ${command.data.name}`);
                                register();
                            }
                        } catch (error) {
                            logger.error(`Error reloading command ${item}:`, error);
                        }
                    }
                }
            }
        }

        scanDirectory(commandsPath);

        for (const [filePath, commandData] of commandCache.entries()) {
            if (!trackedFiles.has(filePath)) {
                logger.info(`Detected deleted command: ${commandData.name}`);
                client.commands.delete(commandData.name);
                commands.splice(commands.findIndex(cmd => cmd.name === commandData.name), 1);
                commandCache.delete(filePath);
                register();
            }
        }
    }, 15000);
}

module.exports = async (client) => {
    client.cooldowns = new Collection();

    await load(client);
    await register();
    watchCommands(client);

    client.on('interactionCreate', async (interaction) => {
        if (!interaction.isChatInputCommand()) return;

        const command = client.commands.get(interaction.commandName);
        if (!command) return;

        if (!client.cooldowns.has(command.name)) {
            client.cooldowns.set(command.name, new Collection());
        }

        const now = Date.now();
        const timestamps = client.cooldowns.get(command.name);
        const cooldownAmount = (command.cooldown || 3) * 1000;

        if (timestamps.has(interaction.user.id)) {
            const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000;
                const cooldownEmbed = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('⏰ Cooldown')
                    .setDescription(`Please wait ${timeLeft.toFixed(1)} more seconds before using \`${command.name}\``)
                    .setTimestamp();
                
                return interaction.reply({ embeds: [cooldownEmbed], ephemeral: true });
            }
        }

        timestamps.set(interaction.user.id, now);
        setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

        if (command.permissions) {
            const userPerms = interaction.member.permissions;
            if (!userPerms.has(command.permissions)) {
                const permError = new EmbedBuilder()
                    .setColor('#ff0000')
                    .setTitle('⛔ Permission Denied')
                    .setDescription(`You need ${command.permissions.join(', ')} permissions to use this command.`)
                    .setTimestamp();
                
                return interaction.reply({ embeds: [permError], ephemeral: true });
            }
        }

        try {
            await command.execute(interaction, client);
            logger.info(`${interaction.user.tag} used /${command.name}`);
        } catch (error) {
            logger.error(`Error executing ${command.name}:`, error);

            const errorEmbed = new EmbedBuilder()
                .setColor('#ff0000')
                .setTitle('⚠️ Error')
                .setDescription('An error occurred while executing this command.')
                .addFields({ 
                    name: 'Error Details', 
                    value: `\`\`\`${error.message}\`\`\`` 
                })
                .setTimestamp()
                .setFooter('Caedens DJS V14 Command Handler.');
            if (interaction.replied || interaction.deferred) {
                await interaction.editReply({ embeds: [errorEmbed] });
            } else {
                await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }
        }
    });
};