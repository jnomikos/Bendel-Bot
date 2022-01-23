const mongoose = require("mongoose");

const premiumSchedule = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    guildId: {
        type: String,
        required: true
    }
})


const name = 'premium_schedule';

module.exports = mongoose.model[name] || mongoose.model(name, premiumSchedule);