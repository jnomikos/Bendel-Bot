module.exports = {
    name: 'remove',
    arguments: '<song-position>',
    aliases: ['rm'],
    description: 'Removes a song from the queue',
    directory: __dirname,
    async execute(client, message, args) {
        if (parseInt(args[0]) > 0 && guildQueue.songs[parseInt(args[0])]) {
            guildQueue.remove(parseInt(args[0]));
            guildQueue.songs.splice(parseInt(args[0]), 1);
            message.reply(guildQueue.songs[parseInt(args[0])].name || guildQueue.songs[parseInt(args[0])].title)
        }
    }

}