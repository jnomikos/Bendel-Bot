//import DiscordJS, { Intents } from 'discord.js'
const DiscordJS = require('discord.js');
const { Intents, MessageEmbed, Collection } = require('discord.js');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
//const prefix = require('./models/prefix')
const prefix = '-'
const { generateDependencyReport, VoiceConnection, joinVoiceChannel, entersState } = require('@discordjs/voice');
// prints in consoles if all dependencies for a voice bot are met
console.log(generateDependencyReport());

const fs = require('fs'); // for using other js files


var quentin_id = 290956491102486528;


dotenv.config();

const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS

    ]
});

client.commands = new Collection();
const { Player, Utils, RepeatMode } = require("discord-music-player");
const { severe_error } = require('./embeds');


const { EventEmitter } = require('stream');
class MyEmitter extends EventEmitter { }
const myEmitter = new MyEmitter();

const player = new Player(client, {
    leaveOnEmpty: true, // This options are optional.
    leaveOnEnd: true,
    timeout: 600 * 1000,
    leaveOnStop: true,

});
client.player = player;

client.player
    // Emitted when channel was empty.
    .on('channelEmpty', (queue) =>
        console.log(`Everyone left the Voice Channel, queue ended.`))
    // Emitted when a song was added to the queue.
    .on('songAdd', (queue, song) =>
        console.log(`Song added`))

    // Emitted when a playlist was added to the queue.
    .on('playlistAdd', (queue, playlist) =>
        console.log(`Playlist ${playlist} with ${playlist.songs.length} was added to the queue.`))
    // Emitted when there was no more music to play.
    .on('queueDestroyed', (queue) =>
        console.log(`The queue was destroyed.`))
    // Emitted when the queue was destroyed (either by ending or stopping).    
    .on('queueEnd', (queue) =>
        console.log(`The queue has ended.`))
    // Emitted when a song changed.
    .on('songChanged', (queue, newSong, oldSong) =>
        console.log(`${newSong} is now playing.`))
    // Emitted when a first song in the queue started playing.
    .on('songFirst', (queue, song) =>
        console.log(`${song.name || song.title} is now playing.`))
    // Emitted when someone disconnected the bot from the channel.
    .on('clientDisconnect', (queue) =>
        console.log(`I was kicked from the Voice Channel, queue ended.`))
    // Emitted when deafenOnJoin is true and the bot was undeafened
    .on('clientUndeafen', (queue) =>
        console.log(`I got undefeanded.`))
    .on('song_change', (queue) =>
        console.log(`Song changed`))
    // Emitted when there was an error in runtime
    .on('error', (error, queue) => {
        console.log(`Error: ${error} in ${queue.guild.name} `);
    });




client.on('ready', () => {
    console.log("The bot is ready");
    let handler = require("./command-handler")
    if (handler.default) {
        handler = handler.default;
    }

    handler(client);

    client.user.setActivity(`Bendel Music | -help`, { type: "LISTENING" });
})








module.exports = { client, player, myEmitter };
mongoose.connect(process.env.MONGODB_SRV, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    //userFindAndModify: false
}).then(() => {
    console.log("Connected to the database!")
}).catch((error) => {
    console.log(error)
});
client.login(process.env.TOKEN);