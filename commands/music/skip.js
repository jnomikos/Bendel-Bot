
module.exports = {
    name: 'skip',
    description: 'Skips the current song that is playing',
    directory: __dirname,
    async execute(client, message, args) {
        let guildQueue = client.player.getQueue(message.guild.id);
        if (!guildQueue || !guildQueue.isPlaying) return;


        if (guildQueue.paused === true) {

            guildQueue.setPaused(false); // resumes the player if skipped because paused skip is weird

        }
        skippedSong = await guildQueue.skip();

        if (skippedSong !== undefined) {
            //song_playing_timeout(guildQueue, client, message);
            client.player.once('songChanged', (queue, newSong, oldSong) => {
                console.log("Yeah song first")
                //song_playing_timeout(queue, client, message);
                //song_now_playing(client, message);
            })

        } else {
            console.log("buh")
            guildQueue.stop();
        }
    }

}
