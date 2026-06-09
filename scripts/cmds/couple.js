const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "couple",
    version: "1.0",
    author: "Raihan Choudhury",
    countDown: 5,
    role: 0,
    shortDescription: "Couple banner",
    longDescription: "Generate a couple banner using Avatar Canvas API",
    category: "banner",
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
      return message.reply("Please reply or mention someone......");
    }

    try {
      const apiList = await axios.get(
        "https://raw.githubusercontent.com/shahadat-sahu/SAHU-API/refs/heads/main/SAHU-API.json"
      );

      const AVATAR_CANVAS_API = apiList.data.AvatarCanvas;

      const res = await axios.post(
        `${AVATAR_CANVAS_API}/api`,
        {
          cmd: "love3",
          senderID,
          targetID
        },
        { responseType: "arraybuffer", timeout: 20000 }
      );

      const imgPath = path.join(
        __dirname,
        "tmp",
        `love3_${senderID}_${targetID}.png`
      );

      fs.writeFileSync(imgPath, res.data);

      const successBody = "❤️ SUCCESS MESSAGE HERE ❤️";

      return message.reply(
        {
          body: successBody,
          attachment: fs.createReadStream(imgPath)
        },
        () => fs.unlinkSync(imgPath)
      );

    } catch (e) {
      return message.reply("API Error Call Boss SAHU");
    }
  }
};
