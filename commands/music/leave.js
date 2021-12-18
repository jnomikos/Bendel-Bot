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

    async interact(client, interaction) {
        this.execute(client, interaction)
    },

    async execute(client, message, args) {
        const channel = message.member?.voice.channel;
        if (channel === null) {
            message.reply({
                content: "You must be in a voice channel to use this.",
                ephemeral: true
            })
        }
        let guildQueue = client.player.getQueue(message.guild.id);

        if (guildQueue)
            guildQueue.stop();
    }

}