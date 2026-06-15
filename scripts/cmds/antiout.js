module.exports = {
	config: {
		name: "antiout",
		version: "2.0",
		author: "Raihan Choudhury",
		countDown: 5,
		role: 1,
		shortDescription: {
			en: "Prevent members from leaving"
		},
		longDescription: {
			en: "Automatically add back members who leave the group"
		},
		category: "admin",
		guide: {
			en: "{pn} on/off"
		}
	},

	langs: {
		en: {
			onSuccess: "✅ Anti-Out has been enabled.",
			offSuccess: "❎ Anti-Out has been disabled.",
			invalid: "⚠️ Please use:\nantiout on\nantiout off",
			addedBack: "⚠️ %1 left the group and has been added back.",
			cannotAdd: "❌ Unable to add %1 back to the group."
		}
	},

	onStart: async function ({
		args,
		message,
		event,
		threadsData,
		getLang
	}) {

		const option = args[0]?.toLowerCase();

		if (!option)
			return message.reply(getLang("invalid"));

		if (option === "on") {
			await threadsData.set(event.threadID, true, "data.antiout");
			return message.reply(getLang("onSuccess"));
		}

		if (option === "off") {
			await threadsData.set(event.threadID, false, "data.antiout");
			return message.reply(getLang("offSuccess"));
		}

		return message.reply(getLang("invalid"));
	},

	onEvent: async function ({
		event,
		api,
		threadsData,
		usersData,
		getLang
	}) {

		if (event.logMessageType !== "log:unsubscribe")
			return;

		const antiout = await threadsData.get(
			event.threadID,
			"data.antiout"
		);

		// Only run when explicitly enabled
		if (antiout !== true)
			return;

		const leftUser = event.logMessageData.leftParticipantFbId;

		// Ignore if bot itself leaves
		if (leftUser == api.getCurrentUserID())
			return;

		try {
			const userName = await usersData.getName(leftUser);

			await api.addUserToGroup(
				leftUser,
				event.threadID
			);

			api.sendMessage(
				getLang("addedBack", userName),
				event.threadID
			);
		}
		catch (err) {
			try {
				const userName = await usersData.getName(leftUser);

				api.sendMessage(
					getLang("cannotAdd", userName),
					event.threadID
				);
			}
			catch {
				api.sendMessage(
					"❌ Failed to add the user back.",
					event.threadID
				);
			}
		}
	}
};
