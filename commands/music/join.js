module.exports = {
    name: 'join',
    aliases: ['j', 'enter'],
    description: 'Joins the voice channel that you are in.',
    directory: __dirname,
    async execute(client, message, args) {
        const channel = message.member?.voice.channel;
        let guildQueue = client.player.getQueue(message.guild.id);
        //if (guildQueue) return;
        if (guildQueue)
            guildQueue.stop();

        if (channel == null) {
            message.reply({
                content: "You must be in a voice channel first!",
            })
            return;
        } else {
            let queue = client.player.createQueue(message.guild.id);
            try {
                console.log("VOICE: ", message.member.voice.channel.id)
                await queue.join(message.member.voice.channel);
            } catch (error) {
                console.log("Error in queue join")
                console.log(error);

            }
        }
    }

}