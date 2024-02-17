const { exec } = require('child_process');

module.exports = {
    name: 'whitelist_mc',
    description: '...',
    directory: __dirname,
    premium: false,
    async execute(client, message, args) {
        function onlyLettersAndNumbers(str) {
            return /^[A-Za-z0-9]*$/.test(str);
        }


        if(message.guild.id != "655658518824747049") {
            message.reply("Sorry, this is a command exclusive to the Taco Rebellion server.")
            return;
        }

        if(!onlyLettersAndNumbers(args) || args.length > 16) {
            message.reply("Sorry, the username can only contain letters and numbers and must be 16 characters or less.")
            return;
        }

        let execStr = "ssh minecraft@192.168.1.73 '/opt/minecraft/whitelist.sh "

        exec(execStr + args + "\'", (err, stdout, stderr) => {
            if (err) {
              //some err occurred
              console.error(err)
              message.reply("An error occurred when trying to whitelist the user.")
              return;
            } else {
                // the *entire* stdout and stderr (buffered)
                console.log(`stdout: ${stdout}`);
                console.log(`stderr: ${stderr}`);
                message.reply("The user has been whitelisted.")
            }
        });
        
    }
}

