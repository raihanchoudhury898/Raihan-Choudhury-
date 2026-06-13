const fs = require("fs");
const path = require("path");

module.exports = {
	config: {
		name: "binev",
		version: "1.0",
		author: "Raihan Choudhury",
		countDown: 3,
		role: 2,
		description: "Send event file as attachment",
		category: "system",
		guide: {
			en: "/binev <event file name>"
		}
	},

	onStart: async function ({ message, args }) {

		if (!args[0]) {
			return message.reply(
				"❌ Example:\n/binev welcome"
			);
		}

		let fileName = args[0];

		if (!fileName.endsWith(".js")) {
			fileName += ".js";
		}

		const eventPath = path.join(
			__dirname,
			"..",
			"events",
			fileName
		);

		if (!fs.existsSync(eventPath)) {
			return message.reply(
				`❌ ${fileName} not found in the events folder.`
			);
		}

		return message.reply({
			body: `📦 Event File: ${fileName}`,
			attachment: fs.createReadStream(eventPath)
		});
	}
};
