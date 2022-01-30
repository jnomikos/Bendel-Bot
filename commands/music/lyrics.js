const { MessageEmbed } = require("discord.js");
const genius = require("genius-lyrics");
const genius_client = new genius.Client(process.env.GENIUS_KEY);
module.exports = {
    name: 'lyrics',
    description: 'Fetches lyrics from Genius.com',
    directory: __dirname,
    premium: true,

    async execute(client, message, args) {
        if (!args.length) return message.channel.send('No song specified');
        let embed = new MessageEmbed().setColor('RANDOM').setFooter(`Requested by ${message.author.tag}`, message.author.displayAvatarURL());


        const searches = await genius_client.songs.search(args.join(' '));
        const firstSong = searches[0];
        if (!firstSong) return;
        const lyrics = await firstSong.lyrics();
        console.log(firstSong);
        embed.setTitle(firstSong.title).setAuthor(`${firstSong.artist.name}`, `${firstSong.artist.thumbnail}`, `${firstSong.url}`).setThumbnail(`${firstSong.image}`);

        embed.setDescription(lyrics.length >= 4093 ? lyrics.substring(0, 4093) + '...' : lyrics); // Adds the lyrics to the embed
        message.channel.send({ embeds: [embed] });

        /*let lyric = await lyrics(args.join(' ')); // Searching for the lyrics on Google
        let noLyric = 0 // Indicates if the lyrics exist or not
        if (!lyric) {
            lyric = `No Lyrics found for ${args.join(' ')}`; // Handles no lyrics
            noLyric++ // Increments noLyric to indicate theres no lyrics
        }
        console.log(lyric)
        

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
        */
    }

}