const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "info",
    aliases: ["admininfo", "botinfo", "ownerinfo"],
    version: "3.0",
    author: "Raihan Choudhury",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Show bot & owner info" },
    longDescription: { en: "Display detailed bot & owner information" },
    category: "owner",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ message }) {

    // ================= OWNER INFO =================
    const owner = {
      name: "Raihan Choudhury",
      age: "20+",
      status: "Single",
      phone: "+8801604884635",
      facebook: "Raihan Choudhury",
      messenger: "https://m.me/your.profile"
    };

    // ================= MEDIA =================
    const video = "https://files.catbox.moe/a03xbs.mp4";

    // ================= TIME =================
    const now = moment().tz("Asia/Dhaka");
    const date = now.format("MMMM Do YYYY");
    const time = now.format("h:mm:ss A");

    // ================= UPTIME =================
    const uptime = process.uptime();
    const d = Math.floor(uptime / 86400);
    const h = Math.floor((uptime % 86400) / 3600);
    const m = Math.floor((uptime % 3600) / 60);
    const s = Math.floor(uptime % 60);

    const uptimeStr = `${d}d ${h}h ${m}m ${s}s`;

    // ================= TEXT UI =================
    const text =
`━━━━━━━━━━━━━━━━━━━━━━
        🤖 BOT DASHBOARD
━━━━━━━━━━━━━━━━━━━━━━

🤖 Bot Name : ${global.GoatBot.config.nickNameBot}
⚙️ Prefix   : ${global.GoatBot.config.prefix}

━━━━━━━━━━━━━━━━━━━━━━
👑 OWNER PROFILE
━━━━━━━━━━━━━━━━━━━━━━

👤 Name   : ${owner.name}
🎂 Age    : ${owner.age}
💖 Status : ${owner.status}

📞 Phone     : ${owner.phone}
📘 Facebook  : ${owner.facebook}
💬 Messenger : ${owner.messenger}

━━━━━━━━━━━━━━━━━━━━━━
📊 SYSTEM STATUS
━━━━━━━━━━━━━━━━━━━━━━

📅 Date   : ${date}
⏰ Time   : ${time}
⏳ Uptime : ${uptimeStr}

━━━━━━━━━━━━━━━━━━━━━━
💡 Powered by ${owner.name}
━━━━━━━━━━━━━━━━━━━━━━`;

    return message.reply({
      body: text,
      attachment: await global.utils.getStreamFromURL(video)
    });
  },

  onChat: async function ({ event, message }) {
    if (event.body?.toLowerCase() === "info") {
      return this.onStart({ message });
    }
  }
};
