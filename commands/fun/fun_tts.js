const { spawn } = require('child_process')
const fs = require('fs')
const { createAudioPlayer } = require('@discordjs/voice');
const { joinVoiceChannel } = require('@discordjs/voice');
const { getVoiceConnection } = require('@discordjs/voice');
const { createReadStream } = require('node:fs');
const { join } = require('node:path');
const { createAudioResource, StreamType } = require('@discordjs/voice');


const { Readable } = require('stream');
const Lame = require("node-lame").Lame;


module.exports = {
    name: 'fun_tts',
    arguments: 'language code, message',
    description: 'Make Bendel talk!',
    directory: __dirname,
    premium: true,
    async execute(client, message, args) {


        let guildQueue = client.player.getQueue(message.guild.id);

        if (guildQueue && guildQueue.songs.length > 0) {
            message.reply("Text to speech only works when there are no songs in the queue!");
            return;
        }

        console.log(args[1])


        const childPython = spawn('python', ['fifteen_api.py', args[0], args[1]]);
        let runPy = new Promise(function (success, nosuccess) {

            let path;
            childPython.stdout.on('data', (data) => {



                path = data.toString()
                success(data);

            })

            childPython.stderr.on('data', (data) => {
                nosuccess(data);
            });



        });

        runPy.then(async function (fromRunpy) {
            fromRunpy = fromRunpy.toString();
            let queue = client.player.createQueue(message.guild.id);
            await queue.join(message.member.voice.channel);
            let resource;





            setTimeout(() => {
                resource = createAudioResource(createReadStream(join(__dirname, "sound_file.wav"), {
                    inputType: StreamType.Raw,
                }));
                if (resource)

                    queue.connection.playAudioStream(resource);

                message.react('💬');
            }, 5000);

        }).catch(function (resolve) {
            console.log("Promise rejected: ", resolve.toString());
        });
    }

}

