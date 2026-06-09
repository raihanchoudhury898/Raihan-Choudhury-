const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "love",
    version: "1.0",
    author: "Raihan Choudhury",
    countDown: 5,
    role: 0,
    shortDescription: "Love banner",
    longDescription: "Generate a couple banner using Avatar Canvas API",
    category: "banner",
    guide: {
      en: "{pn} @mention / reply"
    }
  }
};

const captions = [
  "💖 ⎯͢⎯⃝🩷😽 তুমি আমার চোখেতে সরলতার উপমা ⎯͢⎯⃝🩷🐰🍒",
  "💖 🥺❤️ প্রিয়.....! 😊\nকখনো কাঁদাও, কখনো হাসাও,\nআবার কখনো এমন ভালোবাসা দাও,\nযেন পৃথিবীর সব সুখ তোমার মাঝে খুঁজে পাই...! 💔❤️",
  "বিচ্ছেদের পরেও যোগাযোগ রাখার নামই হচ্ছে মায়া ____💖 💗🌺",
  "মানুষ ছেড়ে যায়, কিন্তু স্মৃতি নয়!💖",
  "ইচ্ছে 'গুলো শব্দহীন...!! ভাবনা সে-তো প্রতি দিন..! 🌸💔",
  "ভালোবাসা মানে কেবল প্রেম নয়, বরং যার হাসিতে সকাল শুরু হয় 💖",
  "যে সম্পর্ক চোখে দেখা যায় না, মনে থাকে— সেটাই সত্যিকারের ভালোবাসা 💗",
  "তুমি হয়তো দূরে আছো, কিন্তু অনুভূতির ঠিকানা এখনো তুমি!💞",
  "চোখের ভাষা বোঝে যে, সেই প্রিয় ❤️",
  "তুমি মিষ্টি অভ্যাস— যাকে ছাড়াও থাকা যায় না 💖"
];

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
        cmd: "love",
        senderID,
        targetID
      },
      {
        responseType: "arraybuffer",
        timeout: 20000
      }
    );

    const tmpDir = path.join(__dirname, "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

    const imgPath = path.join(
      tmpDir,
      `love_${senderID}_${targetID}.png`
    );

    fs.writeFileSync(imgPath, res.data);

    const caption =
      captions[Math.floor(Math.random() * captions.length)];

    return message.reply(
      {
        body: caption,
        attachment: fs.createReadStream(imgPath)
      },
      () => fs.unlinkSync(imgPath)
    );

  } catch {
    return message.reply("API Error Call Boss SAHU");
  }
};
