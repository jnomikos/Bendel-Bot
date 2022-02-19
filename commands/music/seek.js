module.exports = {
    name: 'seek',
    arguments: '<time>',
    description: 'Skips to particular point in music',
    directory: __dirname,
    async execute(client, message, args) {
        let guildQueue = client.player.getQueue(message.guild.id);
        if (!guildQueue || !guildQueue.isPlaying) return;
        console.log("Seek Time: ", guildQueue.nowPlaying.seekTime);
        guildQueue.seek(parseInt(args[0]) * 1000);
    }

}