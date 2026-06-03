module.exports = {
config: {
name: "help",
version: "2.0",
author: "ashik",
countDown: 5,
role: 0,
shortDescription: "Show all commands",
longDescription: "Display all bot commands",
category: "system"
},

onStart: async function ({ message }) {
	try {
		const commands = global.GoatBot.commands;

		const emojis = [
			"🎮", "🎵", "📜", "🆔", "🎭", "🔥", "⚡", "💎",
			"🚀", "🎯", "🎨", "📱", "🎪", "🌟", "💫", "🎲",
			"🛠️", "🎤", "📸", "🎬"
		];

		let msg = "";
		msg += "╔═══════『 🤖 𝗬𝗢𝗨𝗥 𝗕𝗕𝗭 ♡♥︎ 🤖 』═══════╗\n\n";
		msg += "✨ 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗟𝗜𝗦𝗧 ✨\n\n";

		let i = 1;

		for (const [name] of commands) {
			const emoji = emojis[(i - 1) % emojis.length];
			msg += `〔${String(i).padStart(2, "0")}〕${emoji} /${name}\n`;
			i++;
		}

		msg += "\n━━━━━━━━━━━━━━━━━━\n";
		msg += `📊 𝗧𝗼𝘁𝗮𝗹 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀 : ${commands.size}\n`;
		msg += "👑 𝗢𝘄𝗻𝗲𝗿 : 𝐑𝐀𝐈𝐇𝐀𝐍 𝐂𝐇𝐎𝐖𝐃𝐇𝐔𝐑𝐘\n";
		msg += "⚡ 𝗣𝗿𝗲𝗳𝗶𝘅 : /\n";
		msg += "━━━━━━━━━━━━━━━━━━\n";
		msg += "🌸 𝗧𝗵𝗮𝗻𝗸𝘀 𝗙𝗼𝗿 𝗨𝘀𝗶𝗻𝗴 𝗠𝘆 𝗕𝗼𝘁 🌸\n\n";
		msg += "╚═══════『 ❤️ 𝐑𝐀𝐈𝐇𝐀𝐍 𝐂𝐇𝐎𝐖𝐃𝐇𝐔𝐑𝐘 ❤️ 』═══════╝";

		return message.reply(msg);

	} catch (e) {
		console.error(e);
		return message.reply("❌ Failed to load commands.");
	}
}

};
