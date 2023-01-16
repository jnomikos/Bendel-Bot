const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders')
const lyrics = require('lyrics-finder'); // npm i lyrics-finder
const { client } = require("../..");
const { Permissions } = require('discord.js');
const guildSchema = require('../../database/schema/guild');
const genius = require("genius-lyrics");
const genius_client = new genius.Client(process.env.GENIUS_KEY);
let prevention = require('../../spam-prevention')


module.exports = {
    name: 'play',
    arguments: '<song-url / search-query>',
    aliases: ['p', 'steal'],
    description: 'Play a song',
    directory: __dirname,
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Sets the prefix for your server')
        .addStringOption((option) => option
            .setName('search')
            .setDescription('URL or Search Term')
            .setRequired(true)
        )
    ,
    async execute(client, message, args) {

        if (!message.guild.me.permissions.has(Permissions.FLAGS.CONNECT)) {
            message.reply("I do not have permissions to connect to voice channels").catch(error => {
                // Only log the error if it is not an Unknown Message error
                if (error.code !== 10008) {
                    console.error('Failed to reply to the message:', error);
                }
            });
            return;
        }
        if (!message.guild.me.permissions.has(Permissions.FLAGS.SPEAK)) {
            message.reply("I cannot play music. I do not have speaking permissions").catch(error => {
                // Only log the error if it is not an Unknown Message error
                if (error.code !== 10008) {
                    console.error('Failed to reply to the message:', error);
                }
            });

            return;
        }

        if (args.length < 1) { return; }

        const channel = message.member?.voice.channel;
        if (channel == null) {
            message.reply({
                content: "You must be in a voice channel first!",
            }).catch(error => {
                // Only log the error if it is not an Unknown Message error
                if (error.code !== 10008) {
                    console.error('Failed to reply to the message:', error);
                }
            });
            return;
        }
        let guildQueue = client.player.getQueue(message.guild.id);
        play_music(client, guildQueue, message, args);

    }, song_playing_timeout

}

client.player.on('queueDestroyed', async (queue) => {
    //guildData = await guildSchema.collection.findOne({ guildID: queue.guild.id });
    console.log(queue.guild.id);

    const query = { guildID: queue.guild.id };
    const updateDocument = {
        $set: { song_history: [] }
    };
    const result = await guildSchema.updateOne(query, updateDocument);


})
client.player.on('queueEnd', async (queue) => {
    const query = { guildID: queue.guild.id };
    const updateDocument = {
        $set: { song_history: [] }
    };
    const result = await guildSchema.updateOne(query, updateDocument);
})
client.player.on('clientDisconnect', async (queue) => {
    const query = { guildID: queue.guild.id };
    const updateDocument = {
        $set: { song_history: [] }
    };
    const result = await guildSchema.updateOne(query, updateDocument);
});

client.player.on('queueAdded', (queue, song, message) => {
    console.log("Song added to queue of ", queue.size)
    //console.log(queue.songs.length);
    if (queue.songs.length > 1) {
        //const song_name = ht.includes("soundcloud.com") ? song.title : song;
        //console.log(song_name);

        playing_now = new MessageEmbed()
            .setColor('#c5e2ed')
            .setTitle("Song added to queue: ")
            .setDescription(`${song.name || song.title}`)

            .setTimestamp()



        message.channel.send({
            embeds: [playing_now]
        })
    }
});


client.player.on('songLoaded', (message, queue) => {
    if (queue && queue.songs.length > 0) {
        //if (message.content.includes("https://")) {

        if (!message.content.includes("&list=") && !message.content.includes("playlist") && !message.content.includes("/sets/")) {

            client.player.emit('queueAdded', queue, queue.songs[queue.songs.length - 1], message)

        }
    }
});


