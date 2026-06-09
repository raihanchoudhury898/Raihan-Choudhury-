const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "crush",
    version: "1.0",
    author: "Raihan Choudhury",
    countDown: 5,
    role: 0,
    shortDescription: "Crush banner",
    longDescription: "Generate a crush banner using Avatar Canvas API",
    category: "banner",
    guide: {
      en: "{pn} @mention / reply"
    }
  }
};


const crushCaptions = [
  "প্রেমে যদি অপূর্ণতাই সুন্দর হয়, তবে পূর্ণতার সৌন্দর্য কোথায়?❤️",
  "যদি বৃষ্টি হতাম… তোমার দৃষ্টি ছুঁয়ে দিতাম! চোখে জমা বিষাদটুকু এক নিমেষে ধুয়ে দিতাম🤗",
  "তোমার ভালোবাসার প্রতিচ্ছবি দেখেছি বারে বার💖",
  "তোমার সাথে একটি দিন হতে পারে ভালো, কিন্তু তোমার সাথে সবগুলি দিন হতে পারে ভালোবাসা🌸",
  "এক বছর নয়, কয়েক জন্ম শুধু তোমার প্রেমে পরতে পরতে ই চলে যাবে😍",
  "কেমন করে এই মনটা দেব তোমাকে… বেসেছি যাকে ভালো আমি, মন দিয়েছি তাকে🫶",
  "পিছু পিছু ঘুরলে কি আর প্রেম হয়ে যায়… কাছে এসে বাসলে ভালো, মন পাওয়া যায়❤️‍🩹",
  "তুমি থাকলে নিজেকে এমন সুখী মনে হয়, যেনো আমার জীবনে কোনো দুঃখই নেই😊",
  "তোমার হাতটা ধরতে পারলে মনে হয় পুরো পৃথিবীটা ধরে আছি🥰",
  "তোমার প্রতি ভালো লাগা যেনো প্রতিনিয়ত বেড়েই চলছে😘"
];

module.exports.onStart = async function ({ message, event }) {
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
        cmd: "crush",
        senderID,
        targetID
      },
      { responseType: "arraybuffer", timeout: 30000 }
    );

    const imgPath = path.join(
      __dirname,
      "tmp",
      `crush_${senderID}_${targetID}.png`
    );

    fs.writeFileSync(imgPath, res.data);

    const caption =
      crushCaptions[Math.floor(Math.random() * crushCaptions.length)];

    return message.reply(
      {
        body: `✧•❁𝐂𝐫𝐮𝐬𝐡❁•✧\n\n${caption}`,
        attachment: fs.createReadStream(imgPath)
      },
      () => fs.unlinkSync(imgPath)
    );

  } catch (e) {
    return message.reply("API Error Call Boss SAHU");
  }
};
