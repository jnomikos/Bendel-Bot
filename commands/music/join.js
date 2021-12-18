const { SlashCommandBuilder } = require('@discordjs/builders')
module.exports = {
    name: 'join',
    aliases: ['j', 'enter'],
    description: 'Joins the voice channel that you are in.',
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Joins the voice channel')
    ,
    directory: __dirname,
    async execute(client, message, args) {
        //let isInteraction = false;
        // if (message.user) {
        //     isInteraction = true;
        //args = args.get('prefix').value;
        //}

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
                // if (isInteraction) {
                message.reply({
                    content: "Joined the voice channel",
                    ephemeral: true
                })
                //}
            } catch (error) {
                console.log("Error in queue join")
                console.log(error);

            }
        }
    }

}