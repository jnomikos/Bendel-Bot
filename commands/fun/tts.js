const tts = require('google-tts-api');
const download = require('download');
const { createAudioResource } = require('@discordjs/voice');
const { Readable } = require('stream');


module.exports = {
    name: 'tts',
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


        let Lang = args.shift();

        let urls;

        try {
            urls = tts.getAllAudioUrls(args.join(' '), {
                lang: Lang,
                slow: false
            }).map(val => val.url);
        } catch (error) {
            console.log(error);
            if (error.toString().includes("TypeError: text should be a string")) {
                message.reply("You need to include the language code before your message. Example: \`-tts en-US Bendel bot is awesome!\` \nLanguage codes can be found here: <https://cloud.google.com/speech-to-text/docs/languages>");
            }
            return;
        }

        for (let url of urls) {
            await new Promise(async (resolve, reject) => {

                let queue = client.player.createQueue(message.guild.id);
                await queue.join(message.member.voice.channel);

                let resource;
                try {
                    resource = createAudioResource(Readable.from(await download(url)), {
                        metadata: {
                            title: 'A good song!',
                        },
                    });
                } catch (error) {
                    message.reply("Error downloading tts. Make sure you included a language code before your message: <https://cloud.google.com/speech-to-text/docs/languages>")
                }
                if (resource)
                    queue.connection.playAudioStream(resource);

                message.react('💬');
            })
        }
    }

}

