const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "pastebin",
    aliases: ["bin"],
    version: "1.0",
    author: "ashik",
    countDown: 5,
    role: 0,
    shortDescription: "Send command file",
    longDescription: "Send command source file directly",
    category: "utility",
    guide: "{pn} <commandName>"
  },

  onStart: async function ({ message, args }) {
    try {
      const cmdName = args[0];

      if (!cmdName) {
        return message.reply("❌ | Usage: /bin <commandName>");
      }

      const cmdPath = path.join(__dirname, `${cmdName}.js`);

      if (!fs.existsSync(cmdPath)) {
        const files = fs.readdirSync(__dirname)
          .filter(file => file.endsWith(".js"))
          .join("\n");

        return message.reply(
          `❌ | Command "${cmdName}" not found.\n\n📂 Available Commands:\n${files}`
        );
      }

      return message.reply({
        body: `📄 Source File: ${cmdName}.js`,
        attachment: fs.createReadStream(cmdPath)
      });

    } catch (err) {
      console.error(err);
      return message.reply(`❌ | Error: ${err.message}`);
    }
  }
};
