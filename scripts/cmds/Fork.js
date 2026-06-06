module.exports = {
 config: {
 name: "fork",
 version: "1.6",
 author: "Raihan Choudhury",
 countDown: 2,
 role: 0,
 shortDescription: "Official GitHub Fork",
 category: "utils",
 guide: {
 en: "{pn} | fork"
 }
 },

 langs: {
 en: {
 current: `
━━━━━━━━━━━
𝗢𝗙𝗙𝗜𝗖𝗜𝗔𝗟 𝗙𝗢𝗥𝗞
━━━━━━━━━━━
𝗢𝗪𝗡𝗘𝗥 ➜ 𝗥𝗮𝗶𝗵𝗮𝗻 𝗖𝗵𝗼𝘂𝗱𝗵𝘂𝗿𝘆
𝗕𝗢𝗧 ➜ 𝗚𝗢𝗔𝗧 𝗕𝗢𝗧 𝗩𝟮
━━━━━━━━━━━
🌐 𝗢𝗙𝗙𝗜𝗖𝗜𝗔𝗟 𝗚𝗜𝗧𝗛𝗨𝗕
🔗 https://github.com/raihanchoudhury898/Raihan-Choudhury-.git
`
 }
 },

 onStart: async function ({ message, getLang }) {
 const link = "https://github.com/MAMUN-GOAT-BOT/V2-.git";
 return message.reply(getLang("current", link));
 },

 onChat: async function ({ message, event, getLang }) {
 const body = event.body?.trim().toLowerCase();

 if (body === "fork") {
 const link = "https://github.com/MAMUN-GOAT-BOT/V2-.git";
 return message.reply(getLang("current", link));
 }
 }
};
