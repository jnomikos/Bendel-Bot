const { Client, Message, MessageEmbed, MessageActionRow, MessageSelectMenu } = require('discord.js')
const fs = require('fs')
const loadCommands = require('../../command-handler');

const { SlashCommandBuilder } = require('@discordjs/builders')


module.exports = {
    name: 'help',
    description: 'Get info on all commands available',
    directory: __dirname,
    //data: new SlashCommandBuilder()
    //    .setName('help')
    //    .setDescription('Shows a list of commands available')
    //,
    async execute(client, message, args) {
        client.player.emit("help");
        const directories = [
            ...new Set(client.commands.map((cmd) => cmd.directory)),
        ]
        //.replace(/^.*[\\\/]/, '')
        const getCmds = client.commands.map((cmd) => {
            return {
                name: cmd.name || "Command Not Named!",
                description: cmd.description || "NO DESCRIPTION!"
            };
        })



        const categories = directories.map((dir) => {
            const getCommands = client.commands
                .filter((cmd) => cmd.directory === dir)
                .map((cmd) => {
                    return {
                        name: cmd.name || "Command Not Named!",
                        description: cmd.description || "NO DESCRIPTION!",
                        arguments: cmd.arguments || '\u200B',
                    };
                })

            return {
                directory: dir,
                commands: getCommands
            };
        })

        // Hides secret commands by removing them from the list
        for (var x = 0; x < categories.length; x++) {
            if (categories[x].directory.includes("secret")) {
                categories.splice(x, 1);
            }
        }


        const embed = new MessageEmbed().setDescription("Please choose a category in the dropdown menu.")

        function Components(state) {
            const row = new MessageActionRow().addComponents(
                new MessageSelectMenu()
                    .setCustomId('help_menu')
                    .setPlaceholder('Select a category')
                    .setDisabled(state)
                    .addOptions(
                        categories.map((cmd) => {
                            return {
                                label: !cmd.directory.includes("secret") ? cmd.directory.replace(/^.*[\\\/]/, '') : " ",
                                description: `Commands from ${cmd.directory.replace(/^.*[\\\/]/, '')}`,
                                value: cmd.directory.toLowerCase(),
                            }
                        })
                    ),
            );

            return row;

        }

        const initial_message = await message.channel.send({
            embeds: [embed],
            components: [Components(false)]
        })

        const filter = i => {
            return (message.author.id === i.user.id) && i !== undefined && i.isSelectMenu();
        }
        const coll = message.channel.createMessageComponentCollector({ filter, componentType: 'SELECT_MENU', time: 15 * 1000 });

        coll.on('collect', async i => {
            client.player.once("help", () => {
                coll.stop();
            })
            //await i.deferUpdate();
            console.log(i.values)
            const [directory] = i.values;

            // essentially finds where x.directory is equal to directory choice in categories map
            const category = categories.find(x => x.directory.toLowerCase() === directory);

            let directoryEasy = directory.replace(/^.*[\\\/]/, '');
            const categoryEmbed = new MessageEmbed()
                .setTitle(`${directoryEasy.charAt(0).toUpperCase() + directoryEasy.substring(1)} commands`)
                .setDescription("Command List:")
                .addFields(
                    category.commands.map((cmd) => {
                        return {
                            name: `\`${cmd.name}\` ${cmd.arguments}`,
                            value: `${cmd.description}`,
                            inline: true
                        }
                    })
                )

            i.update({ embeds: [categoryEmbed] })
        });


    }

}

