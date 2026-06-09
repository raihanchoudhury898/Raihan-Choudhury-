const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "hug",
    version: "1.0",
    author: "Raihan Choudhury",
    countDown: 5,
    role: 0,
    shortDescription: "Hug banner",
    longDescription: "Generate hug frame using Avatar Canvas API",
    category: "banner",
    guide: {
      en: "{pn} @mention / reply"
    }
  }
};

const captions = [
  "❝ যদি কখনো অনুভূতি হয়, তাহলে তোমার প্রতি আমার অনুভূতি পৃথিবীর সেরা অনুভূতি!🌻",
  "❝ তুমি আমার জীবনের সেরা অধ্যায়, যেই অধ্যায় বারবার পড়তে ইচ্ছে করে!💝",
  "❝ তোমার ভালোবাসার মূল্য আমি কিভাবে দেবো তা জানি না— শুধু জানি তোমাকে হারাতে চাই না!❤️",
  "❝ আমি প্রেমে পড়ার আগে তোমার মায়ায় জড়িয়ে গেছি, যে মায়া নেশার মতো!💘",
  "❝ তুমি আমার ভালোবাসা, আমার শান্তি, আমার সবকিছু!💞",
  "❝ তোমাকে ভালোবাসা আমার জীবনের সবচেয়ে সুন্দর অনুভূতি!❤️‍🔥",
  "❝ তুমি আমার জীবনের সেই গল্প, যা প্রতিবার পড়লে নতুন প্রেম জাগে!💚",
  "❝ তোমাকে অনেক অনেক ভালোবাসি আমার রাজকন্যা।❤️‍🩹",
  "❝ You complete me. A warm hug just for you!🌺"
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
        cmd: "hug",
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
      `hug_${senderID}_${targetID}.png`
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
