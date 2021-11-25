const { MessageEmbed } = require('discord.js');

const exampleEmbed = new MessageEmbed()
    .setColor('#cc0000')
    .setTitle('Some title')
    .setURL('https://discord.js.org/')
    .setAuthor('Some name', 'https://i.imgur.com/AfFp7pu.png', 'https://discord.js.org')
    .setDescription('Some description here')
    .setThumbnail('https://i.imgur.com/AfFp7pu.png')
    .addFields(
        { name: 'Regular field title', value: 'Some value here' },
        { name: '\u200B', value: '\u200B' },
        { name: 'Inline field title', value: 'Some value here', inline: true },
        { name: 'Inline field title', value: 'Some value here', inline: true },
    )
    .addField('Inline field title', 'Some value here', true)
    .setImage('https://i.imgur.com/AfFp7pu.png')
    .setTimestamp()
    .setFooter('Some footer text here', 'https://i.imgur.com/AfFp7pu.png');

const severe_error = new MessageEmbed()
    .setColor('#cc0000')
    .setTitle('Error')
    .setDescription('An unexpected error has occured, please try again...')
    .setImage('https://imgpile.com/images/U2Lhgk.png')

const now_playing = new MessageEmbed()
    .setColor('#cc0000')
    .setTitle('Now Playing')
    .setThumbnail('https://tenor.com/view/sound-gif-23229777')
    .setDescription('')

const loading_song = new MessageEmbed()
    .setColor('#cc0000')
    .setTitle('Loading music...')

module.exports = { exampleEmbed, severe_error };
