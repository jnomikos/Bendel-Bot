module.exports = {
    name: 'stop',
    aliases: ['s', 'exit', 'leave', 'l'],
    description: 'Stops the queue (if there is one) and the voice channel',
    directory: __dirname,
    async execute(client, message, args) {
        let guildQueue = client.player.getQueue(message.guild.id);
        if (guildQueue)
            guildQueue.stop();
    }

}