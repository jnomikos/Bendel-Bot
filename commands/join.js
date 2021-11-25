const { joinVoiceChannel, getVoiceConnection, VoiceConnectionStatus, AudioPlayerStatus, VoiceConnection, entersState } = require("@discordjs/voice");
const { VoiceChannel } = require("discord.js");
const { connect_to_channel } = require('../music_commands');

async function play(message) {
    // let guildQueue = client.player.getQueue(message.guild.id);
    //let queue = client.player.createQueue(message.guild.id);
    // await queue.join(message.member.voice.channel);
    // let song = await queue.play(args.join(' ')).catch(_ => {
    //      if (!guildQueue)
    //          queue.stop();
    //  });
}

module.exports = {
    name: 'join',
    description: 'Joins voice channel',

    async execute(channel) {
        try {
            const connection = await connect_to_channel(channel);
            return connection;
        } catch (error) {
            console.log(error);
        }
        //channel = connect_to_channel(channel);
    }
}


