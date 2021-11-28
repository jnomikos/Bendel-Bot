const { joinVoiceChannel, VoiceConnectionStatus, entersState } = require("@discordjs/voice");

const { MessageEmbed, MessageActionRow, MessageButton, Util } = require("discord.js");
const yts = require("yt-search");
const { exampleEmbed, severe_error, loading_message } = require("./embeds");
const scdl = require('soundcloud-downloader').default;


const events = require('events');
const eventEmitter = new events.EventEmitter();
const DiscordJS = require("discord.js")

const util = require('util');


//let connection; // we want the same connection to be available to all commands
var isConnected;

async function song_playing_timeout(queue, client, message) {
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


async function connect_to_channel(channel) {
    if (channel === null) { return; }
    connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator,
    });

    connection.on('stateChange', (oldState, newState) => {
        console.log(`Connection transitioned from ${oldState.status} to ${newState.status}`);
        if (newState.status === "ready") {
            isConnected = true;
        } else {
            isConnected = false;
        }
    });

    try {
        console.log("Joined a voice channel");
        await entersState(connection, VoiceConnectionStatus.Ready, 3e5);
        return true;
    } catch (error) {
        console.log << "error";
        connection.destroy();
        throw error;
    }
}

function is_connected() { return isConnected; }


async function leave_channel() {
    try {
        connection.destroy();
    } catch (error) {
        console.log("Error in leaving channel")
        console.log(error);
    }
}

