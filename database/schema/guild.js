const mongoose = require("mongoose");

const dotenv = require('dotenv');

const guildSchema = new mongoose.Schema({

    guildID: { type: String, require: true }, //ID of the guild
    prefix: { type: String, default: '-' },
    premium: { type: Boolean, default: false },
    bot_channel: { type: String, require: false },
    fire_toggle: { type: Boolean, default: false },
    song_history: { type: Array, default: [] }
});

const model = mongoose.model("guildModels", guildSchema)

module.exports = model;