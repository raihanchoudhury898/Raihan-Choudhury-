module.exports = {
	config: {
		name: "kick",
		version: "4.0",
		author: "Raihan Choudhury",
		countDown: 5,
		role: 1,
		description: {
			en: "Kick member out of chat box (Admin only)"
		},
		category: "admin",
		guide: {
			en: "   {pn} @tags: Kick tagged members\n   {pn} (reply): Kick replied person"
		}
	},

	onStart: async function ({ message, event, args, api, getLang }) {
		try {
			const botId = api.getCurrentUserID();
			const senderId = event.senderID;
			
			// ============================================================
			// STEP 1: CHECK IF COMMAND USER IS GROUP ADMIN
			// ============================================================
			console.log("🔍 Checking if user is group admin...");
			
			let threadInfo = null;
			let adminIds = [];
			let isUserAdmin = false;
			
			try {
				// Get thread info
				threadInfo = await api.getThreadInfo(event.threadID);
				
				// Extract admin IDs properly
				if (threadInfo && threadInfo.adminIDs) {
					adminIds = threadInfo.adminIDs.map(admin => {
						return typeof admin === 'object' ? admin.id : admin;
					}).filter(id => id);
				}
				
				console.log("📋 Group Admin IDs:", adminIds);
				console.log("👤 Command Sender ID:", senderId);
				
				// Check if command sender is admin
				isUserAdmin = adminIds.some(adminId => String(adminId) === String(senderId));
				
				console.log(`🔍 Is User Admin? ${isUserAdmin}`);
				
			} catch (error) {
				console.error("❌ Failed to get thread info:", error);
				return message.reply("⚠️ Cannot get group info! Please try again.");
			}
			
			// If user is not admin, stop here
			if (!isUserAdmin) {
				console.log("❌ User is NOT admin in this group!");
				return message.reply("❌ Only group admins can use this command!");
			}
			
			console.log("✅ User IS admin in this group! Proceeding...");
			
			// ============================================================
			// STEP 2: CHECK IF BOT IS ADMIN (REQUIRED FOR KICKING)
			// ============================================================
			console.log("🔍 Checking if bot is admin...");
			
			let isBotAdmin = adminIds.some(adminId => String(adminId) === String(botId));
			console.log(`🤖 Is Bot Admin? ${isBotAdmin}`);
			
			if (!isBotAdmin) {
				console.log("❌ Bot is NOT admin! Cannot kick members.");
				return message.reply("⚠️ Bot needs to be an admin to kick members! Please add bot as admin first.");
			}
			
			console.log("✅ Bot IS admin! Ready to kick.");
			
			// ============================================================
			// STEP 3: GET TARGET USERS
			// ============================================================
			let targetUids = [];
			
			// Case 1: No arguments - check for reply
			if (!args[0]) {
				if (!event.messageReply) {
					return message.reply("❌ Usage: " + this.config.guide.en.replace("{pn}", this.config.name));
				}
				targetUids = [event.messageReply.senderID];
			}
			// Case 2: Has arguments - get from mentions
			else {
				const mentions = Object.keys(event.mentions);
				if (mentions.length === 0) {
					return message.reply("❌ Usage: " + this.config.guide.en.replace("{pn}", this.config.name));
				}
				targetUids = mentions;
			}
			
			// ============================================================
			// STEP 4: FILTER TARGETS
			// ============================================================
			const filteredTargets = [];
			
			for (const uid of targetUids) {
				const uidStr = String(uid);
				const botIdStr = String(botId);
				const senderIdStr = String(senderId);
				
				// Cannot kick self (the admin using the command)
				if (uidStr === senderIdStr) {
					await message.reply("❌ You cannot kick yourself!");
					continue;
				}
				
				// Cannot kick bot itself
				if (uidStr === botIdStr) {
					await message.reply("❌ Cannot kick the bot!");
					continue;
				}
				
				// Cannot kick other admins
				const isTargetAdmin = adminIds.some(adminId => String(adminId) === uidStr);
				if (isTargetAdmin) {
					await message.reply("❌ Cannot kick other group admins!");
					continue;
				}
				
				filteredTargets.push(uid);
			}
			
			if (filteredTargets.length === 0) {
				return;
			}
			
			// ============================================================
			// STEP 5: PERFORM KICK
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
			// STEP 6: SHOW RESULTS
			// ============================================================
			const successCount = results.filter(r => r.success).length;
			const failedCount = results.filter(r => !r.success).length;
			
			if (failedCount === 0 && successCount > 0) {
				return message.reply(`✅ Successfully kicked ${successCount} member(s)!`);
			} else if (successCount === 0 && failedCount > 0) {
				return message.reply("❌ Failed to kick members! Please check bot permissions.");
			} else if (successCount > 0 && failedCount > 0) {
				return message.reply(`⚠️ Kicked ${successCount} member(s), failed ${failedCount} member(s)!`);
			}
			
		} catch (error) {
			console.error("🔥 Fatal error in kick command:", error);
			return message.reply("❌ An unexpected error occurred: " + error.message);
		}
	}
};
