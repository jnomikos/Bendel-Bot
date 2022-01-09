const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders')

const ytsr = require('ytsr');
const { client } = require("../..");


module.exports = {
    name: 'play',
    arguments: '<song-url / search-query>',
    aliases: ['p', 'steal'],
    description: 'play a song',
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


        if (args.length < 1) { return; }

        const channel = message.member?.voice.channel;
        if (channel == null) {
            message.reply({
                content: "You must be in a voice channel first!",
            })
            return;
        }
        let guildQueue = client.player.getQueue(message.guild.id);
        //if (args.toString().includes('https://')) {
        command_queue_add(client, guildQueue, message, args);
        //} else {
        //    play_music(client, guildQueue, message, args);
        //}

    }, song_playing_timeout

}


client.player.on('queueAdded', (queue, song, message) => {
    console.log("Song added to queue of ", queue.size)
    //console.log(queue.songs.length);
    if (queue.songs.length > 0) {
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

var cmd_queue = [];
function command_queue_add(client, guildQueue, message, args) {

    var cmd = [client, guildQueue, message, args]
    cmd_queue.push(cmd);
    if (cmd_queue.length === 1) {
        play_music(cmd_queue[0][0], cmd_queue[0][1], cmd_queue[0][2], cmd_queue[0][3]);
    }
    console.log(message)
    client.player.once('songLoaded', (queue, loaded) => {
        console.log("Song loaded")
        console.log(!message.content.includes("/sets/"))
        if (queue && queue.songs.length > 0 && loaded === true) {
            //if (message.content.includes("https://")) {

            if (!message.content.includes("&list=") && !message.content.includes("playlist") && !message.content.includes("/sets/")) {

                client.player.emit('queueAdded', queue, queue.songs[queue.songs.length - 1], message)

            }
            //} else {
            //  client.player.emit('queueAdded', queue, queue.songs[queue.songs.length - 1], message)
            //}


        }
        cmd_queue.shift();
        console.log(cmd_queue.length)
        if (cmd_queue.length > 0) {
            play_music(cmd_queue[0][0], cmd_queue[0][1], cmd_queue[0][2], cmd_queue[0][3])
        }
    });

    client.player.once('newSearch', () => {
        cmd_queue.shift();
        if (cmd_queue.length > 0) {
            play_music(cmd_queue[0][0], cmd_queue[0][1], cmd_queue[0][2], cmd_queue[0][3])
        }
    })

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
    //client.commands.get('join').execute(channel); // joins the desired channel
    let queue;
    // if (!guildQueue) {
    queue = client.player.createQueue(message.guild.id);
    //} else {
    //  queue = client.player.getQueue(message.guild.id);
    //}



    try {
        await queue.join(message.member.voice.channel);
    } catch (error) {
        console.log("Error in queue join")
        console.log(error);
    }

    /*
    P's promise is that a song is chosen. If so, it will display song chosen message
    */
    let song_chosen = new Promise(async function (resolve) {
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
                    load_msg = await message.reply(`\`Loading songs from spotify playlist. This may take a while...\``);
                } else {
                    load_msg = await message.reply(`\`Loading songs from the playlist. This may take a while...\``);
                }

                const playlistAdd = function playlistAdd(queue, playlist) {
                    message.channel.send(`\`Playlist ${playlist} with ${playlist.songs.length} videos was added to the queue.\``);
                }

                client.player.once('playlistAdd', playlistAdd);
                var worked = true;
                let song = await queue.playlist(args.join(' ')).then(_ => {
                    if (load_msg != undefined) {
                        load_msg.delete();
                    }

                }).catch(error => {
                    if (!guildQueue || !guildQueue.songs[0])
                        queue.stop();

                    client.player.removeListener('playlistAdd', playlistAdd);
                    //Promise.reject(error);
                    //song_chosen = false; // failure
                    // return;

                    worked = false;
                });

                console.log(song)
                client.player.emit("songLoaded", guildQueue, worked);


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
                let worked = true;
                let song = await queue.play(args.join(' ')).then(_ => {
                    resolve();
                    if (queue.songs.length === 1) {
                        song_playing_timeout(queue, client, message);
                    }
                }).catch(_ => {
                    worked = false;
                    if (!guildQueue) {
                        queue.stop();
                        console.log("Guild queue stopped");
                    }
                    //song_chosen = false; // failure
                    return;
                });
                client.player.emit("songLoaded", guildQueue, worked);


            }


        } else {
            console.log("👀 Searching..."); // TODO: tell user of it searching
            const searchingMsg = await message.reply({
                content: "👀 Searching..."
            })

            // filters to only search for videos!!!
            const filters1 = await ytsr.getFilters(args.join(" "));
            const filter1 = filters1.get('Type').get('Video');

            if (!filter1.url) {
                client.player.emit("songLoaded", guildQueue, false);
                return message.channel.send("Yeah uhh.. no songs were found. Sorry!");
            }

            const r = await ytsr(filter1.url, { limit: 10 })


            const videos = r.items;
            let userId;
            if (isInteraction === true) {
                userId = message.user.id;
            } else {
                userId = message.member.id;
            }
            const filter = i => { // Filter for message component collector for buttons. Put it up here so it can be used in multiple areas
                return (userId === i.user.id) && i !== undefined && i.customId.substr(0, 6) === 'choice';
            }
            const coll = message.channel.createMessageComponentCollector({ filter, time: 15 * 1000 });
            if (!isInteraction) {
                if (!searchingMsg.deleted) {
                    searchingMsg.delete();
                }
            }
            // If no videos were found from the search
            if (!videos.length) {

                client.player.emit("songLoaded", guildQueue, false);
                return message.channel.send("Yeah uhh.. no songs were found. Sorry!");

            }


            console.log(videos[15] != undefined);
            var len = 0;
            function search_screen_embed(len) {
                search_screen = new MessageEmbed()
                    .setColor('#c5e2ed')
                    .setTitle(`Showing results for: ${args.join(" ")}`)
                    //.setThumbnail('https://c.tenor.com/NjavXXAMRD8AAAAC/sound.gif')
                    .setDescription("Type the number of what you want to play:")

                    .addFields(
                        {
                            name: videos[len] != undefined ? `:one: ${videos[len].title}` : '\u200B',

                            value: videos[len] != undefined ? `Author: ${videos[len].author.name}, Duration: [${videos[0].duration}]` : '\u200B',


                        },
                        {
                            name: videos[len + 1] != undefined ? `:two: ${videos[len + 1].title}` : '\u200B',

                            value: videos[len + 1] != undefined ? `Author: ${videos[len + 1].author.name}, Duration: [${videos[len + 1].duration}]` : '\u200B',

                        },
                        {
                            name: videos[len + 2] != undefined ? `:three: ${videos[len + 2].title}` : '\u200B',

                            value: videos[len + 2] != undefined ? `Author: ${videos[len + 2].author.name}, Duration: [${videos[len + 2].duration}]` : '\u200B',

                        },
                        {
                            name: videos[len + 3] != undefined ? `:four: ${videos[len + 3].title}` : '\u200B',

                            value: videos[len + 3] != undefined ? `Author: ${videos[len + 3].author.name}, Duration: [${videos[len + 3].duration}]` : '\u200B',

                        },
                        {
                            name: videos[len + 4] != undefined ? `:five: ${videos[len + 4].title}` : '\u200B',

                            value: videos[len + 4] != undefined ? `Author: ${videos[len + 4].author.name}, Duration: [${videos[len + 4].duration}]` : '\u200B',

                        },
                    )
                    //.setTimestamp()
                    .setFooter("Page " + ((len / 5) + 1).toString() + "/" + Math.ceil(videos.length / 5).toString());
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
                            .setDisabled(videos[len + 5] === undefined)
                    )
                return r2;
            }
            search = search_screen_embed(len);
            const r1 = row1(len);
            const r2 = row2(len);
            var msgRef;
            try {
                msgRef = await message.editReply({
                    embeds: [search],
                    components: [r1, r2],
                })
            } catch (error) {
                try {
                    msgRef = await message.reply({
                        embeds: [search],
                        components: [r1, r2],
                    })
                } catch (err) {
                    console.log(err);
                    return;
                }
            }

            setTimeout(() => {


                //client.player.emit('newSearch');
                coll.stop();
                if (!msgRef.deleted)
                    msgRef.delete();
            }, 15 * 1000);

            //message.member.id

            const newSearch = function newSearch() {
                coll.stop();
                if (!msgRef.deleted)
                    msgRef.delete();
                //msgRef.edit({
                //    embeds: [],
                //    components: [],
                //})
            }
            client.player.emit('newSearch');
            client.player.once('newSearch', newSearch);

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

                    var worked = true;

                    let song = await queue.play(videos[choice + len].url).catch(_ => {

                        const severe_error = new MessageEmbed()
                            .setColor('#cc0000')
                            .setTitle('Error')
                            .setDescription('An unexpected error has occured, please try again...')
                            .setImage('https://imgpile.com/images/U2Lhgk.png')

                        //i.editReply({ // loading reply
                        message.channel.send({
                            content: "Video failed to add. Please try again... (If the problem continues with this video, it is likely youtube preventing it from downloading)",
                            embeds: [severe_error],
                            components: []
                        });
                        //if (!guildQueue) {
                        //    queue.stop();
                        //    console.log("Guild queue stopped");
                        //}
                        //Promise.reject(new Error('fail')).then(console.error(error));

                        worked = false;
                    });
                    if (worked === true) {
                        resolve();
                        if (queue.songs.length === 1) {
                            song_playing_timeout(queue, client, message)
                        }
                    }
                    client.player.emit("songLoaded", guildQueue, worked);

                    client.player.removeListener('newSearch', newSearch);
                    coll.stop();

                }
            });
        }
    });

}


