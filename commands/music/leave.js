const { SlashCommandBuilder } = require('@discordjs/builders')
module.exports = {
    name: 'leave',
    aliases: ['stop', 'exit', 'leave', 'l'],
    description: 'Stops the queue and leaves the voice channel',
    directory: __dirname,
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Stops the queue and leaves the voice channel')
    ,


    async execute(client, message, args) {
        const channel = message.member?.voice.channel;
        if (channel === null) {
            message.reply({
                content: "Uh oh! 😲 You must be in a voice channel to use this.",
                ephemeral: true
            })
            return;
        }

        let guildQueue = client.player.getQueue(message.guild.id);
        if (guildQueue) {
            guildQueue.stop();
            message.reply({
                content: "Left the voice channel! 😭",
                ephemeral: true
            })
        } else {
            message.reply({
                content: "I am not connected to a voice channel...",
                ephemeral: true
            })
        }


    }

}