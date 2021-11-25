const { leave_channel, connect_to_channel } = require("../music_commands");

module.exports = {
    name: 'leave',
    description: 'Leaves voice channel',

    async execute() {
        await leave_channel();
    }
}