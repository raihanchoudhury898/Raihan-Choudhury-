const moment = require("moment-timezone");
const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
config: {
name: "info",
aliases: ["admininfo", "botinfo", "ownerinfo"],
version: "4.0",
author: "Raihan Choudhury",
countDown: 5,
role: 0,
shortDescription: {
en: "Show bot & owner info"
},
longDescription: {
en: "Display bot and owner information"
},
category: "owner",
guide: {
en: "{pn}"
}
},

onStart: async function ({ message }) {

	const owner = {
		name: "𝚁𝙰𝙸𝙷𝙰𝙽 𝙲𝙷𝙾𝚄𝙳𝙷𝚄𝚁𝚈",
		age: "❲ 20+ ❳",
		status: "❮ Single ❯",
		phone: "➤ 01604884635"
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

	try {

		const cacheDir = path.join(__dirname, "cache");
		await fs.ensureDir(cacheDir);

		const imgPath = path.join(
			cacheDir,
			`owner_${Date.now()}.jpeg`
		);

		const response = await axios({
			url: "https://i.imgur.com/INmOdCN.jpeg",
			method: "GET",
			responseType: "stream"
		});

		await new Promise((resolve, reject) => {
			const writer = fs.createWriteStream(imgPath);

			response.data.pipe(writer);

			writer.on("finish", resolve);
			writer.on("error", reject);
		});

		return message.reply(
			{
				body: text,
				attachment: fs.createReadStream(imgPath)
			},
			() => {
				try {
					if (fs.existsSync(imgPath))
						fs.unlinkSync(imgPath);
				}
				catch (_) {}
			}
		);

	}
	catch (err) {
		console.error(err);
		return message.reply(text);
	}
},

onChat: async function ({ event, message }) {
	if (event.body?.toLowerCase() === "info") {
		return this.onStart({ message });
	}
}

};
