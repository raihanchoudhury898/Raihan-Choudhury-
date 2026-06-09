const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "gf",
    version: "1.0",
    author: "Raihan Choudhury",
    countDown: 5,
    role: 0,
    shortDescription: "GF banner",
    longDescription: "Generate a girlfriend banner using Avatar Canvas API",
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
      "https://raw.githubusercontent.com/shahadat-sahu/SAHU-API/main/SAHU-API.json"
    );

    const AVATAR_CANVAS_API = apiList.data.AvatarCanvas;
    if (!AVATAR_CANVAS_API) throw new Error("API missing");

    const res = await axios.post(
      `${AVATAR_CANVAS_API}/api`,
      {
        cmd: "gf",
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
      `gf_${senderID}_${targetID}.png`
    );

    fs.writeFileSync(imgPath, res.data);

    return message.reply(
      {
        body: "~এই নে তোর গার্লফ্রেন্ড অন্য মেয়ের দিকে নজর দিস না 😍😸",
        attachment: fs.createReadStream(imgPath)
      },
      () => fs.unlinkSync(imgPath)
    );

  } catch (e) {
    return message.reply("GF API Error | SAHU-API unreachable");
  }
};
