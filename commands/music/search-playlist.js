const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const { SlashCommandBuilder } = require('@discordjs/builders')
const { song_playing_timeout } = require('./play');

const ytsr = require('ytsr');

module.exports = {
    name: 'search-playlist',
    arguments: '<search-query>',
    aliases: ['playlist'],
    description: 'Searches for YouTube playlists to play',
    directory: __dirname,
    premium: true,
    async execute(client, message, args) {

        let queue;
        let guildQueue = client.player.getQueue(message.guild.id);
        // if (!guildQueue) {
        queue = client.player.createQueue(message.guild.id);

        try {
            await queue.join(message.member.voice.channel);
        } catch (error) {
            console.log("Error in queue join")
            console.log(error);
        }

        const channel = message.member?.voice.channel;
        if (channel == null) {
            message.reply({
                content: "You must be in a voice channel first!",
            })
            return;
        }

        if (args.length < 1)
            return;

        const searchingMsg = await message.reply({
            content: "Searching..."
        })

        // filters to only search for videos!!!
        const filters1 = await ytsr.getFilters(args.join(" "));
        const filter1 = filters1.get('Type').get('Playlist');

        console.log(filter1);
        const r = await ytsr(filter1.url, { limit: 10 })



        //console.log(r)
        const videos = r.items;

        for (var x = 0; x < videos.length; x++) { // my own fix to an issue with this package's filter
            if (videos[x].type === 'video') {
                videos.splice(x, 1);
                console.log("Video searched for. Spliced!")
            }
        }
        //console.log(videos)
        let userId;
        //if (isInteraction === true) {
        //   userId = message.user.id;
        //} else {
        userId = message.member.id;
        //}
        const filter = i => { // Filter for message component collector for buttons. Put it up here so it can be used in multiple areas
            return (userId === i.user.id) && i !== undefined && i.customId.substr(0, 8) === 'playlist';
        }
        const coll = message.channel.createMessageComponentCollector({ filter, time: 15 * 1000 });
        //if (!isInteraction) {
        if (!searchingMsg.deleted) {
            searchingMsg.delete();
        }
        //}
        // If no videos were found from the search
        if (videos[0] === undefined) return message.channel.send("Yeah uhh.. no songs were found. Sorry!");


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

                        value: videos[len] != undefined ? `Author: ${videos[len].owner.name}, Amount of Videos: \`${videos[len].length}\`` : '\u200B',


                    },
                    {
                        name: videos[len + 1] != undefined ? `:two: ${videos[len + 1].title}` : '\u200B',

                        value: videos[len + 1] != undefined ? `Author: ${videos[len + 1].owner.name}, Amount of Videos: \`${videos[len + 1].length}\`` : '\u200B',

                    },
                    {
                        name: videos[len + 2] != undefined ? `:three: ${videos[len + 2].title}` : '\u200B',

                        value: videos[len + 2] != undefined ? `Author: ${videos[len + 2].owner.name}, Amount of Videos: \`${videos[len + 2].length}\`` : '\u200B',

                    },
                    {
                        name: videos[len + 3] != undefined ? `:four: ${videos[len + 3].title}` : '\u200B',

                        value: videos[len + 3] != undefined ? `Author: ${videos[len + 3].owner.name}, Amount of Videos: \`${videos[len + 3].length}\`` : '\u200B',

                    },
                    {
                        name: videos[len + 4] != undefined ? `:five: ${videos[len + 4].title}` : '\u200B',

                        value: videos[len + 4] != undefined ? `Author: ${videos[len + 4].owner.name}, Amount of Videos: \`${videos[len + 4].length}\`` : '\u200B',

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
                        .setCustomId('playlist_1')
                        .setLabel('1')
                        //.setEmoji('1️⃣')
                        .setStyle('PRIMARY')
                        .setDisabled(videos[len] === undefined)
                )

                .addComponents(
                    new MessageButton()
                        .setCustomId('playlist_2')
                        .setLabel('2')
                        // .setEmoji('2️⃣')
                        .setStyle('PRIMARY')
                        .setDisabled(videos[len + 1] === undefined)
                )

                .addComponents(
                    new MessageButton()
                        .setCustomId('playlist_3')
                        .setLabel('3')
                        // .setEmoji('3️⃣')
                        .setStyle('PRIMARY')
                        .setDisabled(videos[len + 2] === undefined)
                )

                .addComponents(
                    new MessageButton()
                        .setCustomId('playlist_4')
                        .setLabel('4')
                        // .setEmoji('4️⃣')
                        .setStyle('PRIMARY')
                        .setDisabled(videos[len + 3] === undefined)
                )

                .addComponents(
                    new MessageButton()
                        .setCustomId('playlist_5')
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
                        .setCustomId('playlist_back')
                        //.setLabel('<')
                        .setEmoji('⬅️')
                        .setStyle('PRIMARY')
                        .setDisabled(len === 0)
                )

                .addComponents(
                    new MessageButton()
                        .setCustomId('playlist_forward')
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
            if (i.customId === 'playlist_back') {
                len -= 5;
                i.editReply({ // loading reply
                    content: "Hold on a second, adding the video...",
                    embeds: [search_screen_embed(len)],
                    components: [row1(len), row2(len)]
                });
            } else if (i.customId === 'playlist_forward') {
                len += 5;
                i.editReply({ // loading reply
                    content: "Hold on a second, adding the video...",
                    embeds: [search_screen_embed(len)],
                    components: [row1(len), row2(len)]
                });
            } else {

                var choice;
                if (i.customId === 'playlist_1') {
                    choice = 0;
                } else if (i.customId === 'playlist_2') {
                    choice = 1;
                } else if (i.customId === 'playlist_3') {
                    choice = 2;
                } else if (i.customId === 'playlist_4') {
                    choice = 3;
                } else if (i.customId === 'playlist_5') {
                    choice = 4;
                } else {
                    return;
                }

                i.editReply({ // loading reply
                    content: `Hold on a second, adding ${videos[choice + len].length} videos to the queue...`,
                    embeds: [],
                    components: []
                });

                if (videos[choice + len] === undefined) {
                    Promise.reject(new Error('fail')).then(console.error(error));
                    console.error("Song chosen was undefined");
                    return;
                }

                var worked = true;


                let isFirst = queue.songs.length === 0;
                // direct integration from soundcloud
                let load_msg = undefined;

                load_msg = await message.reply(`\`Loading songs from the playlist. This may take a while...\``);


                var worked = true;
                let song = await queue.playlist(videos[choice + len].url).then(_ => {
                    if (load_msg != undefined) {
                        load_msg.delete();
                        message.channel.send(`\`${videos[choice + len].title} with ${videos[choice + len].length} videos was added to the queue\``);
                    }
                }).catch(error => {
                    console.log(error);
                    if (!guildQueue || !guildQueue.songs[0])
                        queue.stop();
                    //Promise.reject(error);
                    //song_chosen = false; // failure
                    // return;

                    worked = false;
                });


                client.player.emit("songLoaded");


                if (isFirst && worked === true) {
                    song_playing_timeout(queue, client, message);
                    //song_now_playing(client, message)
                }

                client.player.removeListener('newSearch', newSearch);
                coll.stop();

            }
        });
    }
}