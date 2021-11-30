module.exports = {
    name: 'stop',
    aliases: ['leave', 'exit'],
    description: 'Stops the queue (if there is one) and the voice channel',
    async execute(client, message, args) {
        let guildQueue = client.player.getQueue(message.guild.id);
        if (guildQueue)
            guildQueue.stop();
    }

}