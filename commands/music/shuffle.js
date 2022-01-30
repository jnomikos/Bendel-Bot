module.exports = {
    name: 'shuffle',
    description: 'Shuffles the queue',
    directory: __dirname,
    async execute(client, message, args) {
        let guildQueue = client.player.getQueue(message.guild.id);
        if (!guildQueue || !guildQueue.isPlaying) return;

        guildQueue.shuffle();
    }

}