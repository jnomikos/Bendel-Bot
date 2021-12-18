const mongoose = require("mongoose");

const dotenv = require('dotenv');

const guildSchema = new mongoose.Schema({

    guildID: { type: String, require: true }, //ID of the guild
    prefix: { type: String, default: '-' },
    fire_toggle: { type: Boolean, default: false }
});

const model = mongoose.model("guildModels", guildSchema)

module.exports = model;