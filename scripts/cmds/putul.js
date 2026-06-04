module.exports = {
  config: {
    name: "putul",
    version: "3.0",
    author: "Raihan Choudhury",
    countDown: 5,
    role: 0,
    description: "100+ romantic Putul lines with Raihan Choudhury signature",
    category: "love",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ message }) {

    const lines = [

      "💖 Putul তুমি আমার জীবনের সবচেয়ে সুন্দর অনুভূতি 🥰 | Raihan Choudhury",
      "🌸 Putul তোমার হাসি আমার শান্তি 💕 | Raihan Choudhury",
      "❤️ Putul তুমি না থাকলে সব ফাঁকা লাগে 😢 | Raihan Choudhury",
      "💞 Putul তুমি আমার পৃথিবীর আলো ✨ | Raihan Choudhury",
      "💘 Putul তোমাকে ছাড়া আমি কিছুই না 🥺 | Raihan Choudhury",
      "🌹 Putul তুমি আমার স্বপ্নের রানী 👑 | Raihan Choudhury",
      "💕 Putul তোমার কথা ভাবলেই মন ভালো হয়ে যায় 😍 | Raihan Choudhury",
      "💓 Putul তুমি আমার হৃদয়ের ধুকধুকানি ❤️ | Raihan Choudhury",
      "💗 Putul তুমি আমার প্রতিদিনের প্রার্থনা 🤲 | Raihan Choudhury",
      "💝 Putul তুমি আমার সুখের কারণ 🥰 | Raihan Choudhury",

      "💖 Putul তুমি ছাড়া দিন শুরু হয় না ☀️ | Raihan Choudhury",
      "🌸 Putul তুমি আমার রাতের স্বপ্ন 🌙 | Raihan Choudhury",
      "❤️ Putul তুমি আমার জীবনের গল্প 📖 | Raihan Choudhury",
      "💞 Putul তুমি আমার সবকিছু 💯 | Raihan Choudhury",
      "💘 Putul তোমার নাম শুনলেই হাসি আসে 😍 | Raihan Choudhury",
      "🌹 Putul তুমি আমার হৃদয়ের রাজকন্যা 👑 | Raihan Choudhury",
      "💕 Putul তুমি আমার অনুভূতির নাম 💓 | Raihan Choudhury",
      "💓 Putul তুমি আমার হার্টবিট ❤️ | Raihan Choudhury",
      "💗 Putul তুমি আমার চিরদিনের ভালোবাসা ♾️ | Raihan Choudhury",
      "💝 Putul তুমি আমার পৃথিবীর সবচেয়ে সুন্দর মানুষ 🌍 | Raihan Choudhury",

      "💖 Putul তোমাকে দেখলেই সব টেনশন চলে যায় 😊 | Raihan Choudhury",
      "🌸 Putul তুমি আমার মনের রাজকুমারী 👑 | Raihan Choudhury",
      "❤️ Putul তুমি আমার প্রতিটি শ্বাসে আছো 😌 | Raihan Choudhury",
      "💞 Putul তুমি আমার জীবনের সেরা উপহার 🎁 | Raihan Choudhury",
      "💘 Putul তুমি আমার দুঃখের ওষুধ 💊 | Raihan Choudhury",
      "🌹 Putul তুমি আমার ভালো থাকার কারণ 😊 | Raihan Choudhury",
      "💕 Putul তুমি আমার স্বপ্নের মানুষ 🌙 | Raihan Choudhury",
      "💓 Putul তুমি আমার মনের শান্তি 🕊️ | Raihan Choudhury",
      "💗 Putul তুমি আমার হাসির উৎস 😄 | Raihan Choudhury",
      "💝 Putul তুমি আমার ভালোবাসার ঠিকানা 🏡 | Raihan Choudhury",

      "💖 Putul তুমি আমার সকাল আর রাত 🌞🌙 | Raihan Choudhury",
      "🌸 Putul তুমি আমার জীবনের আলো 💡 | Raihan Choudhury",
      "❤️ Putul তুমি আমার জীবনের রঙ 🎨 | Raihan Choudhury",
      "💞 Putul তুমি আমার প্রতিটি ভাবনা 💭 | Raihan Choudhury",
      "💘 Putul তুমি আমার হৃদয়ের রাজ্য 👑 | Raihan Choudhury",
      "🌹 Putul তুমি আমার ভালোবাসার গল্প 📖 | Raihan Choudhury",
      "💕 Putul তুমি আমার স্বপ্নের ঠিকানা 🏡 | Raihan Choudhury",
      "💓 Putul তুমি আমার অনুভূতির কেন্দ্র 💕 | Raihan Choudhury",
      "💗 Putul তুমি আমার চিরস্থায়ী ভালোবাসা ♾️ | Raihan Choudhury",
      "💝 Putul তুমি আমার সব স্বপ্ন পূরণ 🌈 | Raihan Choudhury",

      "💖 Putul তুমি আমার চাঁদের আলো 🌙 | Raihan Choudhury",
      "🌸 Putul তুমি আমার সূর্যের আলো ☀️ | Raihan Choudhury",
      "❤️ Putul তুমি আমার জীবনের কবিতা ✍️ | Raihan Choudhury",
      "💞 Putul তুমি আমার ভালো থাকার reason 😊 | Raihan Choudhury",
      "💘 Putul তুমি আমার হৃদয়ের গান 🎶 | Raihan Choudhury",
      "🌹 Putul তুমি আমার পৃথিবীর সবচেয়ে মিষ্টি মানুষ 🍭 | Raihan Choudhury",
      "💕 Putul তুমি আমার মনের ভিতরের মানুষ 🥰 | Raihan Choudhury",
      "💓 Putul তুমি আমার জীবনের সবচেয়ে সুন্দর অধ্যায় 📘 | Raihan Choudhury",
      "💗 Putul তুমি আমার স্বপ্নের রানী 👑 | Raihan Choudhury",
      "💝 Putul তুমি আমার ভালোবাসার নাম ❤️ | Raihan Choudhury"

    ];

    const msg = lines[Math.floor(Math.random() * lines.length)];

    return message.reply(
`╭──── 💖 PUTUL 💖 ────╮

${msg}

╰────────────────────╯`
    );
  }
};