var song_now_playing = async function (client, message) {


    const filter = i => { // Filter for message component collector
        return i !== undefined && i.customId.substr(0, 2) === '1_';
    }

    guildQueue = await client.player.getQueue(message.guild.id);
    //const cmd_collector = message.channel.createMessageComponentCollector({ filter });
    const cmd_collector = message.channel.createMessageComponentCollector({ filter, time: 1000 * 7200 }); // 2 hours


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

    //duration_converter(songDuration);
    //const cmd_collector = message.channel.createMessageComponentCollector({ filter, time: 30 * 1000 });
    //console.log(guildQueue.length)
    let current_song = guildQueue.songs[0];
    //console.log(current_song)

    let artist;
    var duration = '\u200B';
    if (current_song.title) {
        duration = duration_converter(current_song.duration);
        if (!current_song.publisher_metadata.artist) {
            artist = current_song.user.username;
        } else if (current_song.publisher_metadata.artist) {
            artist = current_song.publisher_metadata.artist;
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


    console.log(guildQueue.songs[0].duration)
    playing_now = new MessageEmbed()
        .setColor('#c5e2ed')
        .setTitle("Playing: ")
        //.setDescription(`${guildQueue.songs[0].name || current_song.title}`)
        .addFields(
            { name: guildQueue.songs[0].name || current_song.title, value: artist },
            //{ name: 'Author', value: current_song.author || current_song.publisher_metadata.artist || "none", inline: true },
            { name: "▬▬▬▬▬▬▬▬▬▬▬▬▬▬ [ 00:00:00/" + duration + "]", value: '\u200B' },
        )
        .setImage(`${current_song.thumbnail || current_song.artwork_url}`)
        .setTimestamp()


    const r = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId('1_play-pause')
                .setEmoji(`⏯`)
                .setStyle('SECONDARY')


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
                .setStyle('SECONDARY')

        )

        .addComponents(
            new MessageButton()
                .setCustomId('1_loop-songs')
                .setEmoji('🔂')
                .setStyle('SECONDARY')

        )

    const r2 = new MessageActionRow()
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



    //message.channel.send({
    //     embeds: [playing_now],
    //     components: [r, r2]
    // }).then(msg => {
    //     setTimeout(() => collector_instance = false, 10000 * 50)
    // })


    const msg = await message.channel.send({
        embeds: [playing_now],
        components: [r, r2]
    });

    const queueDestroyed = function queueDestroyed(queue) {
        cmd_collector.stop();
        remove_event_listeners();
    }
    const queueEnd = function queueEnd(queue) {
        msg.edit({
            content: "The queue has ended.",
            embeds: [],
            components: []
        })
        cmd_collector.stop();
        remove_event_listeners();
    }





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
            msg.delete();
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


        if (i.customId === '1_play-pause') {
            //await i.deferUpdate();
            if (guildQueue.paused === true) {
                guildQueue.setPaused(false);
                msg.edit("Resumed");
            } else if (guildQueue.paused === false) {
                guildQueue.setPaused(true);
                msg.edit("Paused the player");
            }

        } else if (i.customId === '1_next') {
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

        } else if (i.customId === '1_loop') {
            if (guildQueue.getRepeatMode() === 1) {
                guildQueue.setRepeatMode(0);

                message.channel.send("Loop mode has been stopped")

            } else {
                guildQueue.setRepeatMode(1);

                message.channel.send("This song will now loop! (Press the button again to unloop)");
            }
        } else if (i.customId === '1_loop-songs') {
            if (guildQueue.getRepeatMode() === 2) {
                guildQueue.setRepeatMode(0);
                message.channel.send("Queue loop mode has been stopped")
            } else {
                guildQueue.setRepeatMode(2);
                message.channel.send("The entire queue will now loop");
            }
        } else if (i.customId === '1_stop') {
            message.channel.send("Stopped the queue");
            remove_event_listeners();
            guildQueue.stop();
            cmd_collector.stop();
        } else if (i.customId === '1_shuffle') {
            message.channel.send("The queue has been shuffled");
            guildQueue.shuffle();
        } else {
            cmd_collector.stop();
            //return;
        }
    });




}

