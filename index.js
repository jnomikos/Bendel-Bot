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
//const connection = getVoiceConnection(myVoiceChannel.guild.id);


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
const { play_music, song_now_playing, song_playing_timeout } = require('./music_commands');

const { EventEmitter } = require('stream');
class MyEmitter extends EventEmitter { }
const myEmitter = new MyEmitter();

const player = new Player(client, {
    leaveOnEmpty: false, // This options are optional.
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

    // Two types of slash commands
    // guild
    // global

    // global cmds take 1 hr to register
    // make sure to have tested bot before registering global cmd
    const guildId = '904553034892333066';
    const guild = client.guilds.cache.get(guildId)
    let commands;

    if (guild) {
        console.log("Bot test initiated");
        commands = guild.commands;
    } else {
        commands = client.application?.commands;
    }
    client.commands?.get('play');
    client.commands?.get('join');
    client.commands?.get('leave');


    commands?.create({
        name: 'add',
        description: 'Adds two numbers.',
        options: [
            {
                name: "num1",
                description: "First number",
                required: true,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.NUMBER,

            },

            {
                name: "num2",
                description: "Second number",
                required: true,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.NUMBER,
            }

        ]
    })

    commands?.create({
        name: 'multiply',
        description: 'Multiplies two numbers',
        options: [
            {
                name: "num1",
                description: "First number",
                required: true,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.NUMBER,
            },

            {
                name: "num2",
                description: "Second number",
                required: true,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.NUMBER,
            }

        ]
    })



})

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

connection = joinVoiceChannel;

/*
client.on("messageCreate", async (message) => {
    //const data = await prefix.findOne({
    //    GuildID: message.guild.id
    // });

    //const prefix = (data != undefined) ? data.prefix : '-';


    if (!message.content.startsWith(prefix) || message.author.bot) { return; }
    // Line that excludes Quentin some of the time
    if (message.author.id === quentin_id) {
        var x = getRandomInt(1, 6);
        if (x != 1) {
            message.reply({ embeds: [severe_error] });
            console.log("Quentin Excluded");
            return;
        }
    }

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();
    let guildQueue = client.player.getQueue(message.guild.id);

    var song_listener_once; // only creates listener if queue is empty


    if (command === "join") {
        const channel = message.member?.voice.channel;
        if (channel == null) {
            message.reply({
                content: "You must be in a voice channel first!",
            })
            return;
        } else {
            let queue = client.player.createQueue(message.guild.id);
            try {
                await queue.join(message.member.voice.channel);
            } catch (error) {
                console.log("Error in queue join")
                console.log(error);

            }
            //client.commands.get('join').execute(channel);
            //message.reply({
            //    content: `Joined ${channel.name}`,
            //})
        }
    } else if (command === "play") {
        if (args.length < 1) { return; }
        //if (cooldown === true) { return; }

        //if (cooldown === false) {
        //cooldown = true;

        // setTimeout(() => {

        //    cooldown = false;

        // }, 3000)
        command_queue_add(client, guildQueue, message, args);
        //play_music(client, guildQueue, message, args);
        //}





    }



    if (guildQueue) {
        if (command === 'stop' || command === 'leave') {
            guildQueue.stop();
        } else if (command === 'skip') {
            if (guildQueue.paused === true) {

                guildQueue.setPaused(false); // resumes the player if skipped because paused skip is weird

            }
            skippedSong = await guildQueue.skip();

            if (skippedSong !== undefined) {
                //song_playing_timeout(guildQueue, client, message);
                client.player.once('songChanged', (queue, newSong, oldSong) => {
                    console.log("Yeah song first")
                    //song_playing_timeout(queue, client, message);
                    //song_now_playing(client, message);
                })

            } else {
                console.log("buh")
                guildQueue.stop();
            }
        } else if (command === 'loop') {
            if (guildQueue.getRepeatMode() === 1) {
                guildQueue.setRepeatMode(0);
            } else {
                guildQueue.setRepeatMode(RepeatMode.SONG); // or 1 instead of RepeatMode.SONG
            }


        } else if (command === 'queueloop' || command === 'qloop') {

            if (guildQueue.getRepeatMode() === 2) {
                guildQueue.setRepeatMode(0);
            } else {
                guildQueue.setRepeatMode(RepeatMode.QUEUE); // or 2 instead of RepeatMode.QUEUE
            }
        } else if (command === 'volume') {
            if (parseInt(args[0]) >= 0 && parseInt(args[0]) <= 100) {
                guildQueue.setVolume(parseInt(args[0]));
                message.reply("Volume has been set to " + parseInt(args[0]))
            } else {
                message.reply("Error: Volume must be a value between 0 and 100")
            }
        } else if (command === 'shuffle') {
            message.reply("The queue has been shuffled")
            guildQueue.shuffle();
        } else if (command === 'pause') {
            try {
                guildQueue.setPaused(true);
                const exampleEmbed = new MessageEmbed()
                    .setColor('#cc0000')

                    .setURL('https://discord.js.org/')
                    .setAuthor('Some name', 'https://i.imgur.com/AfFp7pu.png', 'https://discord.js.org')
                    .setDescription('Some description here')
                    .setThumbnail('https://i.imgur.com/AfFp7pu.png')
                    .addFields(
                        { name: 'Regular field title', value: 'Some value here' },
                        { name: '\u200B', value: '\u200B' },
                        { name: 'Inline field title', value: 'Some value here', inline: true },
                        { name: 'Inline field title', value: 'Some value here', inline: true },
                    )
                    .addField('Inline field title', 'Some value here', true)
                    .setImage('https://i.imgur.com/AfFp7pu.png')
                    .setTimestamp()
                    .setFooter('Some footer text here', 'https://i.imgur.com/AfFp7pu.png');

            } catch (error) {
                console.log("Error in pause")
                console.log(error);
            }
            message.reply("The queue has been shuffled")
        } else if (command === 'resume') {
            guildQueue.setPaused(false);
        } else if (command === 'remove') {

            if (parseInt(args[0]) > 0 && guildQueue.songs[parseInt(args[0])]) {
                guildQueue.remove(parseInt(args[0]));
                guildQueue.songs.splice(parseInt(args[0]), 1);
                message.reply(guildQueue.songs[parseInt(args[0])].name || guildQueue.songs[parseInt(args[0])].title)
            }
        }
    }



})
*/

