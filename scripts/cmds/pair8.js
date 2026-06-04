const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
	const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/exe/main/baseApiUrl.json");
	return base.data.mahmud;
};

module.exports = {
	config: {
		name: "pair8",
		version: "1.0",
		author: "ashik",
		countDown: 10,
		role: 2,
		shortDescription: "Pair with mentioned user",
		longDescription: "Generate couple image with mentioned user",
		category: "love",
		guide: "{pn} @user"
	},

	onStart: async function ({ api, event, message }) {

		const mentions = Object.keys(event.mentions || {});

		if (!mentions.length)
			return message.reply(
				"💞 | Usage:\n/pair8 @user"
			);

		const targetID = mentions[0];

		if (targetID == event.senderID)
			return message.reply("❌ | Nijer sathe pair kora jabe na.");

		const outputPath = path.join(
			__dirname,
			"cache",
			`pair8_${event.senderID}_${Date.now()}.png`
		);

		try {

			api.setMessageReaction("💞", event.messageID, () => {}, true);

			const threadInfo = await api.getThreadInfo(event.threadID);

			const me =
				threadInfo.userInfo.find(
					u => u.id == event.senderID
				) || {};

			const partner =
				threadInfo.userInfo.find(
					u => u.id == targetID
				) || {};

			const apiUrl = await baseApiUrl();

			const img = await axios.get(
				`${apiUrl}/api/pair/mahmud?user1=${event.senderID}&user2=${targetID}&style=8`,
				{
					responseType: "arraybuffer"
				}
			);

			fs.writeFileSync(
				outputPath,
				Buffer.from(img.data)
			);

			const love = Math.floor(
				Math.random() * 41
			) + 60;

			await message.reply({
				body:
`╭─❍ 💞 𝐏𝐄𝐑𝐅𝐄𝐂𝐓 𝐏𝐀𝐈𝐑 💞
│
├ 👤 ${me.name || "User"}
├ 💘 ${partner.name || "Partner"}
├ ❤️ Love: ${love}%
│
╰───────────────`,
				attachment: fs.createReadStream(outputPath)
			});

			api.setMessageReaction(
				"✅",
				event.messageID,
				() => {},
				true
			);

			setTimeout(() => {
				if (fs.existsSync(outputPath))
					fs.unlinkSync(outputPath);
			}, 5000);

		} catch (e) {

			console.log(e);

			api.setMessageReaction(
				"❌",
				event.messageID,
				() => {},
				true
			);

			if (fs.existsSync(outputPath))
				fs.unlinkSync(outputPath);

			return message.reply(
				"❌ | Pair image generate failed."
			);
		}
	}
};
