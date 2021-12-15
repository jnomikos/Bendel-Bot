const fs = require('fs');
const { client } = require('.');

const getFiles = require('./get-files');
const getDirectories = require('./get-directories');
const mongoose = require('mongoose');
const guildSchema = require('./database/schema/guild');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');



//client.aliases = new DiscordJS.Collection();
module.exports = async (client) => {
    const aliases = {}
    const suffix = '.js'

    const commandFiles = getFiles('./commands', suffix);
    const directories = getDirectories('./commands', suffix);

    console.log(directories);

    // Loop over the Command files
    for (const command of commandFiles) {

        let commandFile = require(command);
        if (commandFile.default) {
            commandFile = commandFile.default;
        }

        const split = command.replace(/\\/g, '/').split('/')
        const commandName = split[split.length - 1].replace(suffix, '')

        client.commands.set(commandName.toLowerCase(), commandFile);

        //command['directory'] = "none"
        if (client.commands.get(commandName.toLowerCase()).aliases) {
            client.commands.get(commandName.toLowerCase()).aliases.forEach(alias => {
                aliases[alias] = commandFile.name;
                //aliases[alias].name = alias;
            });
        }

    }



    console.log(client.commands);
    //console.log(Object.keys(commands));
    client.on('messageCreate', async (message) => {

        let guildData;
        let p;

        try {
            guildData = await guildSchema.findOne({ guildID: message.guild.id });

            if (!guildData) {
                console.log("No data about prefix available, adding data")
                let profile = await guildSchema.create({
                    guildID: message.guild.id, //ID of the guild
                    prefix: '-',
                })
                profile.save();
                p = '-'
            } else {
                p = guildData.prefix;
            }

            //client.user.setActivity(`Bendel Music | ${p}help`, { type: "LISTENING" });
        } catch (err) {
            console.log(err);
        }
        //const data = prefix.findOne({
        //    GuildID: message.guild.id
        //});

        //console.log(data.prefix);
        //let prefix = data ? data.Prefix : '-';

        if (!message.content.startsWith(p) || message.author.bot) { return; }

        // Our standard argument/command name definition.
        const args = message.content.slice(p.length).trim().split(/ +/);



        const commandName = args.shift().toLowerCase();
        if (!client.commands.get(commandName) && !client.commands.get(aliases[commandName])) {
            return;
        }

        const command = client.commands.get(commandName)
        if (command) {
            try {
                command.execute(client, message, args);

            } catch (error) {
                console.log(error);
            }
        } else {
            const commandA = client.commands.get(aliases[commandName]);
            try {
                commandA.execute(client, message, args);
            } catch (error) {
                console.log(error);
            }
        }




        //if (commands[commandName].aliases) { // alternative commands
        //    command.aliases.forEach(alias => {
        //        client.aliases.set(alias, command)
        //    })
        //}
    });



}

