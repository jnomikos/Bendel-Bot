const { SlashCommandBuilder } = require('@discordjs/builders')
const { Permissions } = require('discord.js');
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

        if (!message.guild.me.permissions.has(Permissions.FLAGS.CONNECT)) {
            message.reply("I do not have permissions to connect to voice channels")
            return;
        }

        const channel = message.member?.voice.channel;
        let guildQueue = client.player.getQueue(message.guild.id);
        //if (guildQueue) return;
        if (guildQueue)
            guildQueue.stop();

        if (channel == null) {
            message.reply({
                content: "Uh oh! 😲 You must be in a voice channel to use this.",
                ephemeral: true
            })
            return;
        } else {
            let queue = client.player.createQueue(message.guild.id);
            try {
                console.log("VOICE: ", message.member.voice.channel.id)
                await queue.join(message.member.voice.channel);
                // if (isInteraction) {
                message.reply({
                    content: "Joined the voice channel 🔥",
                    ephemeral: true
                })
                //}
            } catch (error) {
                console.log("Error in queue join")
                console.log(error);
                return;
            }
        }
    }

}