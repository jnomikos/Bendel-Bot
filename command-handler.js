const fs = require('fs');
const { client } = require('.');
const DiscordJS = require('discord.js');
const getFiles = require('./get-files');
const getDirectories = require('./get-directories');
const mongoose = require('mongoose');
const guildSchema = require('./database/schema/guild');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');



//client.aliases = new DiscordJS.Collection();
module.exports = async (client) => {
    const aliases = {}
    const suffix = '.js'

    const commandFiles = getFiles('./commands', suffix);
    //client.commands = new Collection();
    const directories = getDirectories('./commands', suffix);

    console.log(directories);

    //const guildId = '904553034892333066';
    const clientId = '905938287850553354';
    //const guild = client.guilds.cache.get(guildId)

    //let commands;
    //if (guild) {
    //    console.log("Bot test initiated");
    //    commands = guild.commands;
    //} else {
    const commands = [];
    //}

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
            commands.push(client.commands.get(commandName.toLowerCase()).data.toJSON());
        }

        //command['directory'] = "none"
        if (client.commands.get(commandName.toLowerCase()).aliases) {
            client.commands.get(commandName.toLowerCase()).aliases.forEach(alias => {
                aliases[alias] = commandFile.name;
                //aliases[alias].name = alias;
            });
        }

        if (client.commands.get(commandName.toLowerCase()).init) {
            client.commands.get(commandName.toLowerCase()).init();
        }
    }

    const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);
    (async () => {
        try {
            console.log('Started refreshing application (/) commands.');

            await rest.put(
                Routes.applicationCommands(clientId),
                { body: commands },
            );

            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    })();

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


        // sam
        if (message.author.id = "105067594100277248") {
            message.react('<a:sam:902065673210060801>');

        }
        let guildData;
        let p;


        try {
            guildData = await guildSchema.findOne({ guildID: message.guild.id });

            if (!guildData) {
                console.log("No data about prefix available, adding data")
                let profile = await guildSchema.create({
                    guildID: message.guild.id, //ID of the guild
                    prefix: '-',
                    bot_channel: message.channel.id
                })
                profile.save();
                p = '-'
            } else {
                p = guildData.prefix;
            }

            if (guildData.fire_toggle === true && !(message.author.bot)) {
                let fire_chance = Math.floor(Math.random() * 5000);
                if (fire_chance === 5) {
                    console.log("FIRE!!!")
                    message.react('🔥');
                }
            }


        } catch (err) {
            console.log(err);
        }

        if (!message.content.startsWith(p) || message.author.bot) { return; }


        if (message.channel.id !== guildData.botChannel) {

            const query = {
                guildID: {
                    $eq: message.guild.id
                }
            }

            await guildSchema.updateOne(guildData, {
                bot_channel: message.channel.id
            })

        }
        // Our standard argument/command name definition.
        const args = message.content.slice(p.length).trim().split(/ +/);

        //const channel1 = client.channels.cache.find(channel => channel.id === "904553034892333070")
        //channel1.send("test")
        const commandName = args.shift().toLowerCase();
        if (!client.commands.get(commandName) && !client.commands.get(aliases[commandName])) {
            return;
        }

        // checks if user has permission for said command
        let command = client.commands.get(commandName);

        if (!command) {
            command = client.commands.get(aliases[commandName]);
            if (!command) return;
        }

        if (command.permission) {
            const authorPerms = message.channel.permissionsFor(message.member);
            if (!authorPerms || !authorPerms.has(command.permission)) {
                message.reply("Error: You do not have permissions to use that command")
                return;
            }
        }

        if (command.premium === true && guildData.premium === false) {
            message.reply("This is a premium command. Only servers with activated premium can use it");
            return;
        }


        try {
            command.execute(client, message, args);

        } catch (error) {
            console.log(error);
        }





        //if (commands[commandName].aliases) { // alternative commands
        //    command.aliases.forEach(alias => {
        //        client.aliases.set(alias, command)
        //    })
        //}
    });



}

