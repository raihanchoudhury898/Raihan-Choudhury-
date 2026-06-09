const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "hug2",
    version: "1.0",
    author: "Raihan Choudhury",
    countDown: 5,
    role: 0,
    shortDescription: "Hug2 banner",
    longDescription: "Generate hug2 frame using Avatar Canvas API",
    category: "banner",
    guide: {
      en: "{pn} @mention / reply"
    }
  }
};

const captions = [
  "ভালোবাসা যদি কোনো অনুভূতি হয়, তাহলে তোমার প্রতি আমার অনুভূতি পৃথিবীর সেরা অনুভূতি!🌺",
  "তুমি আমার জীবনের সেরা অধ্যায়, যেই অধ্যায় বারবার পড়তে ইচ্ছে করে!😘",
  "তোমার ভালোবাসার মূল্য আমি কিভাবে দেবো, তা আমার জানা নেই, শুধু জানি প্রথম থেকে যে ভাবে ভালোবেসেছিলাম💜 সেভাবেই ভালোবেসে যাবো!🫶",
  "আমি প্রেমে পড়ার আগে তোমার মায়ায় জড়িয়ে গেছি, যে মায়া নেশার মতো—আমি চাইলে তোমার নেশা কাটিয়ে উঠতে পারি না!💞",
  "তোমাকে চেয়েছিলাম, আর তোমাকেই চাই—তুমি আমার ভালোবাসা🖤 তুমি আমার বেঁচে থাকার কারণ!🥰",
  "আমার কাছে তোমাকে ভালোবাসার কোনো সংজ্ঞা নেই, তোমাকে ভালোবেসে যাওয়া হচ্ছে আমার নিশ্চুপ অনুভূতি!😍",
  "তুমি আমার জীবনের সেই গল্প, যা পড়তে গিয়ে প্রতিবারই নতুন কিছু আবিষ্কার করি!🌻",
  "আমার মনের গহীনে বাস করা রাজকন্যা—তোমাকে অনেক ভালোবাসি।❤️‍🩹",
  "I feel complete in my life, যখন ভাবি তোমার মতো একটা লক্ষ্মী মানুষ আমার জীবন সঙ্গী!🌺",
  "যে তোমার ভাবনার সাথে মিলে যায়, তাকে কখনো ছেড়ে দিও না 🤗 এমন মানুষ সবার জীবনে আসে না!😘",
  "তোমার একটুকরো ভালোবাসায় আমি পুরোটা জীবন কেটে দিতে পারি!💜",
  "তোমার হাসিতে যেন আমার পৃথিবী থেমে যায়!😊",
  "তুমি শুধু একজন মানুষ নও, তুমি আমার অনুভব, আমার মন!🖤",
  "তুমি আমার সবকিছু, আমার আজ, আমার আগামী!❤️‍🔥",
  "তোমার চোখে চোখ রাখলেই সব ব্যথা ভুলে যাই!😘"
];

module.exports.onStart = async function ({ message, event }) {
  const { mentions, messageReply } = event;

  let targetID =
    messageReply?.senderID ||
    (mentions && Object.keys(mentions)[0]);

  if (!targetID) {
    return message.reply("Please reply or mention someone......");
  }

  try {
    const tmpDir = path.join(__dirname, "tmp");
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

    const apiList = await axios.get(
      "https://raw.githubusercontent.com/shahadat-sahu/SAHU-API/refs/heads/main/SAHU-API.json"
    );

    const AVATAR_CANVAS_API = apiList.data.AvatarCanvas;

    const res = await axios.post(
      `${AVATAR_CANVAS_API}/api`,
      {
        cmd: "hug2",
        targetID
      },
      {
        responseType: "arraybuffer",
        timeout: 30000
      }
    );

    const imgPath = path.join(
      tmpDir,
      `hug2_${targetID}.png`
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
