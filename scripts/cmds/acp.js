module.exports = {
	config: {
		name: "accept",
		aliases: ["acp"],
		version: "2.0",
		author: "Raihan Choudhury",
		countDown: 300,
		role: 0,
		shortDescription: {
			en: "Manage friend requests"
		},
		longDescription: {
			en: "Accept friend requests"
		},
		category: "Utility"
	},

	langs: {
		en: {
			acceptedSelf: "✅ | Friend request accepted successfully.",
			notFound: "❌ | You have not sent a friend request to the bot.",
			alreadyFriend: "ℹ️ | You are already a friend of the bot.",
			noPending: "❌ | No pending friend requests found.",
			adminOnly: "❌ | Only bot admins can use this feature.",
			invalidReply:
				"❌ | Please reply with:\nadd all\nadd 1 2 3\ndcp all\ndcp 1 2 3"
		}
	},

	onReply: async function ({
		event,
		api,
		Reply,
		getLang
	}) {
		try {
			if (event.senderID != Reply.author)
				return;

			const args = event.body
				.trim()
				.toLowerCase()
				.split(/\s+/);

			const action = args[0];

			if (!["add", "dcp"].includes(action))
				return api.sendMessage(
					getLang("invalidReply"),
					event.threadID,
					event.messageID
				);

			const form = {
				av: api.getCurrentUserID(),
				fb_api_caller_class: "RelayModern",
				variables: {
					input: {
						source: "friends_tab",
						actor_id: api.getCurrentUserID(),
						client_mutation_id:
							Math.random().toString(36).slice(2)
					},
					scale: 3,
					refresh_num: 0
				}
			};

			if (action === "add") {
				form.fb_api_req_friendly_name =
					"FriendingCometFriendRequestConfirmMutation";
				form.doc_id = "3147613905362928";
			}
			else {
				form.fb_api_req_friendly_name =
					"FriendingCometFriendRequestDeleteMutation";
				form.doc_id = "4108254489275063";
			}

			let targets = [];

			if (args[1] === "all") {
				targets = Reply.listRequest.map(
					(_, i) => i + 1
				);
			}
			else {
				targets = args
					.slice(1)
					.map(i => parseInt(i))
					.filter(i => !isNaN(i));
			}

			if (!targets.length)
				return api.sendMessage(
					getLang("invalidReply"),
					event.threadID,
					event.messageID
				);

			const success = [];
			const failed = [];
      for (const stt of targets) {
				const user = Reply.listRequest[stt - 1];

				if (!user) {
					failed.push(`#${stt}`);
					continue;
				}

				try {
					form.variables.input.friend_requester_id =
						user.node.id;

					const res = await api.httpPost(
						"https://www.facebook.com/api/graphql/",
						{
							...form,
							variables: JSON.stringify(
								form.variables
							)
						}
					);

					const data = JSON.parse(res);

					if (data.errors)
						failed.push(user.node.name);
					else
						success.push(user.node.name);

				}
				catch {
					failed.push(user.node.name);
				}
			}

			let msg = "";

			if (action === "add") {
				msg =
`╭─────────────────╮
│     ACCEPTED ✅
├─────────────────┤
│ Total: ${success.length}
│
${success.map(name => `│ ${name}`).join("\n")}
╰─────────────────╯`;
			}
			else {
				msg =
`╭─────────────────╮
│     DECLINED ❌
├─────────────────┤
│ Total: ${success.length}
│
${success.map(name => `│ ${name}`).join("\n")}
╰─────────────────╯`;
			}

			if (failed.length) {
				msg += `\n\n❌ Failed:\n${failed.join("\n")}`;
			}

			try {
				api.unsendMessage(Reply.messageID);
			}
			catch (_) {}

			return api.sendMessage(
				msg,
				event.threadID
			);

		}
		catch (err) {
			console.log(err);
		}
	},

	onStart: async function ({
		event,
		api,
		commandName,
		getLang
	}) {
		const form = {
			av: api.getCurrentUserID(),
			fb_api_req_friendly_name:
				"FriendingCometFriendRequestsRootQueryRelayPreloader",
			fb_api_caller_class: "RelayModern",
			doc_id: "4499164963466303",
			variables: JSON.stringify({
				input: {
					scale: 3
				}
			})
		};

		try {
			const response = await api.httpPost(
				"https://www.facebook.com/api/graphql/",
				form
			);

			const listRequest =
				JSON.parse(response)?.data?.viewer
					?.friending_possibilities?.edges || [];

			const args = event.body
				.trim()
				.split(/\s+/);

			const sub =
				(args[1] || "").toLowerCase();

			const isBotAdmin =
				(global.GoatBot.config.adminBot || [])
					.map(String)
					.includes(String(event.senderID));

			// =========================
			// ACP LIST (BOT ADMIN ONLY)
			// =========================

			if (sub === "list") {

				if (!isBotAdmin)
					return api.sendMessage(
						getLang("adminOnly"),
						event.threadID,
						event.messageID
					);

				if (!listRequest.length) {
					return api.sendMessage(
`❌ │ No pending friend requests found.`,
						event.threadID
					);
				}

				let msg =
`╭─────────────────╮
│  PENDING REQUESTS 
├─────────────────┤
│ Total: ${listRequest.length}
│`;

				listRequest.forEach((user, i) => {
					msg += `\n│ ${i + 1}. ${user.node.name}`;
				});

				msg +=
`\n╰─────────────────╯

Reply:
add all
add 1 2 3

dcp all
dcp 1 2 3`;
        return api.sendMessage(
					msg,
					event.threadID,
					(err, info) => {
						if (err) return;

						global.GoatBot.onReply.set(
							info.messageID,
							{
								commandName,
								messageID: info.messageID,
								listRequest,
								author: event.senderID
							}
						);
					},
					event.messageID
				);
			}

			// =========================
			// MEMBER ACP
			// =========================

			try {
				if (typeof api.getFriendsList === "function") {
					const friends =
						await api.getFriendsList();

					if (
						Array.isArray(friends) &&
						friends.some(
							item =>
								String(item.userID || item.id) ===
								String(event.senderID)
						)
					) {
						return api.sendMessage(
							getLang("alreadyFriend"),
							event.threadID,
							event.messageID
						);
					}
				}
			}
			catch (_) {}

			const targetRequest = listRequest.find(
				item =>
					String(item.node.id) ===
					String(event.senderID)
			);

			if (!targetRequest) {
				return api.sendMessage(
					getLang("notFound"),
					event.threadID,
					event.messageID
				);
			}

			const acceptForm = {
				av: api.getCurrentUserID(),
				fb_api_req_friendly_name:
					"FriendingCometFriendRequestConfirmMutation",
				fb_api_caller_class: "RelayModern",
				doc_id: "3147613905362928",
				variables: JSON.stringify({
					input: {
						source: "friends_tab",
						actor_id: api.getCurrentUserID(),
						client_mutation_id:
							Math.random()
								.toString(36)
								.slice(2),
						friend_requester_id:
							event.senderID
					},
					scale: 3,
					refresh_num: 0
				})
			};

			const res = await api.httpPost(
				"https://www.facebook.com/api/graphql/",
				acceptForm
			);

			const data = JSON.parse(res);

			if (data.errors) {
				return api.sendMessage(
					getLang("notFound"),
					event.threadID,
					event.messageID
				);
			}

			return api.sendMessage(
				getLang("acceptedSelf"),
				event.threadID,
				event.messageID
			);
		}
		catch (error) {
			console.log(error);

			return api.sendMessage(
				"❌ | Error retrieving friend request list.",
				event.threadID,
				event.messageID
			);
		}
	}
};
