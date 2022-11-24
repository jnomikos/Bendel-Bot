const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

module.exports = {
    name: 'queue',
    description: 'Shows the song queue',
    slash_command: false,
    directory: __dirname,
    async execute(client, message, args) {
        let guildQueue = client.player.getQueue(message.guild.id);
        if (!guildQueue) return;
        console.log(guildQueue.songs);

        const filter = i => { // Filter for message component collector for buttons. Put it up here so it can be used in multiple areas
            return (message.author.id === i.user.id) && i !== undefined && i.customId.substr(0, 6) === 'queue_';
        }
        const c = message.channel.createMessageComponentCollector({ filter, time: 15 * 1000 });
        /*
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
        */

        function duration_converter(time) { // converts decimal to hh:mm:ss
            if (time.toString().includes(':')) { return time; }
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
        var len = 0;
        function queue_embed(len) {
            search_screen = new MessageEmbed()
                .setColor('#c5e2ed')
                .setTitle(`Current play queue:`)

                .addFields(
                    {
                        name: guildQueue.songs[len] && len != 0 ? `${len}: ${guildQueue.songs[len].name || guildQueue.songs[len].title}` : guildQueue.songs[len] ? `Playing:  ${guildQueue.songs[len].name || guildQueue.songs[len].title}` : '\u200B',

                        value: guildQueue.songs[len] ? `Author: ${guildQueue.songs[len].author || guildQueue.songs[len].user.username}, Duration: [${duration_converter(guildQueue.songs[len].duration)}]` : '\u200B',


                    },

                    {
                        name: guildQueue.songs[len + 1] ? `${len + 1}: ${guildQueue.songs[len + 1].name || guildQueue.songs[len + 1].title}` : '\u200B',

                        value: guildQueue.songs[len + 1] ? `Author: ${guildQueue.songs[len + 1].author || guildQueue.songs[len + 1].user.username}, Duration: [${duration_converter(guildQueue.songs[len + 1].duration)}]` : '\u200B',


                    },

                    {
                        name: guildQueue.songs[len + 2] ? `${len + 2}: ${guildQueue.songs[len + 2].name || guildQueue.songs[len + 2].title}` : '\u200B',

                        value: guildQueue.songs[len + 2] ? `Author: ${guildQueue.songs[len + 2].author || guildQueue.songs[len + 2].user.username}, Duration: [${duration_converter(guildQueue.songs[len + 2].duration)}]` : '\u200B',


                    },

                    {
                        name: guildQueue.songs[len + 3] ? `${len + 3}: ${guildQueue.songs[len + 3].name || guildQueue.songs[len + 3].title}` : '\u200B',

                        value: guildQueue.songs[len + 3] ? `Author: ${guildQueue.songs[len + 3].author || guildQueue.songs[len + 3].user.username}, Duration: [${duration_converter(guildQueue.songs[len + 3].duration)}]` : '\u200B',


                    },

                    {
                        name: guildQueue.songs[len + 4] ? `${len + 4}: ${guildQueue.songs[len + 4].name || guildQueue.songs[len + 4].title}` : '\u200B',

                        value: guildQueue.songs[len + 4] ? `Author: ${guildQueue.songs[len + 4].author || guildQueue.songs[len + 4].user.username}, Duration: [${duration_converter(guildQueue.songs[len + 4].duration)}]` : '\u200B',


                    },
                )
            //.setTimestamp()
            //.setFooter("Page " + ((len / 5) + 1).toString() + "/" + Math.ceil(videos.length / 5).toString());
            return search_screen;
        }

        function row(len) {
            const r = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('queue_back')
                        //.setLabel('<')
                        .setEmoji('⬅️')
                        .setStyle('PRIMARY')
                        .setDisabled(len === 0)
                )

                .addComponents(
                    new MessageButton()
                        .setCustomId('queue_forward')
                        //.setLabel('2')
                        .setEmoji('➡️')
                        .setStyle('PRIMARY')
                        .setDisabled(guildQueue.songs[len + 5] === undefined)
                )
            return r;
        }
        const r = row(len);

        let queueEm = queue_embed(len);
        const msgRef = await message.reply({
            embeds: [queueEm],
            components: [r],
        })

        c.on('collect', async i => {
            await i.deferUpdate();
            if (i.customId === 'queue_back') {
                len -= 5;
                i.editReply({
                    // loading reply
                    embeds: [queue_embed(len)],
                    components: [row(len)]
                });
            } else if (i.customId === 'queue_forward') {
                len += 5;
                i.editReply({
                    // loading reply
                    embeds: [queue_embed(len)],
                    components: [row(len)]
                });

            }
        });
    }

}