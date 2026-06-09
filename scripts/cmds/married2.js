const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "married2",
    version: "1.0",
    author: "Raihan Choudhury",
    countDown: 5,
    role: 0,
    shortDescription: "Married2 banner",
    longDescription: "Generate a married banner using Avatar Canvas API",
    category: "banner",
    guide: {
      en: "{pn} @mention / reply"
    }
  }
};

module.exports.onStart = async function ({ message, event }) {
  const { senderID, mentions, messageReply } = event;

  let targetID =
    messageReply?.senderID ||
    (mentions && Object.keys(mentions)[0]);

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
        cmd: "married2",
        senderID,
        targetID
      },
      {
        responseType: "arraybuffer",
        timeout: 30000
      }
    );

    const tmpDir = path.join(__dirname, "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const imgPath = path.join(
      tmpDir,
      `married2_${senderID}_${targetID}.png`
    );

    fs.writeFileSync(imgPath, res.data);

    return message.reply(
      {
        body: "তোমাদের বিয়ে এখন অফিসিয়ালি সম্পন্ন হলো! 🥰",
        attachment: fs.createReadStream(imgPath)
      },
      () => fs.unlinkSync(imgPath)
    );

  } catch {
    return message.reply("API Error Call Boss SAHU");
  }
};
