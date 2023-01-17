module.exports = {
    name: 'say',
    description: 'Make Bendel Talk!',
    directory: __dirname,
    premium: false,
    async execute(client, message, args) {
        let sayMessage = message.content.split(' ').slice(1).join(' ');
        message.channel.send(sayMessage);
    }
}