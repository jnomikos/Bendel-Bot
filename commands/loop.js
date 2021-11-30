module.exports = {
    name: 'loop',
    description: 'Loops the current song that is playing. If loop mode is already enabled, stops looping the current song that is playing',
    async execute(client, message, args) {
        let guildQueue = client.player.getQueue(message.guild.id);
        if (!guildQueue || !guildQueue.isPlaying) return;

        if (guildQueue.getRepeatMode() === 1) {
            guildQueue.setRepeatMode(0);
            message.reply("The song will now stop looping")
        } else {
            guildQueue.setRepeatMode(1); // or 1 instead of RepeatMode.SONG
            message.reply("The song will now loop")
        }

    }

}