module.exports = {
    name: 'loop',
    aliases: ['1_loop'],
    directory: __dirname,
    description: 'Toggles looping the current song.',
    async execute(client, message, args) {
        let guildQueue = client.player.getQueue(message.guild.id);
        if (!guildQueue || !guildQueue.isPlaying) return;

        if (guildQueue.repeatMode === 1) {
            guildQueue.setRepeatMode(0);
            message.reply("The song will now stop looping")
        } else {
            guildQueue.setRepeatMode(1); // or 1 instead of RepeatMode.SONG
            message.reply("The song will now loop")
        }

    }

}