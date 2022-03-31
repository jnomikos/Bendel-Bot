module.exports = {
    name: 'dance_party',
    description: 'DANCE PARTY!',
    directory: __dirname,
    premium: true,
    async execute(client, message, args) {
        let dance = Math.floor(Math.random() * 10);
        switch (dance) {
            case 1:
                message.reply('https://tenor.com/view/lil-jonah-dance-weird-floss-dance-gif-17142054');
                break;
            case 2:
                message.reply('https://tenor.com/view/harry-quentin-high-dancing-party-gif-17410505');
                break;
            case 3:
                message.reply('https://tenor.com/view/sam-palmer-dancing-silly-gif-17037048');
                break;
            case 4:
                message.reply('https://tenor.com/view/israel-palestine-dwarf-hate-dance-gif-17509290');
                break;
            case 5:
                message.reply('https://tenor.com/view/dancingbaby-gif-22415743');
                break;
            case 6:
                message.reply('https://tenor.com/view/yippee-yippee-gif-yippee-emoji-emoji-yippee-yes-gif-23460730');
                break;
            case 7:
                message.reply('https://tenor.com/view/woman-dancing-dancing-woman-dancing-emoji-dance-dancing-gif-23188102');
                break;
            case 8:
                message.reply('https://tenor.com/view/chika-funny-dance-dimas-auchreill-aslami-gif-19539965');
                break;
            case 9:
                message.reply('https://tenor.com/view/dj-khaled-dance-slocal-jarrel-the-young-its-nate-saturday-dance-gif-15204877');
                break;
            default:
                message.reply('https://tenor.com/view/killerbean-gif-20706735');
                break;
        }
    }


}