function search_action_row_1(videos, len) {
    const r1 = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('choice_1')
                .setLabel('1')
                //.setEmoji('1️⃣')
                .setStyle('PRIMARY')
                .setDisabled(videos[len] === undefined)
        )

        .addComponents(
            new MessageButton()
                .setCustomId('choice_2')
                .setLabel('2')
                // .setEmoji('2️⃣')
                .setStyle('PRIMARY')
                .setDisabled(videos[len + 1] === undefined)
        )

        .addComponents(
            new MessageButton()
                .setCustomId('choice_3')
                .setLabel('3')
                // .setEmoji('3️⃣')
                .setStyle('PRIMARY')
                .setDisabled(videos[len + 2] === undefined)
        )

        .addComponents(
            new MessageButton()
                .setCustomId('choice_4')
                .setLabel('4')
                // .setEmoji('4️⃣')
                .setStyle('PRIMARY')
                .setDisabled(videos[len + 3] === undefined)
        )

        .addComponents(
            new MessageButton()
                .setCustomId('choice_5')
                .setLabel('5')
                // .setEmoji('5️⃣')
                .setStyle('PRIMARY')
                .setDisabled(videos[len + 4] === undefined)
        )
    return r1;
}
function search_action_row_2(videos, len) {
    const r2 = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('choice_back')
                //.setLabel('<')
                .setEmoji('⬅️')
                .setStyle('PRIMARY')
                .setDisabled(len === 0)
        )

        .addComponents(
            new MessageButton()
                .setCustomId('choice_forward')
                //.setLabel('2')
                .setEmoji('➡️')
                .setStyle('PRIMARY')
                .setDisabled(videos[len + 5] === undefined)
        )
    return r2;
}


async function song_playing_timeout(queue, client, message) {

    const channel = message.member?.voice.channel;

    if (!channel) {
        console.log('fail')
        return;
    }
    var timesRun = 0;
    var interval = setInterval(function () {
        timesRun++;
        if (queue.isPlaying === true) {
            console.log("Song run in ", timesRun / 10, "seconds")
            song_now_playing(client, message);
            clearInterval(interval);
        }
        if (timesRun >= 100) {
            clearInterval(interval);
        }
    }, 100);
}


async function play_music(client, guildQueue, message, args) {

    var isInteraction;
    if (message.user) {
        isInteraction = true;
        args = args.get('search').value.split(" ");
    }

    let queue;
    queue = client.player.createQueue(message.guild.id);



    try {
        await queue.join(message.member.voice.channel);
    } catch (error) { // good when the bot is timed out or doesn't have perms
        console.log("Error in queue join")
        console.log(error);
        return;
    }

    const ht = args.toString();

    if (ht.substr(0, 8) === "https://") { // is a link
        let hasMusic = false;
        if (queue.songs.length > 0) {
            hasMusic = true;
        }
        if (ht.includes("&list=") || ht.includes("playlist") || ht.includes("/sets/")) { // checks if link is a playlist
            let isFirst = queue.songs.length === 0;
            // direct integration from soundcloud
            let load_msg = undefined;
            if (ht.includes("open.spotify.com")) {
                load_msg = await message.reply(`\`Loading songs from spotify playlist. This may take a while...\``).catch(error => {
                    // Only log the error if it is not an Unknown Message error
                    if (error.code !== 10008) {
                        console.error('Failed to reply to the message:', error);
                    }
                });
            } else {
                load_msg = await message.reply(`\`Loading songs from the playlist. This may take a while...\``).catch(error => {
                    // Only log the error if it is not an Unknown Message error
                    if (error.code !== 10008) {
                        console.error('Failed to reply to the message:', error);
                    }
                });
            }

            const playlistAdd = function playlistAdd(queue, playlist) {
                message.channel.send(`\`Playlist ${playlist} with ${playlist.songs.length} videos was added to the queue.\``);
            }

            client.player.once('playlistAdd', playlistAdd);
            let song = await queue.playlist(args.join(' ')).then(_ => {
                if (load_msg != undefined) {
                    load_msg.delete().catch(error => {
                        // Only log the error if it is not an Unknown Message error
                        if (error.code !== 10008) {
                            console.error('Failed to delete the message:', error);
                        }
                    });
                }

            }).catch(error => {
                if (!guildQueue || !current_song)
                    queue.stop();

                client.player.removeListener('playlistAdd', playlistAdd);
                //Promise.reject(error);
                //song_chosen = false; // failure
                // return;
            });

            client.player.emit("songLoaded", message, guildQueue);


            if (isFirst) {
                song_playing_timeout(queue, client, message);
            }

        } else { // Else; if the message sent is not a playlist


            let song = await queue.play(args.join(' ')).then(_ => {
                if (queue.songs.length === 1) {
                    song_playing_timeout(queue, client, message);
                }
            }).catch(_ => {
                if (!guildQueue) {
                    queue.stop();
                    console.log("Guild queue stopped");
                }
                //song_chosen = false; // failure
                return;
            });
            client.player.emit("songLoaded", message, guildQueue);

        }


    } else {

        let command = client.commands.get('search');
        command.execute(client, message, args);

    }
}