async function play_music(client, guildQueue, message, args) {

    function loading_message() {
        message.reply("Hold on a second, the music is loading...")
    }


    const channel = message.member?.voice.channel;
    if (channel == null) {
        message.reply({
            content: "You must be in a voice channel first!",
        })
        return;
    }




    //client.commands.get('join').execute(channel); // joins the desired channel
    let queue = client.player.createQueue(message.guild.id);
    try {
        await queue.join(message.member.voice.channel);
    } catch (error) {
        console.log("Error in queue join")
        console.log(error);
    }

    /*
    P's promise is that a song is chosen. If so, it will display song chosen message
    */
    let song_chosen = new Promise(async function (resolve, reject) {
        const ht = args.toString();

        if (ht.substr(0, 8) === "https://") { // is a link
            let hasMusic = false;
            if (queue.songs.length > 0) {
                hasMusic = true;
            }
            if (ht.includes("list=") || ht.includes("playlist") || ht.includes("sets")) { // checks if link is a playlist
                let isFirst = queue.songs.length === 0;
                // direct integration from soundcloud

                var worked = true;
                let song = await queue.playlist(args.join(' ')).catch(error => {
                    if (!guildQueue || !guildQueue.songs[0])
                        queue.stop();
                    //Promise.reject(error);
                    //song_chosen = false; // failure
                    // return;

                    worked = false;
                });


                if (isFirst && worked === true) {
                    song_playing_timeout(queue, client, message);
                    //song_now_playing(client, message)
                }
                //if (isFirst && (song.songs !== undefined))
                //    song_now_playing(client, message)
                //else { song_now_playing(client, message) }

                //if (!hasMusic) {
                //song_now_playing(message, song);
                //}

            } else { // Else; if the message sent is not a playlist
                let song = await queue.play(args.join(' ')).catch(_ => {
                    if (!guildQueue) {
                        queue.stop();
                        console.log("Guild queue stopped");
                    }
                    //song_chosen = false; // failure
                    return;
                });
                if (queue.songs.length === 1) {
                    song_now_playing(client, message)
                }
            }
            resolve();

        } else {
            console.log("Searching..."); // TODO: tell user of it searching

            //const { videos } = await yts(args.join(" "));

            // Uses yt-search package to search youtube for search term
            var opts = { query: args.join(" "), length: 5 }
            const r = await yts(opts);
            console.log(r.videos);
            const videos = r.videos; // TODO: Make it only add 6 items to improve performance
            const filter = i => { // Filter for message component collector for buttons. Put it up here so it can be used in multiple areas
                console.log("BA", message.author.id === i.user.id, i !== undefined, i.customId.substr(0, 6) === 'choice');

                console.log(i.customId.substr(0, 6))
                return (message.author.id === i.user.id) && i !== undefined && i.customId.substr(0, 6) === 'choice';
            }
            const coll = message.channel.createMessageComponentCollector({ filter, time: 15 * 1000 });


            // If no videos were found from the search
            if (!videos.length) return message.channel.send("Yeah uhh.. no songs were found. Sorry!");
            var len = 0;

            function search_screen_embed(len) {
                search_screen = new MessageEmbed()
                    .setColor('#c5e2ed')
                    .setTitle(`Showing results for: ${args.join(" ")}`)
                    //.setThumbnail('https://c.tenor.com/NjavXXAMRD8AAAAC/sound.gif')
                    .setDescription("Type the number of what you want to play:")

                    .addFields(
                        {
                            name: videos[len] ? `:one: ${videos[len].title}` : `none`,

                            value: videos[len] ? `Author: ${videos[len].author.name}, Duration: [${videos[0].timestamp}]` : `none`,


                        },
                        {
                            name: videos[len + 1] ? `:two: ${videos[len + 1].title}` : `none`,

                            value: videos[len + 1] ? `Author: ${videos[len + 1].author.name}, Duration: [${videos[len + 1].timestamp}]` : `none`,

                        },
                        {
                            name: videos[len + 2] ? `:three: ${videos[len + 2].title}` : `none`,

                            value: videos[len + 2] ? `Author: ${videos[len + 2].author.name}, Duration: [${videos[len + 2].timestamp}]` : `none`,

                        },
                        {
                            name: videos[len + 3] ? `:four: ${videos[len + 3].title}` : `none`,

                            value: videos[len + 3] ? `Author: ${videos[len + 3].author.name}, Duration: [${videos[len + 3].timestamp}]` : `none`,

                        },
                        {
                            name: videos[len + 4] ? `:five: ${videos[len + 4].title}` : `none`,

                            value: videos[len + 4] ? `Author: ${videos[len + 4].author.name}, Duration: [${videos[len + 4].timestamp}]` : `none`,

                        },
                    )
                    .setTimestamp()
                return search_screen;
            }


            function row1(len) {
                const r1 = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId('choice_1')
                            .setLabel('1')
                            //.setEmoji('1️⃣')
                            .setStyle('PRIMARY')
                            .setDisabled(videos[0] === undefined)
                    )

                    .addComponents(
                        new MessageButton()
                            .setCustomId('choice_2')
                            .setLabel('2')
                            // .setEmoji('2️⃣')
                            .setStyle('PRIMARY')
                            .setDisabled(videos[1] === undefined)
                    )

                    .addComponents(
                        new MessageButton()
                            .setCustomId('choice_3')
                            .setLabel('3')
                            // .setEmoji('3️⃣')
                            .setStyle('PRIMARY')
                            .setDisabled(videos[2] === undefined)
                    )

                    .addComponents(
                        new MessageButton()
                            .setCustomId('choice_4')
                            .setLabel('4')
                            // .setEmoji('4️⃣')
                            .setStyle('PRIMARY')
                            .setDisabled(videos[3] === undefined)
                    )

                    .addComponents(
                        new MessageButton()
                            .setCustomId('choice_5')
                            .setLabel('5')
                            // .setEmoji('5️⃣')
                            .setStyle('PRIMARY')
                            .setDisabled(videos[4] === undefined)
                    )
                return r1;
            }
            function row2(len) {
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
                            .setDisabled(!videos[len + 5])
                    )
                return r2;
            }
            search = search_screen_embed(len);
            const r1 = row1(len);
            const r2 = row2(len);
            await message.reply({
                embeds: [search],
                components: [r1, r2],
            })
            //message.member.id





            coll.on('collect', async i => {
                await i.deferUpdate();
                if (i.customId === 'choice_back') {
                    len -= 5;
                    i.editReply({ // loading reply
                        content: "Hold on a second, adding the video...",
                        embeds: [search_screen_embed(len)],
                        components: [row1(len), row2(len)]
                    });
                } else if (i.customId === 'choice_forward') {
                    len += 5;
                    i.editReply({ // loading reply
                        content: "Hold on a second, adding the video...",
                        embeds: [search_screen_embed(len)],
                        components: [row1(len), row2(len)]
                    });
                } else {

                    var choice;
                    if (i.customId === 'choice_1') {
                        choice = 0;
                    } else if (i.customId === 'choice_2') {
                        choice = 1;
                    } else if (i.customId === 'choice_3') {
                        choice = 2;
                    } else if (i.customId === 'choice_4') {
                        choice = 3;
                    } else if (i.customId === 'choice_5') {
                        choice = 4;
                    } else {
                        return;
                    }

                    i.editReply({ // loading reply
                        content: "Hold on a second, adding the video...",
                        embeds: [],
                        components: []
                    });

                    if (videos[choice + len] === undefined) {
                        Promise.reject(new Error('fail')).then(console.error(error));
                        console.error("Song chosen was undefined");
                        return;
                    }

                    let song = await queue.play(videos[choice + len].url).catch(_ => {
                        if (!guildQueue) {
                            queue.stop();
                            console.log("Guild queue stopped");
                        }
                        Promise.reject(new Error('fail')).then(console.error(error));
                        console.log("Catch");
                    });
                    resolve();
                    if (queue.songs.length === 1) {
                        song_now_playing(client, message)
                    }

                    coll.stop();
                }
                // i.editReply({
                //     content: `Now playing: ${videos[choice].title}`,
                //     embeds: [],
                //    components: []
                //})

                //console.log("first", song_chosen);
            });

            //console.log("second", song_chosen);
        }
    });
    //console.log("third", song_chosen);



    //if (song_chosen === true) {
    const consumer = () => {
        song_chosen.then(

            result => {
                console.log("Resolved");
                client.player.once('songAdd', (queue, song) => {
                    console.log("Song added to queue of ", queue.size)
                    if (queue.size !== 0) {
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
                })

            },

            error => {

                console.log("AAAAAAAAA WTF!")
                console.log(error);

            }
        );
    }

    consumer();

}


