
const guildSchema = require('../../database/schema/guild')
const { Permissions } = require('discord.js');
module.exports = {
    name: "setprefix",
    description: "Sets the prefix for your server",
    aliases: ["prefix"],
    directory: __dirname,

    // Execute contains content for the command
    async execute(client, message, args, data) {
        try {

            //if (!args[0]) {
            //    return client.embed.usage(message, data);
            // }
            if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
                message.reply("Error: Only administrators can use this command");
                return;
            }
            console.log(args)
            if (args.toString().length > 2) {
                message.reply("\`Error: Cannot set a prefix greater than 2 digits\`")
                return;
            } else if (args.toString().length < 1) {
                message.reply("\`You messed up\`");
                return;
            } else if (args.toString().includes('/')) {
                message.reply("\`Error: Invalid characters in prefix set\`");
                return;
            }
            // deletes all other entries of the same guild id
            guildSchema.collection.deleteMany({ guildID: message.guild.id });
            // creates new entry
            let profile = await guildSchema.create({
                guildID: message.guild.id, //ID of the guild
                prefix: args.toString(),
            });
            profile.save();
            //let prefix = args.join(" ");
            //data.prefix = prefix;
            // await data.guild.save();
            //message.guild.prefix = prefix.toLowerCase();

            client.user.setActivity(`Bendel Music | ${args}help`, { type: "LISTENING" });
            return message.channel.send(`Prefix has been updated to \`${args}\``);


        } catch (err) {
            //console.log(`Ran into an error while executing ${data.cmd.name}`)
            console.log(err)

            const severe_error = new MessageEmbed()
                .setColor('#cc0000')
                .setTitle('Error')
                .setDescription('An unexpected error has occured, please try again...')
                .setImage('https://imgpile.com/images/U2Lhgk.png')

            message.channel.send({
                embeds: [severe_error]
            })
            //return client.embed.send(message, {
            //    description: `An issue has occured while running the command. If this error keeps occuring please contact our development team.`,
            //   color: `RED`,
            //   author: {
            //       name: `Uh Oh!`,
            //       icon_url: `${message.author.displayAvatarURL()}`,
            //       url: "",
            //  }
            //});
        }
    }
}