module.exports = {
    name: 'qloop',
    aliases: ['queueloop', 'ql', '1_qloop'],
    description: 'Toggles looping entire queue.',
    directory: __dirname,
    async execute(client, message, args) {
        let guildQueue = client.player.getQueue(message.guild.id);
        if (!guildQueue || !guildQueue.isPlaying) return;

        if (guildQueue.repeatMode === 2) {
            guildQueue.setRepeatMode(0);
            message.reply("The queue will stop looping now");
        } else {
            guildQueue.setRepeatMode(2); // or 2 instead of RepeatMode.QUEUE
            message.reply("The queue will now start looping");
        }

    }

}