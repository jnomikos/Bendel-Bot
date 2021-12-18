const fs = require('fs');
const { client } = require('.');
const DiscordJS = require('discord.js');
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
    //client.commands = new Collection();
    const directories = getDirectories('./commands', suffix);

    console.log(directories);

    const guildId = '904553034892333066';
    const guild = client.guilds.cache.get(guildId)

    //let commands;
    let commands;
    if (guild) {
        console.log("Bot test initiated");
        commands = guild.commands;
    } else {
        commands = client.application?.commands;
    }

    //client.commands?.get('play');
    //client.commands?.get('join');
    //client.commands?.get('leave');

    // Loop over the Command files
    for (const command of commandFiles) {

        let commandFile = require(command);
        if (commandFile.default) {
            commandFile = commandFile.default;
        }

        const split = command.replace(/\\/g, '/').split('/')
        const commandName = split[split.length - 1].replace(suffix, '')
        client.commands.set(commandName.toLowerCase(), commandFile);
        if (client.commands.get(commandName.toLowerCase()).data) {
            console.log(client.commands.get(commandName.toLowerCase()).name);
            commands?.create(client.commands.get(commandName.toLowerCase()).data)
        }
        //command['directory'] = "none"
        if (client.commands.get(commandName.toLowerCase()).aliases) {
            client.commands.get(commandName.toLowerCase()).aliases.forEach(alias => {
                aliases[alias] = commandFile.name;
                //aliases[alias].name = alias;
            });
        }



    }

    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isCommand()) { return; }

        //await interaction.deferReply({ ephemeral: false }).catch(() => { })
        const { commandName, options } = interaction;
        const command = client.commands.get(commandName)
        if (command.permission) {
            const authorPerms = interaction.channel.permissionsFor(interaction.member)
            if (!authorPerms || !authorPerms.has(command.permission)) {
                interaction.reply("Error: You do not have permissions to use that command")
                return;
            }
        }
        try {
            command.execute(client, interaction, options);

        } catch (error) {
            //     console.log(error);
        }

    });

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
            if (guildData.fire_toggle === true) {
                let fire_chance = Math.floor(Math.random() * 250);
                if (fire_chance === 5) {
                    message.channel.send("🔥🔥🔥");
                }
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

