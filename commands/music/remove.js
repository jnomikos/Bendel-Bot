module.exports = {
    name: 'remove',
    arguments: '<song-position>',
    aliases: ['rm'],
    description: 'Removes a song from the queue',
    slash_command: true,
    directory: __dirname,
    async execute(client, message, args) {
        let guildQueue = client.player.getQueue(message.guild.id);
        if (guildQueue && parseInt(args[0]) > 0 && guildQueue.songs[parseInt(args[0])]) {
            //guildQueue.remove(parseInt(args[0]));
            message.reply(`Removed \`${guildQueue.songs[parseInt(args[0])].name || guildQueue.songs[parseInt(args[0])].title}\``)
            guildQueue.songs.splice(parseInt(args[0]), 1);

        }
    }

}