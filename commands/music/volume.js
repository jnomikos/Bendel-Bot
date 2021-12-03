module.exports = {
    name: 'volume',

    description: 'Sets the volume (from 0 to 100)',
    directory: __dirname,
    async execute(client, message, args) {
        console.log("buh")
        let guildQueue = client.player.getQueue(message.guild.id);
        if (!guildQueue) return;
        if (parseInt(args[0]) >= 0 && parseInt(args[0]) <= 100) {
            guildQueue.setVolume(parseInt(args[0]));
            message.reply("Volume has been set to " + parseInt(args[0]))
        } else {
            message.reply("Error: Volume must be a value between 0 and 100")
        }
    }

}