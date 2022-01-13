const { MessageEmbed } = require("discord.js");
const lyrics = require('lyrics-finder'); // npm i lyrics-finder


module.exports = {
    name: 'lyrics',
    description: 'Searches song lyrics from google given a song name',
    directory: __dirname,

    async execute(client, message, args) {
        if (!args.length) return message.channel.send('No song specified');
        let embed = new MessageEmbed().setColor('RANDOM').setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL());

        let lyric = await lyrics(args.join(' ')); // Searching for the lyrics on Google
        let noLyric = 0 // Indicates if the lyrics exist or not
        if (!lyric) {
            lyric = `No Lyrics found for ${args.join(' ')}`; // Handles no lyrics
            noLyric++ // Increments noLyric to indicate theres no lyrics
        }
        console.log(lyric)
        embed.setDescription(lyric.length >= 4093 ? lyric.substring(0, 4093) + '...' : lyric); // Adds the lyrics to the embed

        if (noLyric == 0) {
            //let res = await yt.search(args.join(' ')); // Searches the song name on youtube
            //let song = res.videos[0]; // Chooses the first result
            //if (song) embed.setTitle(song.title).setURL(song.url).setThumbnail(song.image) // Adds the youtube video data to the embed
        }

        message.channel.send({ embeds: [embed] }) // Sends the embed

        //if (args.length > 1) {
        //var artist = args[0];
        //var title = args[1];
        //}

    }

}