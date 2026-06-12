module.exports = {
	config: {
		name: "nickname",
		aliases: ["nick", "nn"],
		version: "1.0",
		author: "Raihan Choudhury",
		countDown: 5,
		role: 0,
		description: {
			en: "Change nickname for yourself or other members"
		},
		category: "box chat",
		guide: {
			en:
				"{pn} <nickname> → Change your own nickname\n" +
				"{pn} @user <nickname> → Change mentioned user's nickname\n" +
				"{pn} <uid> <nickname> → Change user's nickname by UID\n" +
				"Reply + {pn} <nickname> → Change replied user's nickname"
		}
	},

	langs: {
		en: {
			noNickname: "❌ | Please enter a nickname.",
			noPermission: "❌ | You can only change your own nickname.",
			cannotChangeBotAdmin: "❌ | You cannot change a Bot Admin's nickname.",
			userNotFound: "❌ | User not found.",
			success: "✅ | Nickname updated successfully for %1."
		}
	},

	onStart: async function ({ api, event, args, message, threadsData, usersData, getLang }) {
		const { senderID, threadID } = event;

		const threadData = await threadsData.get(threadID);
		const adminIDsRaw = threadData.adminIDs || [];
		const members = threadData.members || [];

		const adminIDs = adminIDsRaw.map(item => item.id || item);

		const botAdmins = global.GoatBot.config.adminBot || [];

		const isBotAdmin = botAdmins.includes(senderID);
		const isGroupAdmin = adminIDs.includes(senderID);

		let targetID = null;
		let nickname = "";

		// Reply system
		if (event.messageReply?.senderID) {
			targetID = event.messageReply.senderID;
			nickname = args.join(" ");
		}

		// Mention system
		else if (Object.keys(event.mentions || {}).length > 0) {
			targetID = Object.keys(event.mentions)[0];

			nickname = args.join(" ");
			nickname = nickname.replace(event.mentions[targetID], "").trim();
		}

		// UID system
		else if (args[0] && !isNaN(args[0])) {
			targetID = args[0];
			nickname = args.slice(1).join(" ").trim();
		}

		// Self system
		else {
			targetID = senderID;
			nickname = args.join(" ").trim();
		}

		if (!nickname)
			return message.reply(getLang("noNickname"));

		const targetIsBotAdmin = botAdmins.includes(targetID);
		const targetIsGroupAdmin = adminIDs.includes(targetID);

		// Member permission
		if (!isBotAdmin && !isGroupAdmin) {
			if (targetID != senderID)
				return message.reply(getLang("noPermission"));
		}

		// Group Admin restrictions
		if (isGroupAdmin && !isBotAdmin) {
			if (targetIsBotAdmin)
				return message.reply(getLang("cannotChangeBotAdmin"));
		}

		let targetName;

		try {
			targetName =
				members.find(m => m.userID == targetID)?.name ||
				await usersData.getName(targetID) ||
				"Unknown User";
		}
		catch {
			targetName = "Unknown User";
		}

		try {
			await api.changeNickname(
				nickname,
				threadID,
				targetID
			);

			return message.reply(
				getLang("success", targetName)
			);
		}
		catch (err) {
			console.log(err);
			return message.reply(getLang("userNotFound"));
		}
	}
};
