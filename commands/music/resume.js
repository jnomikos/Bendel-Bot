module.exports = {
    name: 'resume',
    description: 'Resumes playing song if it is paused',
    directory: __dirname,
    async execute(client, message, args) {
        let guildQueue = client.player.getQueue(message.guild.id);
        if (!guildQueue || !guildQueue.isPlaying) return;

        guildQueue.setPaused(false);
    }

}