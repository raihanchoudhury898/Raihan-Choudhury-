const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "info",
    aliases: ["admininfo", "botinfo", "ownerinfo"],
    version: "3.8",
    author: "Raihan Choudhury",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Show bot & owner info" },
    longDescription: { en: "Display bot and owner information" },
    category: "owner",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ message }) {

    const owner = {
      name: "𝓡𝓪𝓲𝓱𝓪𝓷 𝓒𝓱𝓸𝓾𝓭𝓱𝓾𝓻𝔂",
      age: "❲ 20+ ❳",
      status: "❮ Single ❯",
      phone: "➤ 𝟬𝟭𝟲𝟬𝟰𝟴𝟴𝟰𝟲𝟯𝟱"
    };

    const now = moment().tz("Asia/Dhaka");
    const date = now.format("MMMM Do YYYY");
    const time = now.format("h:mm:ss A");

    const uptime = process.uptime();
    const d = Math.floor(uptime / 86400);
    const h = Math.floor((uptime % 86400) / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);

    const uptimeStr = `${d}d ${h}h ${m}m ${s}s`;

    const text =
`┌──────── BOT ────────┐
Bot     : ${global.GoatBot.config.nickNameBot}
Prefix  : ${global.GoatBot.config.prefix}
└─────────────────────┘

┌────── OWNER ───────┐
Name   : ${owner.name}
Age    : ${owner.age}
Status : ${owner.status}
└────────────────────┘

┌────── CONTACT ─────┐
Phone  : ${owner.phone}
└────────────────────┘

┌────── SYSTEM ──────┐
Date   : ${date}
Time   : ${time}
Uptime : ${uptimeStr}
└────────────────────┘`;

    return message.reply({ body: text });
  },

  onChat: async function ({ event, message }) {
    if (event.body?.toLowerCase() === "info") {
      return this.onStart({ message });
    }
  }
};
