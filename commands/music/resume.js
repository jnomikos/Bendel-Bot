module.exports = {
    name: 'resume',
    description: 'Resumes song',
    directory: __dirname,
    async execute(client, message, args) {
        let guildQueue = client.player.getQueue(message.guild.id);
        if (!guildQueue || !guildQueue.isPlaying) return;

        guildQueue.setPaused(false);
    }

}