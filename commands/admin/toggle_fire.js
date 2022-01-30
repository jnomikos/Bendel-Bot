const guildSchema = require('../../database/schema/guild')
const { Permissions } = require('discord.js');

module.exports = {
    name: 'toggle_fire',
    description: 'Makes Bendel react to messages with a fire emoji randomly sometimes',
    directory: __dirname,
    permission: ['ADMINISTRATOR'],
    async execute(client, message, args) {
        if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
            message.reply("Error: Only administrators can use this command");
            return;
        }
        guildData = await guildSchema.findOne({ guildID: message.guild.id });
        if (guildData.fire_toggle === false) {
            await guildSchema.updateOne({ guildID: message.guild.id, fire_toggle: true })
            message.reply("🔥🔥🔥 enabled 😈😈😈")
        } else {
            await guildSchema.updateOne({ guildID: message.guild.id, fire_toggle: false })
            message.reply("🔥🔥🔥 disabled 😭😭😭😭😭")
        }
        const channel = message.member?.voice.channel;

    }

}