client.on("interactionCreate", async (interaction) => {
    let msgTimeout = null;
    var quentin_delay = 0;
    if (!interaction.isCommand()) { return; }

    if (interaction.member.id === quentin_id) {
        var x = getRandomInt(1, 5);
        quentin_delay += 10000
        if (x === 1) {
            console.log("Quentin Excluded");
            return;
        }


    }
    const { commandName, options } = interaction;

    await interaction.deferReply({})
    await new Promise(resolve => setTimeout(resolve, quentin_delay));

    if (commandName === "add") {

        // the || 0 stops nulls from being input
        const num1 = options.getNumber('num1') || 0;
        const num2 = options.getNumber('num2') || 0;

        interaction.editReply({
            content: `${num1} + ${num2} = ${num1 + num2}`,
        })

    } else if (commandName === "multiply") {
        const num1 = options.getNumber('num1') || 0;
        const num2 = options.getNumber('num2') || 0;

        interaction.editReply({
            content: `${num1} * ${num2} = ${num1 * num2}`,
            ephemeral: true
        })
    } else if (commandName === "join") {
        const channel = interaction.member?.voice.channel;
        if (channel == null) {
            interaction.editReply({
                content: "You must be in a voice channel first!",
            })
            return;
        } else {
            connection = client.commands.get('join').execute(channel);
            interaction.editReply({
                content: `Joined ${channel.name}`
            })

        }

    } else if (commandName === "leave") {
        await interaction.deferReply({})
        connection = client.commands.get('leave').execute();
        interaction.editReply({
            content: `Left the voice channel`
        })
    } else if (commandName === "play") {

    }
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