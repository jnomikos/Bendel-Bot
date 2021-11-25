
const { generateDependencyReport, VoiceConnection, joinVoiceChannel } = require('@discordjs/voice');
const { getVoiceConnection } = require('@discordjs/voice');
const { Player } = require("discord-music-player");


module.exports = {
    name: 'play',
    description: 'Plays a song',
    execute(client, guildQueue, message, args) {


        message.reply({

        })
    },

    interact(client, guildQueue, interaction, args) { }

}