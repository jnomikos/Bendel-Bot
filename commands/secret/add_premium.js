const premiumSchedule = require('../../database/schema/premium_schedule')
const guildSchema = require('../../database/schema/guild');

const { MessageAttachment } = require("discord.js");
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
            setTimeout(checkPremiumExpire, 10000 * 2);
        }
        checkPremiumExpire();
    },
    async execute(client, message, args) {

        if (message.author.id !== '105067594100277248') {
            message.reply("You do not have permissions for this command");
            return;
        }
        const file = new MessageAttachment(`files/Thank_You.mp3`);
        message.channel.send({ files: [file] })
        // args.shift();
        let [guild, months] = args;

        const query = {
            guildID: {
                $eq: guild
            }
        }
        const results = await guildSchema.find(query);

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

        var date = new Date(); // Now
        var target_date = new Date(); // Now

        if (!months) {
            months = 1
        }
        target_date.setDate(target_date.getDate() + 30 * months); // Set now + 30 days as the new date

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