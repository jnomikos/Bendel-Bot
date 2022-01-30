const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders')
const lyrics = require('lyrics-finder'); // npm i lyrics-finder
const ytsr = require('ytsr');
const { client } = require("../..");
const { Permissions } = require('discord.js');


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
            message.reply("I do not have permissions to connect to voice channels")
            return;
        }
        if (!message.guild.me.permissions.has(Permissions.FLAGS.SPEAK)) {
            message.reply("I cannot play music. I do not have speaking permissions");

            return;
        }

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

let old_queue = [];
client.player.on('songChanged', (queue, newSong, oldSong) => {
    if (queue.getRepeatMode() != 1)
        old_queue.push(oldSong);
});

client.player.on('queueDestroyed', (queue) => {
    old_queue = [];
})
client.player.on('queueEnd', (queue) => {
    old_queue = [];
})
client.player.on('clientDisconnect', (queue) => {
    old_queue = [];
});
client.player.on('channelEmpty', (queue) => {
    old_queue = [];
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

var cmd_queue = [];

client.player.on('songLoaded', (message, queue, loaded) => {
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
    if (cmd_queue.length > 0) {
        play_music(cmd_queue[0][0], cmd_queue[0][1], cmd_queue[0][2], cmd_queue[0][3])
    }
});

function command_queue_add(client, guildQueue, message, args) {

    var cmd = [client, guildQueue, message, args]
    cmd_queue.push(cmd);
    if (cmd_queue.length === 1) {
        play_music(cmd_queue[0][0], cmd_queue[0][1], cmd_queue[0][2], cmd_queue[0][3]);
    }
    console.log(cmd_queue.length)

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
    } catch (error) { // good when the bot is timed out or doesn't have perms
        console.log("Error in queue join")
        console.log(error);
        return;
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

                client.player.emit("songLoaded", message, guildQueue, worked);


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
                client.player.emit("songLoaded", message, guildQueue, worked);


            }


        } else {
            console.log("👀 Searching..."); // TODO: tell user of it searching
            client.player.emit('newSearch');
            const searchingMsg = await message.reply({
                content: "👀 Searching..."
            })

            // filters to only search for videos!!!
            const filters1 = await ytsr.getFilters(args.join(" "));
            const filter1 = filters1.get('Type').get('Video');

            if (!filter1.url) {
                client.player.emit("songLoaded", message, guildQueue, false);
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

                client.player.emit("songLoaded", message, guildQueue, false);
                return message.channel.send("Yeah uhh.. no songs were found. Sorry!");

            }



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
                if (msgRef)
                    msgRef.delete();

                //msgRef.edit({
                //    embeds: [],
                //    components: [],
                //})
            }
            //client.player.emit('newSearch');
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

                    let msg = i.editReply({ // loading reply
                        content: "<a:Loading:931258756644360272> Hold on a second, adding the video...",
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
                            .setDescription('Video failed to add...')
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
                        msgRef.delete();
                    }

                    client.player.emit("songLoaded", message, guildQueue, worked);

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
    function playing_now_embed() {
        let current_song = guildQueue.songs[0];
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
            //.setDescription(`${guildQueue.songs[0].name || current_song.title}`)
            .addFields(
                { name: guildQueue.songs[0].name || guildQueue.songs[0].title, value: artist },
                //{ name: 'Author', value: current_song.author || current_song.publisher_metadata.artist || "none", inline: true },
                { name: "▬▬▬▬▬▬▬▬▬▬▬▬▬▬ [ 00:00:00/" + duration + "]", value: '\u200B' },
            )
            .setImage(`${guildQueue.songs[0].thumbnail || guildQueue.songs[0].artwork_url}`)
            .setTimestamp()
        //.setFooter(`Added by ${message.author.tag}`, message.author.displayAvatarURL());
        return playing_now;
    }
    // this is a function to generate it everytime it is called
    function action_r() {
        const r = new MessageActionRow()

            .addComponents(
                new MessageButton()
                    .setCustomId('1_back')
                    .setEmoji('⏮')
                    .setStyle('SECONDARY')
                    .setDisabled(old_queue.length > 0 && guildQueue.getRepeatMode() === 0 ? false : true)

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
                    .setStyle(guildQueue.getRepeatMode() === 1 ?
                        'DANGER' : 'SECONDARY')

            )

        return r;
    }

    function action_r2() {
        const r2 = new MessageActionRow()

            .addComponents(
                new MessageButton()
                    .setCustomId('1_loop-songs')
                    .setEmoji('🔂')
                    .setStyle(guildQueue.getRepeatMode() === 2 ?
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

            .addComponents(
                new MessageButton()
                    .setCustomId('1_lyrics')
                    .setEmoji('🔠')
                    .setStyle('SECONDARY')
            )

        return r2;
    }

    const msg = await message.channel.send({
        embeds: [playing_now_embed()],
        components: [action_r(), action_r2()]
    });

    const queueDestroyed = function queueDestroyed(queue) {
        msg.delete();
        cmd_collector.stop();
        remove_event_listeners();
    }
    const queueEnd = function queueEnd(queue) {
        message.channel.send("The queue has ended 😭");
        msg.delete();
        cmd_collector.stop();
        remove_event_listeners();
    }





    const songChanged = async function songChanged(queue, newSong, oldSong) {
        console.log("SONG CHANGED!!!!");

        // Basically ensures that the buttons and embed shows up when the song is actually loaded to prevent errors
        song_playing_timeout(queue, client, message);
        msg.delete();

        cmd_collector.stop();
        remove_event_listeners();
    }

    const err = async function err(error, queue) {
        console.log(`Error: ${error} in ${queue.guild.name} `);
        console.log(error);
        if (error === "Status code: 403") {
            console.log("403 time?");
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


    var lyrics_toggled = false;
    cmd_collector.on('collect', async i => {
        if (i === undefined) { return; }




        await i.deferUpdate();

        if (!client.player.hasQueue(message.guild.id)) { cmd_collector.stop(); }
        guildQueue = await client.player.getQueue(i.guild.id);


        let i_embed = new MessageEmbed().setFooter(`${i.user.tag}`, i.user.displayAvatarURL());
        if (i.customId === '1_play-pause') {
            //let embed = new MessageEmbed().setFooter(`${i.user.tag}`, i.user.displayAvatarURL());
            //await i.deferUpdate();
            if (guildQueue.paused === true) {
                guildQueue.setPaused(false);
                i_embed.setDescription("Resumed").setColor('#75fa1e').setTimestamp()
            } else if (guildQueue.paused === false) {
                guildQueue.setPaused(true);
                i_embed.setDescription("Paused").setColor('#fa251e').setTimestamp()
            }

            msg.edit({
                embeds: [i_embed, playing_now_embed()],
                components: [action_r(), action_r2()]
            });

        } else if (i.customId === '1_next') {
            i_embed.setDescription(`Skipped \`${guildQueue.songs[0].name || guildQueue.songs[0].title}\``).setTimestamp();
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

            if (guildQueue.getRepeatMode() === 1) {
                try {
                    skippedSong = guildQueue.skip();
                } catch (error) {
                    console.log(error);
                }
            } else {
                let song = old_queue.pop();
                if (song.url) {
                    song = song.url;
                } else {
                    song = song.uri; // Soundcloud songs label url differently
                }
                let song_2 = await guildQueue.play(song, {
                    index: 0,
                }).catch(_ => {
                    if (!guildQueue)
                        queue.stop();
                });

                msg.edit({
                    embeds: [playing_now_embed()],
                    components: [action_r(), action_r2()]
                });
                //msg.delete();
                //guildQueue.skip();
                //console.log("Old queue", old_queue)
                //old_queue.pop();
                //console.log("Old queue", old_queue)
                //console.log(old_queue.length)
            }


        } else if (i.customId === '1_loop') {
            if (guildQueue.getRepeatMode() === 1) {
                guildQueue.setRepeatMode(0);
                i_embed.setDescription(`Loop mode has been disabled`).setTimestamp();


            } else {
                guildQueue.setRepeatMode(1);
                i_embed.setDescription(`Loop mode enabled! \`(Press the button again to unloop)\``).setTimestamp();
            }

            // edits msg to change color of the loop button
            msg.edit({
                embeds: [playing_now_embed()],
                components: [action_r(), action_r2()]
            });

            message.channel.send({ embeds: [i_embed] })
        } else if (i.customId === '1_loop-songs') {
            if (guildQueue.getRepeatMode() === 2) {
                guildQueue.setRepeatMode(0);
                i_embed.setDescription("Disabled queue loop").setTimestamp();
            } else {
                guildQueue.setRepeatMode(2);
                i_embed.setDescription("The entire queue will now loop").setTimestamp();
            }

            // edits msg to change color of the queue loop button
            msg.edit({
                embeds: [playing_now_embed()],
                components: [action_r(), action_r2()]
            });

            message.channel.send({
                embeds: [i_embed]
            });
        } else if (i.customId === '1_stop') {
            i_embed.setDescription(`Stopped the queue`).setTimestamp();
            msg.delete();
            message.channel.send({
                embeds: [i_embed]
            });
            remove_event_listeners();
            guildQueue.stop();
            cmd_collector.stop();
        } else if (i.customId === '1_shuffle') {
            i_embed.setDescription(`The queue has been shuffled`).setTimestamp();
            message.channel.send({ embeds: [i_embed] });
            guildQueue.shuffle();
        } else if (i.customId === '1_lyrics') {

            if (lyrics_toggled === true) {
                msg.edit({
                    embeds: [playing_now_embed()],
                    components: [action_r(), action_r2()]
                });
                lyrics_toggled = false;
            } else {
                let song_name = current_song.name || current_song.title;

                var song_info;
                let lyric = "NOT FOUND";
                var lyrics_found = false;
                if (song_name.includes("-")) {
                    song_info = song_name.split("-");

                } else if (song_name.includes("–")) {
                    song_info = song_name.split("–");
                } else if (song_name.includes(":")) {
                    song_info = song_name.split(":");
                } else {
                    song_info = song_name;
                }


                if (song_info[1].includes("(")) {
                    song_info[1] = song_info[1].split("(")[0]
                }


                lyric = await lyrics(song_info[0], song_info[1]) || "NOT FOUND";
                // artist variable declared above
                let lyrics_embed = new MessageEmbed().setColor('RANDOM').setFooter(`Lyrics Requested by ${i.user.tag}`, i.user.displayAvatarURL());



                //let lyric = await lyrics("Queen", "Bohemian Rhapsody") || "NOT FOUND";

                lyrics_embed.setDescription(lyric.length >= 4093 ? lyric.substring(0, 4093) + '...' : lyric);
                msg.edit({
                    embeds: [playing_now_embed(), lyrics_embed],
                    components: [action_r(), action_r2()]
                });
                lyrics_toggled = true;
            }
            //i.editReply({ embeds: [lyrics_embed] })
        } else {
            cmd_collector.stop();
            //return;
        }
    });




}

