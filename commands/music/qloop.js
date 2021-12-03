module.exports = {
    name: 'qloop',
    aliases: ['queueloop', 'ql'],
    description: 'Loops the entire queue. If queue loop mode is already enabled, stops looping the queue',
    directory: __dirname,
    async execute(client, message, args) {
        let guildQueue = client.player.getQueue(message.guild.id);
        if (!guildQueue || !guildQueue.isPlaying) return;

        if (guildQueue.getRepeatMode() === 2) {
            guildQueue.setRepeatMode(0);
            message.reply("The queue will stop looping now");
        } else {
            guildQueue.setRepeatMode(2); // or 2 instead of RepeatMode.QUEUE
            message.reply("The queue will now start looping");
        }

    }

}