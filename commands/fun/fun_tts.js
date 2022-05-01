const { spawn } = require('child_process')
const fs = require('fs')
const { createAudioPlayer } = require('@discordjs/voice');
const { joinVoiceChannel } = require('@discordjs/voice');
const { getVoiceConnection } = require('@discordjs/voice');
const { createReadStream } = require('node:fs');
const { join } = require('node:path');
const { createAudioResource, StreamType } = require('@discordjs/voice');
const { MessageEmbed } = require("discord.js");

const { Readable } = require('stream');
const Lame = require("node-lame").Lame;


module.exports = {
    name: 'fun_tts',
    arguments: `\`*character*\`, \`*message*\``,
    description: 'Make Bendel talk using characters from 15.ai! (ex. -fun_tts spongebob Hello!',
    directory: __dirname,
    premium: true,
    async execute(client, message, args) {

        if (args.length == 0) {
            const usageEmbed = new MessageEmbed()

                .setTitle(`Fun TTS`)

                .setDescription(`This command lets you use text to speech on all kinds of different characters from 15.ai.
                
                How to use:
                (For one first names)
                -${this.name} \`character\` \`message\`
                
                (For first and last names)
                -${this.name} \`character; message\``)
                .addFields(
                    { name: 'SpongeBob SquarePants:', value: '\`SpongeBob SquarePants\`', inline: true },
                    { name: 'Portal:', value: '\`GLaDOS\`, \`Wheatley\`, \`Sentry Turret\`, \`Chell\`', inline: true },
                    { name: 'Persona 4:', value: '\`Rise Kujikawa\`', inline: true },
                    { name: 'Steven Universe:', value: '\`Steven Universe\`', inline: true },
                    { name: 'Dan Vs.:', value: '\`Dan\`', inline: true },
                    { name: 'The Stanley Parable:', value: '\`The Narrator\`, \`Stanley\`, ', inline: true },
                    { name: '2001: A Space Odyssey:', value: '\`HAL 9000\`', inline: true },
                    { name: 'Doctor Who:', value: '\`Tenth Doctor\`', inline: true },
                    { name: 'HuniePop:', value: '\`Kyu Sugardust\`', inline: true },
                    { name: 'Daria:', value: '\`Daria Morgendorffer\`, \`Jane Lane\`', inline: true },
                    { name: 'Aqua Teen Hunger Force:', value: '\`Carl Brutananadilewski\`', inline: true },
                    { name: 'Team Fortress 2:', value: '\`Miss Pauling\`, \`Scout\`, \`Soldier\`, \`Demoman\`, \`Heavy\`, \`Engineer\`, \`Medic\`, \`Sniper\`, \`Spy\`', inline: true },
                    { name: 'Undertale:', value: '\`Sans\`, \`Papyrus\`, \`Flowey\`, \`Toriel\`, \`Asgore\`, \`Asriel\`, \`Alphys\`, \`Undyne\`, \`Mettaton\`, \`Temmie\`, \`Susie\`, \`Noelle\`, \`Berdley\`, \`Rudolph\`, \`Ralsei\`, \`Lancer\`, \`King\`, \`Queen\`, \`Jevil\`, \`Spamton\`, \`Gaster\`', inline: true },
                    { name: 'Equestria Girls:', value: '\`Sunset Shimmer\`, \`Adagio Dazzle\`, \`Aria Blaze\`, \`Sonata Dusk\`', inline: true },
                    { name: 'My Little Pony: Friendship is Magic', value: '\`Twilight Sparkle\`, \`Fluttershy\`, \`Rarity\`, \`Rainbow Dash\`, \`Pinkie Pie\`, \`Applejack\`, \`Princess Celestia\`, \`Princess Luna\`, \`Spike\`, \`Starlight Glimmer\`, \`Trixie\`, \`Apple Bloom\`, \`Sweetie Belle\`, \`Scootaloo\`, \`Zecora\`, \`Derpy Hooves\`, \`Lyra\`, \`Bon Bon\`, \`Princess Cadance\`, \`Cozy Glow\`, \`Queen Chrysalis\`, \`Spitfire\`, \`Big Mac\`, \`Sunburst\`, \`Minuette\`, \`Cheerilee\`, \`Coco Pommel\`, \`Maud Pie\`, \`Shining Armor\`, \`Sugar Belle\`, \`Vapor Trail\`, \`Moondancer\`, \`Lightning Dust\`, \`Discord\`, \`Soarin\'\`, \`Diamond Tiara\`, \`Silver Spoon\`, \`Octavia\`, \`Gilda\`, \`Gabby\`, \`Limestone Pie\`, \`Braeburn\`, \`Daring Do\`, \`Snips\`, \`Snails\`', inline: true },
                )
                .setFooter('All credit of this TTS goes to 15.ai. (They are definitely a Broney lol 🤣🤣🤣)')

            message.reply({
                embeds: [usageEmbed]
            })
            return;
        }

        const loadingEmbed = new MessageEmbed()
            .setDescription(`\`Loading TTS...\``)

        // Embeds
        function textBox(color, author, tts_msg, thumbnail) {
            const exampleEmbed = new MessageEmbed()
                .setColor(`${color}`)
                .setTitle(`${author}`)

                .setDescription(`${tts_msg}`)
                .setThumbnail(`${thumbnail}`)
                .setFooter('TTS from 15.ai')

            return exampleEmbed;
        }



        let guildQueue = client.player.getQueue(message.guild.id);
        let queue = client.player.createQueue(message.guild.id);
        await queue.join(message.member.voice.channel);
        load_msg = await message.reply({
            embeds: [loadingEmbed]
        })

        if (guildQueue && guildQueue.songs.length > 0) {
            message.reply("Text to speech only works when there are no songs in the queue!");
            return;
        }
        let command = ""

        function custom_embeds(entry, tts_msg) {
            // TF2
            switch (entry.toLowerCase()) {
                case 'spy':
                    load_msg.edit({ // loading reply
                        embeds: [textBox("BLACK", entry.toString(), tts_msg.toString(), 'https://wiki.teamfortress.com/w/images/thumb/9/9b/Icon_spy.jpg/150px-Icon_spy.jpg')]
                    });
                    break;
                case 'scout':
                    break;
                default:
                    load_msg.edit({ // loading reply
                        embeds: [textBox("DARK_BUT_NOT_BLACK", entry.toString(), tts_msg.toString(), 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Icon-round-Question_mark.svg/1200px-Icon-round-Question_mark.svg.png')]
                    });

            }
        }

        function fix_entry(entry) {
            if (entry.toLowerCase() === "spongebob squarepants" || entry.toLowerCase() === "spongebob" || entry.toLowerCase() === "sb") {
                entry = "SpongeBob SquarePants";
            } else { // If character name is not an exeception with case

                entry = entry.split(" ");

                for (let i = 0; i < entry.length; i++) {
                    entry[i] = entry[i][0].toUpperCase() + entry[i].substr(1);
                }

                entry = entry.join(" ");

            }

            return entry;
        }

        const path = message.guild.id + ".wav";

        fs.writeFile(`${message.guild.id}.wav`, '', function (err) {
            if (err) throw err;
            console.log('File is created successfully.');
        });



        // Puts rest of args in word
        for (cur = 0; cur < args.length; cur++) {
            command += args[cur] + " "
        }

        command = command.split(';');
        console.log(command[0])
        console.log(command[1])

        let character = "", word = "";
        if (command.length < 2) {
            character = fix_entry(args[0]);

            for (cur = 1; cur < args.length; cur++) {
                word += args[cur] + " "
            }

        } else {
            character = command[0]
            word = command[1]

            character = fix_entry(character);
            //console.log(character, " ", word)
        }

        const childPython = spawn('python', ['fifteen_api.py', character, path, word]);
        let runPy = new Promise(function (success, nosuccess) {


            childPython.stdout.on('data', (data) => {




                success(data);

            })

            childPython.stderr.on('data', (data) => {
                console.log(data.toString())
                nosuccess(data);
            });



        });

        runPy.then(async function (fromRunpy) {
            fromRunpy = fromRunpy.toString();
            let resource;






            resource = createAudioResource(createReadStream(path, {
                inputType: StreamType.Raw,
            }));
            if (resource) {
                queue.connection.playAudioStream(resource);
                message.react('💬');
            }




            client.player.once('queueEnd', async (queue) => {
                try {
                    fs.unlinkSync(path)
                    //file removed
                } catch (err) {
                    console.error(err)
                }
            })
            custom_embeds(character, word);

        }).catch(function (resolve) {
            console.log("Promise rejected: ", resolve.toString());
            load_msg.edit(resolve.toString())
        });
    }

}

