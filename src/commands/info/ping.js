const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with bot latency'),
        
    cooldown: 5,
    permissions: [],
    
    async execute(interaction, client) {
        try {
            const sent = await interaction.reply({ 
                content: 'Pinging...', 
                fetchReply: true 
            });

            const latency = sent.createdTimestamp - interaction.createdTimestamp;
            const apiLatency = Math.round(client.ws.ping);

            const embed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('🏓 Bong!')
                .addFields(
                    { name: 'Bot Latency', value: `\`${latency}ms\``, inline: true },
                    { name: 'API Latency', value: `\`${apiLatency}ms\``, inline: true }
                )
                .setTimestamp()
                .setFooter({ text: 'Nebula Labs' });

            await interaction.editReply({ content: null, embeds: [embed] });
        } catch (error) {
            console.error('Error in ping command:', error);
            await interaction.reply({ 
                content: 'An error occurred while executing this command.', 
                ephemeral: true 
            });
        }
    }
};