var server_timer_dict = {}
async function spam_prevention(channel) {
    if (Date.now() - server_timer_dict['channel'] < 800) {
        return false;
    }
    server_timer_dict['channel'] = Date.now();
    return true;
}
module.exports.spam_prevention = spam_prevention;