function duration_converter(time) { // converts decimal to hh:mm:ss
    var hour = time / 3600000;
    var hour_remainder = Math.abs(hour) - Math.floor(hour);
    hour = Math.trunc(hour);

    var minute = hour_remainder * 60;
    var minute_remainder = Math.abs(minute) - Math.floor(minute);
    minute = Math.trunc(minute);

    var second = minute_remainder * 60;
    second = Math.trunc(second);


    if (String(second).length < 2) {
        second = '0' + second;
    }

    if (String(minute).length < 2) {
        minute = '0' + minute;
    }

    if (String(hour).length < 2) {
        hour = '0' + hour;
    }

    return (hour + ":" + minute + ":" + second);
}

function playing_now_embed(current_song) {
    let artist;
    var duration = '\u200B';
    if (current_song.title) {
        duration = duration_converter(current_song.duration);
        if (!current_song.publisher_metadata) {
            artist = current_song.user.username;
        } else if (current_song.publisher_metadata) {
            if (current_song.publisher_metadata.artist) {
                artist = current_song.publisher_metadata.artist;
            } else {
                artist = "n/a"
            }
        } else {
            artist = "n/a"
        }
    } else if (current_song.author) {
        artist = current_song.author;
        duration = current_song.duration;
        if (String(duration).length === 5) {
            duration = "00:" + duration;
        } else if (String(duration).length === 2) {
            duration = "00:00:" + duration;
        }
    } else {
        artist = "n/a"
    }

    playing_now = new MessageEmbed()

        .setColor('#c5e2ed')
        .setTitle("Playing: ")
        //.setDescription(`${current_song.name || current_song.title}`)
        .addFields(
            { name: current_song.name || current_song.title, value: artist },
            //{ name: 'Author', value: current_song.author || current_song.publisher_metadata.artist || "none", inline: true },
            { name: "▬▬▬▬▬▬▬▬▬▬▬▬▬ [ 00:00:00/" + duration + "]", value: '\u200B' },
        )
        .setImage(`${current_song.thumbnail || current_song.artwork_url}`)
        .setTimestamp()
    return playing_now;
}

function action_row_1(guildData = GD) {

    const r = new MessageActionRow()

        .addComponents(
            new MessageButton()
                .setCustomId('1_back')
                .setEmoji('⏮')
                .setStyle('SECONDARY')
                .setDisabled(guildData.song_history[0] && guildQueue.repeatMode === 0 ? false : true)

        )

        .addComponents(
            new MessageButton()
                .setCustomId('1_play-pause')
                .setEmoji(guildQueue.paused === false ? '⏸' : '▶')
                .setStyle(guildQueue.paused === true ? 'SUCCESS' : 'SECONDARY')


        )

        .addComponents(
            new MessageButton()
                .setCustomId('1_next')
                .setEmoji('⏭')
                .setStyle('SECONDARY')

        )

        .addComponents(
            new MessageButton()
                .setCustomId('1_loop')
                .setEmoji(`🔁`)
                .setStyle(guildQueue.repeatMode === 1 ?
                    'DANGER' : 'SECONDARY')

        )

    return r;
}

function action_row_2() {
    const r2 = new MessageActionRow()

        .addComponents(
            new MessageButton()
                .setCustomId('1_qloop')
                .setEmoji('🔂')
                .setStyle(guildQueue.repeatMode === 2 ?
                    'DANGER' : 'SECONDARY')

        )

        .addComponents(
            new MessageButton()
                .setCustomId('1_stop')
                .setEmoji('⏹')
                .setStyle('SECONDARY')

        )

        .addComponents(
            new MessageButton()
                .setCustomId('1_shuffle')
                .setEmoji('🔀')
                .setStyle('SECONDARY')

        )

    return r2;
}

