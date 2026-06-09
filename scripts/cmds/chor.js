const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "chor",
    version: "1.0",
    author: "Raihan Choudhury",
    countDown: 5,
    role: 0,
    shortDescription: "Chor meme",
    longDescription: "Scooby-doo style chor meme using Avatar Canvas API",
    category: "fun",
    guide: {
      en: "{pn} @mention / reply"
    }
  },

  onStart: async function ({ message, event }) {
    const { senderID, mentions, messageReply } = event;

    let targetID = null;

    if (mentions && Object.keys(mentions).length > 0) {
      targetID = Object.keys(mentions)[0];
    } else if (messageReply && messageReply.senderID) {
      targetID = messageReply.senderID;
    }

    if (!targetID) {
      return message.reply("Please reply or mention someone.");
    }

    try {
      const apiList = await axios.get(
        "https://raw.githubusercontent.com/shahadat-sahu/SAHU-API/refs/heads/main/SAHU-API.json"
      );

      const AVATAR_CANVAS_API = apiList.data.AvatarCanvas;

      const res = await axios.post(
        `${AVATAR_CANVAS_API}/api`,
        {
          cmd: "chor",
          senderID: targetID,
          targetID: senderID
        },
        {
          responseType: "arraybuffer",
          timeout: 30000
        }
      );

      const imgPath = path.join(
        __dirname,
        "tmp",
        `chor_${senderID}_${targetID}.png`
      );

      fs.writeFileSync(imgPath, res.data);

      return message.reply(
        {
          body: "~বলদ মেয়েদের চিপায় ধরা খাইছে😹🤣",
          attachment: fs.createReadStream(imgPath)
        },
        () => fs.unlinkSync(imgPath)
      );

    } catch (error) {
      return message.reply("API Error Call Boss SAHU.");
    }
  }
};