var song_now_playing = async function (client, message) {


    const filter = i => { // Filter for message component collector
        return (message.author.id === i.user.id) && i !== undefined && i.customId.substr(0, 6) !== 'choice';
    }

    guildQueue = await client.player.getQueue(message.guild.id);
    //const cmd_collector = message.channel.createMessageComponentCollector({ filter });
    const cmd_collector = message.channel.createMessageComponentCollector({ filter, time: 10000 * 50 });


    function duration_converter(time) { // converts mm:ss to decimal
        if (time.split(':').length === 2) {
            var minutes = parseInt(time.substr(0, 2));
            var seconds = parseInt(time.substr(3, 5));
            seconds *= (1 / 60);
            return minutes + seconds;
        } else if (time.split(':').length === 3) {
            //var hours = parseInt(time.substr(0, 2));
            //var minutes = parseInt(time.substr(3, 5)) * (1 / 60);
            //var seconds = parseInt(time.substr(5, 7)) * (1 / 3600);
            //return hours + minutes + seconds;
        }
    }

    //duration_converter(songDuration);
    //const cmd_collector = message.channel.createMessageComponentCollector({ filter, time: 30 * 1000 });
    //console.log(guildQueue.length)
    let current_song = guildQueue.songs[0];
    //console.log(current_song)

    let artist;
    if (current_song.title) {
        if (!current_song.publisher_metadata.artist) {
            artist = current_song.user.username;
        } else if (current_song.publisher_metadata.artist) {
            artist = current_song.publisher_metadata.artist;
        } else {
            artist = "n/a"
        }
    } else if (current_song.author) {
        artist = current_song.author;
    } else {
        artist = "n/a"
    }

    playing_now = new MessageEmbed()
        .setColor('#c5e2ed')
        .setTitle("Playing: ")
        //.setDescription(`${guildQueue.songs[0].name || current_song.title}`)
        .addFields(
            { name: guildQueue.songs[0].name || current_song.title, value: artist },
            { name: '\u200B', value: '\u200B' },
            //{ name: 'Author', value: current_song.author || current_song.publisher_metadata.artist || "none", inline: true },
            { name: 'Inline field title', value: 'Some value here', inline: true },
        )
        .setImage(`${current_song.thumbnail || current_song.artwork_url}`)
        .setTimestamp()


    const r = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('play-pause')
                .setEmoji(`⏯`)
                .setStyle('SECONDARY')


        )

        .addComponents(
            new MessageButton()
                .setCustomId('next')
                .setEmoji('⏭')
                .setStyle('SECONDARY')

        )

        .addComponents(
            new MessageButton()
                .setCustomId('loop')
                .setEmoji(`🔁`)
                .setStyle('SECONDARY')

        )

        .addComponents(
            new MessageButton()
                .setCustomId('loop-songs')
                .setEmoji('🔂')
                .setStyle('SECONDARY')

        )

    const r2 = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('stop')
                .setEmoji('⏹')
                .setStyle('SECONDARY')

        )

        .addComponents(
            new MessageButton()
                .setCustomId('shuffle')
                .setEmoji('🔀')
                .setStyle('SECONDARY')

        )



    //message.channel.send({
    //     embeds: [playing_now],
    //     components: [r, r2]
    // }).then(msg => {
    //     setTimeout(() => collector_instance = false, 10000 * 50)
    // })



    const queueDestroyed = function queueDestroyed(queue) {
        console.log('Destroyed queue');
        cmd_collector.stop();
    }
    const queueEnd = function queueEnd(queue) {
        console.log('Ended queue');
        cmd_collector.stop();
    }



    const msg = await message.channel.send({
        embeds: [playing_now],
        components: [r, r2]
    });


    const songChanged = async function songChanged(queue, newSong, oldSong) {
        console.log("SONG CHANGED!!!!");

        // Basically ensures that the buttons and embed shows up when the song is actually loaded to prevent errors
        song_playing_timeout(queue, client, message);


        cmd_collector.stop();
        remove_event_listeners();
    }

    const err = async function err(error, queue) {
        console.log(`Error: ${error} in ${queue.guild.name} `);
        console.log(error);
        if (error === "Status code: 403") {
            console.log("403 time");
            cmd_collector.stop();
            remove_event_listeners();
        }
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


        //cmd_collector.stop();

        await i.deferUpdate();
        //await i.deferUpdate();
        //console.log("Yeah");
        if (!client.player.hasQueue(message.guild.id)) { cmd_collector.stop(); }
        guildQueue = await client.player.getQueue(i.guild.id);


        //function send_msg() {

        //}


        if (i.customId === 'play-pause') {
            //await i.deferUpdate();
            if (guildQueue.paused === true) {
                guildQueue.setPaused(false);
                msg.edit("Resumed");
            } else if (guildQueue.paused === false) {
                guildQueue.setPaused(true);
                msg.edit("Paused the player");
            }

        } else if (i.customId === 'next') {
            if (guildQueue.songs.length > 1) {
                if (guildQueue.paused === true) {

                    guildQueue.setPaused(false); // resumes the player if skipped because paused skip is weird

                }
                try {
                    skippedSong = guildQueue.skip();
                    msg.edit({
                        content: "The song was skipped",
                        embeds: [],
                        components: []
                    }).then(m => {
                        setTimeout(() => m.delete(), 2000);
                    })



                } catch (error) {
                    //if (error.statusCode('403')) {
                    //    console.log("Error, status code 403")
                    //}
                }
            } else {
                msg.delete();
                //msg.edit({
                //    content: "The queue has ended",
                //    embeds: [],
                //    components: []
                //})

                message.channel.send("The queue has ended.");

                remove_event_listeners();
                guildQueue.stop();
                cmd_collector.stop();
            }

        } else if (i.customId === 'loop') {
            if (guildQueue.getRepeatMode() === 1) {
                guildQueue.setRepeatMode(0);

                message.channel.send("Loop mode has been stopped")

            } else {
                guildQueue.setRepeatMode(1);

                message.channel.send("This song will now loop! (Press the button again to unloop)");
            }
        } else if (i.customId === 'loop-songs') {
            if (guildQueue.getRepeatMode() === 2) {
                guildQueue.setRepeatMode(0);
                message.channel.send("Queue loop mode has been stopped")
            } else {
                guildQueue.setRepeatMode(2);
                message.channel.send("The entire queue will now loop");
            }
        } else if (i.customId === 'stop') {
            message.channel.send("Stopped the queue");
            remove_event_listeners();
            guildQueue.stop();
            cmd_collector.stop();
        } else if (i.customId === 'shuffle') {
            message.channel.send("The queue has been shuffled");
            guildQueue.shuffle();
        } else {
            cmd_collector.stop();
            //return;
        }
    });




}
//cmd_collector.stop();



module.exports = { connect_to_channel, leave_channel, is_connected, play_music, song_now_playing, song_playing_timeout };