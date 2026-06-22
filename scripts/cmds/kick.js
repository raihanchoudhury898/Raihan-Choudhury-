module.exports = {
	config: {
		name: "kick",
		version: "3.0",
		author: "Raihan Choudhury",
		countDown: 5,
		role: 1,
		description: {
			vi: "Kick thành viên khỏi box chat",
			en: "Kick member out of chat box"
		},
		category: "admin",
		guide: {
			vi: "   {pn} @tags: dùng để kick những người được tag\n   {pn} (reply): dùng để kick người được reply",
			en: "   {pn} @tags: use to kick members who are tagged\n   {pn} (reply): use to kick the replied person"
		}
	},

	langs: {
		vi: {
			notAdmin: "❌ Bot chưa được thêm làm quản trị viên trong nhóm này!",
			kickError: "❌ Không thể kick thành viên này! Vui lòng kiểm tra quyền của bot.",
			syntaxError: "❌ Cách dùng: {pn} @tag hoặc reply tin nhắn của người cần kick",
			kickSuccess: "✅ Đã kick thành công {count} thành viên!",
			kickPartial: "⚠️ Đã kick {success} thành viên, thất bại {failed} thành viên!",
			cannotKickAdmin: "❌ Không thể kick quản trị viên khác!",
			cannotKickBot: "❌ Không thể tự kick chính mình!"
		},
		en: {
			notAdmin: "❌ Bot has not been added as an admin in this group!",
			kickError: "❌ Cannot kick this member! Please check bot permissions.",
			syntaxError: "❌ Usage: {pn} @tag or reply to the message of the person to kick",
			kickSuccess: "✅ Successfully kicked {count} member(s)!",
			kickPartial: "⚠️ Kicked {success} members, failed {failed} members!",
			cannotKickAdmin: "❌ Cannot kick other admins!",
			cannotKickBot: "❌ Cannot kick myself!"
		}
	},

	onStart: async function ({ message, event, args, api, getLang }) {
		try {
			const botId = api.getCurrentUserID();
			
			// ============================================================
			// STEP 1: CHECK BOT ADMIN STATUS USING DIRECT API (REAL-TIME)
			// ============================================================
			console.log("🔍 Checking bot admin status via direct API...");
			
			let isBotAdmin = false;
			let threadInfo = null;
			
			try {
				// Direct API call to get thread info
				threadInfo = await api.getThreadInfo(event.threadID);
				console.log("📋 Thread Admin List:", JSON.stringify(threadInfo.adminIDs));
				
				// Check if bot is in admin list
				if (threadInfo && threadInfo.adminIDs) {
					for (const admin of threadInfo.adminIDs) {
						const adminId = admin.id || admin;
						if (adminId === botId || adminId === botId.toString()) {
							isBotAdmin = true;
							break;
						}
					}
				}
			} catch (error) {
				console.error("❌ Failed to get thread info:", error);
				return message.reply("⚠️ Cannot get group info! Please try again.");
			}
			
			// If bot is not admin, stop here
			if (!isBotAdmin) {
				console.log("❌ Bot is NOT admin in this group!");
				return message.reply(getLang("notAdmin"));
			}
			
			console.log("✅ Bot IS admin in this group! Proceeding...");

			// ============================================================
			// STEP 2: GET TARGET USERS
			// ============================================================
			let targetUids = [];
			
			// Case 1: No arguments - check for reply
			if (!args[0]) {
				if (!event.messageReply) {
					return message.reply(getLang("syntaxError").replace("{pn}", this.config.name));
				}
				targetUids = [event.messageReply.senderID];
			}
			// Case 2: Has arguments - get from mentions
			else {
				const mentions = Object.keys(event.mentions);
				if (mentions.length === 0) {
					return message.reply(getLang("syntaxError").replace("{pn}", this.config.name));
				}
				targetUids = mentions;
			}

			// ============================================================
			// STEP 3: FILTER TARGETS (Cannot kick admins or bot itself)
			// ============================================================
			const filteredTargets = [];
			const adminIds = threadInfo.adminIDs.map(admin => admin.id || admin);
			
			for (const uid of targetUids) {
				// Cannot kick self
				if (uid === botId) {
					await message.reply(getLang("cannotKickBot"));
					continue;
				}
				
				// Cannot kick other admins
				if (adminIds.includes(uid) || adminIds.includes(uid.toString())) {
					await message.reply(getLang("cannotKickAdmin"));
					continue;
				}
				
				filteredTargets.push(uid);
			}

			if (filteredTargets.length === 0) {
				return;
			}

			// ============================================================
			// STEP 4: PERFORM KICK
			// ============================================================
			async function kickMember(uid) {
				try {
					console.log(`🦵 Attempting to kick user: ${uid}`);
					await api.removeUserFromGroup(uid, event.threadID);
					console.log(`✅ Successfully kicked user: ${uid}`);
					return { success: true, error: null };
				} catch (error) {
					console.error(`❌ Failed to kick user ${uid}:`, error.message);
					return { success: false, error: error.message };
				}
			}

			// Process all kicks
			const results = [];
			for (const uid of filteredTargets) {
				const result = await kickMember(uid);
				results.push({ uid, ...result });
				
				// Small delay to avoid rate limiting
				if (filteredTargets.length > 1) {
					await new Promise(resolve => setTimeout(resolve, 1000));
				}
			}

			// ============================================================
			// STEP 5: SHOW RESULTS
			// ============================================================
			const successCount = results.filter(r => r.success).length;
			const failedCount = results.filter(r => !r.success).length;

			if (failedCount === 0 && successCount > 0) {
				return message.reply(getLang("kickSuccess").replace("{count}", successCount));
			} else if (successCount === 0 && failedCount > 0) {
				return message.reply(getLang("kickError"));
			} else if (successCount > 0 && failedCount > 0) {
				return message.reply(getLang("kickPartial")
					.replace("{success}", successCount)
					.replace("{failed}", failedCount));
			}

		} catch (error) {
			console.error("🔥 Fatal error in kick command:", error);
			return message.reply("❌ An unexpected error occurred: " + error.message);
		}
	}
};
