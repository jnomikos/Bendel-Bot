const premiumSchedule = require('../../database/schema/premium_schedule')
const guildSchema = require('../../database/schema/guild');

const { MessageAttachment } = require("discord.js");
const { MessageEmbed } = require('discord.js');
module.exports = {
    name: 'add_premium',
    directory: __dirname,
    init: (client) => {
        const checkPremiumExpire = async () => {

            const query = {
                date: {
                    $lte: Date.now()
                }
            }

            const results = await premiumSchedule.find(query)


            for (const servers of results) {


                const server_query = {
                    guildID: {
                        $eq: servers.guildId
                    }
                }



                await guildSchema.updateMany(server_query, {

                    premium: false
                })
            }
            await premiumSchedule.deleteMany(query);
            setTimeout(checkPremiumExpire, 1000 * 60 * 60);
        }
        checkPremiumExpire();
    },
    async execute(client, message, args) {

        if (message.author.id !== '105067594100277248') {
            message.reply("You do not have permissions for this command");
            return;
        }

        message.reply("Premium added")
        const file = new MessageAttachment(`files/Thank_You.mp3`);

        // args.shift();
        let [guild, months] = args;
        if (!months) {
            months = 1
        }

        const query = {
            guildID: {
                $eq: guild
            }
        }
        const results = await guildSchema.find(query);
        console.log("Results", results[0].bot_channel)

        //channel1.send("test")
        for (const servers of results) {
            const server_query = {
                guildID: {
                    $eq: servers.guildID
                }
            }
            console.log(server_query)
            await guildSchema.updateMany(server_query, {

                premium: true
            })
        }


        var target_date = new Date(); // Now
        target_date.setDate(target_date.getDate() + 30 * months); // Set now + 30 days as the new date

        if (results[0].bot_channel) {
            const thank_channel = client.channels.cache.find(channel => channel.id === results[0].bot_channel)

            const donateEmbed = new MessageEmbed()
                .setColor('#FFD700')
                .setTitle(`Thank You For the Support! 🙏`)
                .setDescription(`😲 ${months} Month(s) of Premium Activated! 🤯`)
                .setThumbnail('https://i.imgur.com/h9PsAKr.png')
                .addFields(
                    { name: 'Expires on', value: `${target_date.toDateString()}` },
                    { name: '\u200B', value: '\u200B' },

                )
                .addField('You help keep this bot alive 💪', '🔥🔥🔥🔥🔥🔥', true)
                .setImage('https://i.imgur.com/RUnqAoX.png')
                .setFooter('Premium Activated');


            thank_channel.send({
                content: "🔥🔥🔥🔥🔥🔥🔥",
                embeds: [donateEmbed],

            })
            thank_channel.send({
                files: [file]
            });
        }


        console.log(months)
        //target_date = target_date.toDateString().split(" ")

        //let month = target_date[1]
        // let day = target_date[2]
        //let year = target_date[3]



        //console.log(args)
        console.log("Add premium command used");

        await new premiumSchedule({
            date: target_date.valueOf(),
            //target_year: year,
            //month: month,
            // day: day,
            guildId: guild
        }).save();
    }
}