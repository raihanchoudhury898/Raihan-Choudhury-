const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "password",
    aliases: ["genpass", "createpass", " pass", "randompass"],
    version: "2.0",
    author: "Raihan Choudhury",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Generate random password"
    },
    longDescription: {
      en: "Generate a random secure password with balanced characters"
    },
    category: "utility",
    guide: {
      en: "{pn} <length>\nExample: {pn} 12\n{pn} 16"
    }
  },

  onStart: async function ({ message, args }) {
    let length = parseInt(args[0]);
    if (isNaN(length) || length < 4) length = 8;
    if (length > 64) length = 64;

    const password = generateBalancedPassword(length);
    return message.reply(
`╭──✦ 𝗣𝗔𝗦𝗦𝗪𝗢𝗥𝗗 𝗖𝗥𝗘𝗔𝗧𝗘𝗗\n├‣ 𝗟𝗲𝗻𝗴𝘁𝗵 : ${length}\n├──────────────────‣\n├‣ 𝗣𝗮𝘀𝘀𝘄𝗼𝗿𝗱➳ ${password}\n╰──────────────────‣`);
  },

  onChat: async function ({ event, message }) {
    const body = event.body?.toLowerCase();
    if (body === "password" || body === "genpass" || body === "randompass") {
      const args = body.split(" ").slice(1);
      this.onStart({ message, args });
    }
  }
};

function generateBalancedPassword(length) {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const symbols = "!@#$%&?";

  let password = [];
  let letterCount = 0, numberCount = 0, symbolCount = 0;

  for (let i = 0; i < length; i++) {
    let remaining = length - i;
    
    if (remaining <= 0) break;
    
    let type = "";
    
    if (remaining <= 2 && symbolCount === 0) {
      type = "symbol";
    } else if (letterCount < length - 2) {
      type = "letter";
    } else if (numberCount < 2) {
      type = "number";
    } else {
      type = "symbol";
    }
    
    if (type === "letter" && letterCount < length - 2) {
      const rand = Math.floor(Math.random() * letters.length);
      password.push(letters[rand]);
      letterCount++;
    } else if (type === "number" && numberCount < 2) {
      const rand = Math.floor(Math.random() * numbers.length);
      password.push(numbers[rand]);
      numberCount++;
    } else if (type === "symbol" && symbolCount < 1) {
      const rand = Math.floor(Math.random() * symbols.length);
      password.push(symbols[rand]);
      symbolCount++;
    } else {
      const rand = Math.floor(Math.random() * letters.length);
      password.push(letters[rand]);
      letterCount++;
    }
  }

  for (let i = password.length; i < length; i++) {
    const rand = Math.floor(Math.random() * letters.length);
    password.push(letters[rand]);
  }

  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join("");
}
