const { SlashCommandBuilder } = require('@discordjs/builders')
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");
const ytsr = require('ytsr');
module.exports = {
    name: 'search',
    description: 'Search for YouTube song',
    directory: __dirname,
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Stops the queue and leaves the voice channel')
    ,


    async execute(client, message, args) {

        if (message.member?.voice.channel == null) {
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

        var isInteraction;
        if (message.user) {
            isInteraction = true;
            args = args.get('search').value.split(" ");
        }

        console.log("👀 Searching..."); // TODO: tell user of it searching
        const searchingMsg = await message.reply({
            content: "👀 Searching..."
        }).catch(error => {
            // Only log the error if it is not an Unknown Message error
            if (error.code !== 10008) {
                console.error('Failed to reply to the message:', error);
            }
        });

        // filters to only search for videos!!!
        const filters1 = await ytsr.getFilters(args.join(" "));
        const filter1 = filters1.get('Type').get('Video');

        if (!filter1.url) {
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
                searchingMsg.delete().catch(error => {
                    // Only log the error if it is not an Unknown Message error
                    if (error.code !== 10008) {
                        console.error('Failed to delete the message:', error);
                    }
                });
            }
        }
        // If no videos were found from the search
        if (!videos.length) {

            client.player.emit("songLoaded", message, guildQueue, false);
            return message.channel.send("Yeah uhh.. no songs were found. Sorry!");

        }


        var msgRef; // Message reference
        var len = 0;

        const newSearch = function newSearch() {
            coll.stop();
            msgRef.delete().catch(error => {
                // Only log the error if it is not an Unknown Message error
                if (error.code !== 10008) {
                    console.error('Failed to delete the message:', error);
                }
            });;
        }
        client.player.emit('newSearch');
        client.player.once('newSearch', newSearch);

        msgRef = await message.reply({
            embeds: [search_screen_embed(len, videos, args)],
            components: [search_action_row_1(videos, len), search_action_row_2(videos, len)],
        }).catch(error => {
            // Only log the error if it is not an Unknown Message error
            if (error.code !== 10008) {
                console.error('Failed to edit the reply:', error);
            }
        });


        setTimeout(() => {
            coll.stop();
            msgRef.delete().catch(error => {
                // Only log the error if it is not an Unknown Message error
                if (error.code !== 10008) {
                    console.error('Failed to delete the message:', error);
                }
            });;
        }, 15 * 1000);

        coll.on('collect', async i => {
            await i.deferUpdate();
            if (i.customId === 'choice_back') {
                len -= 5;
                i.editReply({ // loading reply
                    content: "Hold on a second, adding the video...",
                    embeds: [search_screen_embed(len)],
                    components: [search_action_row_1(videos, len), search_action_row_2(videos, len)]
                });
            } else if (i.customId === 'choice_forward') {
                len += 5;
                i.editReply({ // loading reply
                    content: "Hold on a second, adding the video...",
                    embeds: [search_screen_embed(len)],
                    components: [search_action_row_1(videos, len), search_action_row_2(videos, len)]
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


                let command = client.commands.get('play');
                let arguments = [videos[choice + len].url]
                command.execute(client, message, arguments);

                client.player.removeListener('newSearch', newSearch);
                coll.stop();

            }
        });
    }

}

function search_screen_embed(len, videos, args) {
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