// Handles when errors during song play
const err = async function err(error, queue) {
    console.log(`Error: ${error} in ${queue.guild.name} `);
    console.log(error);
    if (error === "Status code: 403") {
        console.log("403 time?");

        msg.delete().catch(error => {
            // Only log the error if it is not an Unknown Message error
            if (error.code !== 10008) {
                console.error('Failed to delete the message:', error);
            }
        });

        cmd_collector.stop();
        remove_event_listeners();
    }
}


var song_now_playing = async function (client, message) {

    guildQueue = await client.player.getQueue(message.guild.id);
    let current_song = guildQueue.songs[0];
    const filter = i => { // Filter for message component collector
        return i !== undefined && i.customId.substr(0, 2) === '1_';
    }
    const cmd_collector = message.channel.createMessageComponentCollector({ filter, time: 1000 * 7200 }); // 2 hours

    //duration_converter(songDuration);
    //const cmd_collector = message.channel.createMessageComponentCollector({ filter, time: 30 * 1000 });
    //console.log(guildQueue.length)

    const query = { guildID: message.guild.id };
    GD = await guildSchema.findOne(query);
    // this is a function to generate it everytime it is called

    const msg = await message.channel.send({
        message: "",
        embeds: [playing_now_embed(current_song)],
        components: [action_row_1(), action_row_2()]
    });

    // Handles when song is changed
    const songChanged = async function songChanged(queue, newSong, oldSong) {
        console.log("SONG CHANGED!!!!");
        guildData = await guildSchema.findOne({ guildID: queue.guild.id });
        const query = { guildID: queue.guild.id };
        if (!oldSong.url && oldSong.uri) { oldSong.url = oldSong.uri; }

        // Basically ensures that the buttons and embed shows up when the song is actually loaded to prevent errors
        song_playing_timeout(queue, client, message);

        msg.delete().catch(error => {
            // Only log the error if it is not an Unknown Message error
            if (error.code !== 10008) {
                console.error('Failed to delete the message:', error);
            }
        });


        cmd_collector.stop();
        remove_event_listeners();

        if (queue.repeatMode === 1) return;

        const updateDocument = {
            $push: { song_history: oldSong.url }
        };

        const result = await guildSchema.updateOne(query, updateDocument);
    }

    const queueDestroyed = function queueDestroyed(queue) {

        msg.delete().catch(error => {
            // Only log the error if it is not an Unknown Message error
            if (error.code !== 10008) {
                console.error('Failed to delete the message:', error);
            }
        });

        cmd_collector.stop();
        remove_event_listeners();
    }
    const queueEnd = function queueEnd(queue) {
        message.channel.send("The queue has ended 😭");

        msg.delete().catch(error => {
            // Only log the error if it is not an Unknown Message error
            if (error.code !== 10008) {
                console.error('Failed to delete the message:', error);
            }
        });

        cmd_collector.stop();
        remove_event_listeners();
    }




    client.player.on('error', err);
    client.player.on('queueDestroyed', queueDestroyed);
    client.player.on('queueEnd', queueEnd);
    client.player.on('songChanged', songChanged);

    //client.player.emit('error');

    function remove_event_listeners() {
        client.player.removeListener('queueEnd', queueEnd);
        client.player.removeListener('queueDestroyed', queueDestroyed);
        client.player.removeListener('songChanged', songChanged);
        client.player.removeListener('error', err);
    }


    cmd_collector.on('collect', async i => {
        if (i === undefined) { return; }

        await i.deferUpdate();

        if (!client.player.hasQueue(message.guild.id)) { cmd_collector.stop(); }
        guildQueue = await client.player.getQueue(i.guild.id);


        let i_embed = new MessageEmbed().setFooter(`${i.user.tag}`, i.user.displayAvatarURL());





        if (i.customId === '1_play-pause') {
            if (guildQueue.paused === true) {
                guildQueue.setPaused(false);
                msg.edit({
                    embeds: [playing_now_embed(current_song).setTitle("Playing:").setColor('#c5e2ed')],
                    components: [action_row_1(), action_row_2()]
                });
            } else if (guildQueue.paused === false) {
                guildQueue.setPaused(true);
                msg.edit({
                    embeds: [playing_now_embed(current_song).setTitle("Paused:").setColor('#fa251e')],
                    components: [action_row_1(), action_row_2()]
                });
            }


        } else if (i.customId === '1_next') {
            i_embed.setDescription(`Skipped \`${current_song.name || current_song.title}\``).setTimestamp();
            message.channel.send({ embeds: [i_embed] });
            if (guildQueue.songs.length > 1) {
                if (guildQueue.paused === true) {

                    guildQueue.setPaused(false); // resumes the player if skipped because paused skip is weird
                }
                try {
                    skippedSong = guildQueue.skip();
                } catch (error) {
                    message.channel.send("Error skipping the song, please try again");
                }
            } else {
                message.channel.send("The queue has ended");

                guildQueue.stop();
                cmd_collector.stop();
            }

        } else if (i.customId === '1_back') {
            let embed = new MessageEmbed().setFooter(`${i.user.tag}`, i.user.displayAvatarURL()).setDescription("😱 Rewinding! 💿 ");
            msg.edit({
                embeds: [embed],
                components: []
            });

            if (guildQueue.repeatMode === 1) {
                try {
                    skippedSong = guildQueue.skip();
                } catch (error) {
                    console.log(error);
                }
            } else {
                console.log("Rewinding");
                const query = { guildID: message.guild.id };

                guildData = await guildSchema.findOne(query);
                let length = guildData.song_history.length;
                let song = guildData.song_history[length - 1];

                const updateDocument = {
                    $pop: { song_history: 1 }
                };

                console.log(song)

                await guildSchema.updateOne(query, updateDocument);

                let song_2 = await guildQueue.play(song, {
                    index: 0,
                }).catch(_ => {
                    guildQueue.stop();
                });

                skippedSong = await guildQueue.skip();

                const q = { guildID: message.guild.id };
                GD = await guildSchema.findOne(q);
                await msg.edit({
                    embeds: [playing_now_embed(current_song)],
                    components: [action_row_1(GD), action_row_2()]
                });
            }


        } else if (i.customId === '1_loop') {
            if (guildQueue.repeatMode === 1) {
                guildQueue.setRepeatMode(0);
                i_embed.setDescription(`Loop mode has been disabled`).setTimestamp();


            } else {
                guildQueue.setRepeatMode(1);
                i_embed.setDescription(`Loop mode enabled! \`(Press the button again to unloop)\``).setTimestamp();
            }

            // edits msg to change color of the loop button
            msg.edit({
                embeds: [playing_now_embed(current_song)],
                components: [action_row_1(), action_row_2()]
            });

            message.channel.send({ embeds: [i_embed] })
        } else if (i.customId === '1_qloop') {
            if (guildQueue.repeatMode === 2) {
                guildQueue.setRepeatMode(0);
                i_embed.setDescription("Disabled queue loop").setTimestamp();
            } else {
                guildQueue.setRepeatMode(2);
                i_embed.setDescription("The entire queue will now loop").setTimestamp();
            }

            // edits msg to change color of the queue loop button
            msg.edit({
                embeds: [playing_now_embed(current_song)],
                components: [action_row_1(), action_row_2()]
            });

            message.channel.send({
                embeds: [i_embed]
            });
        } else if (i.customId === '1_stop') {
            // checks if user has permission for said command
            i_embed.setDescription(`Stopped the queue`).setTimestamp();
            let command = client.commands.get('leave');
            if (await prevention.spam_prevention(message.guild.id)) {

                message.channel.send({
                    embeds: [i_embed]
                });

                command.execute(client, message);

                msg.delete().catch(error => {
                    // Only log the error if it is not an Unknown Message error
                    if (error.code !== 10008) {
                        console.error('Failed to delete the message:', error);
                    }
                });

                remove_event_listeners();
                //guildQueue.leave();
                cmd_collector.stop();
            }

        } else if (i.customId === '1_shuffle') {
            i_embed.setDescription(`The queue has been shuffled`).setTimestamp();
            message.channel.send({ embeds: [i_embed] });
            guildQueue.shuffle();
        } else {
            cmd_collector.stop();
        }
    });
}

