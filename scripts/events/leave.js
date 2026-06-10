const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
	config: {
		name: "leave",
		version: "5.1",
		author: "Raihan Choudhury",
		category: "events"
	},

	onStart: async function ({
		threadsData,
		message,
		event,
		api,
		usersData
	}) {

		if (
			event.logMessageType !==
			"log:unsubscribe"
		)
			return;

		return async function () {

			try {

				const { threadID } = event;

				const threadInfo =
					await api.getThreadInfo(threadID);

				if (
					!threadInfo
				)
					return;

				const leftParticipantFbId =
					event.logMessageData
						.leftParticipantFbId;

				if (
					leftParticipantFbId ===
					api.getCurrentUserID()
				)
					return;

				const isKicked =
					leftParticipantFbId !==
					event.author;

				const memberCount =
					threadInfo.participantIDs.length;
				// =========================
				// BANGLADESH DATE & TIME
				// =========================

				const now = new Date();

				const date =
					now.toLocaleDateString(
						"en-GB",
						{
							timeZone: "Asia/Dhaka",
							day: "2-digit",
							month: "short",
							year: "numeric"
						}
					);

				const time =
					now.toLocaleTimeString(
						"en-US",
						{
							timeZone: "Asia/Dhaka",
							hour: "2-digit",
							minute: "2-digit",
							hour12: true
						}
					);

				// =========================
				// SAFE USER NAME (FIXED 100%)
				// =========================

				let userName = "Unknown Member";

				try {
					userName =
						await usersData.getName(
							leftParticipantFbId
						);
				} catch (e) {}

				if (
					(!userName ||
						userName === "Unknown Member") &&
					threadInfo.userInfo
				) {
					const found =
						threadInfo.userInfo.find(
							u =>
							u.id ===
							leftParticipantFbId
						);

					if (found?.name)
						userName = found.name;
				}

				// =========================
				// SAFE ADMIN NAME (FIXED)
				// =========================

				let adminName = "";

				if (isKicked) {
					try {
						adminName =
							await usersData.getName(
								event.author
							);
					} catch (e) {}

					if (
						(!adminName || adminName === "") &&
						threadInfo.userInfo
					) {
						const admin =
							threadInfo.userInfo.find(
								u =>
								u.id ===
								event.author
							);

						if (admin?.name)
							adminName = admin.name;
					}
				}

				// =========================
				// CACHE
				// =========================

				const cacheDir =
					path.join(__dirname, "cache");

				await fs.ensureDir(cacheDir);

				// =========================
				// CANVAS INIT
				// =========================

				const canvas =
					createCanvas(1280, 720);

				const ctx =
					canvas.getContext("2d");

				// BACKGROUND

				ctx.fillStyle = "#0b0f19";
				ctx.fillRect(0, 0, 1280, 720);

				// HEADER

				ctx.fillStyle = "#111827";
				ctx.fillRect(0, 0, 1280, 120);
const userAvatarUrl =
					`https://arshi-facebook-pp.vercel.app/api/pp?uid=${leftParticipantFbId}`;

				const adminAvatarUrl =
					`https://arshi-facebook-pp.vercel.app/api/pp?uid=${event.author}`;

				const groupAvatarUrl =
					threadInfo.imageSrc;

				let userAvatar = null;
				let adminAvatar = null;
				let groupAvatar = null;

				// USER AVATAR
				try {
					const res =
						await axios.get(userAvatarUrl, {
							responseType: "arraybuffer"
						});

					userAvatar =
						await loadImage(
							Buffer.from(res.data)
						);
				} catch {}

				// ADMIN AVATAR
				if (isKicked) {
					try {
						const res =
							await axios.get(adminAvatarUrl, {
								responseType: "arraybuffer"
							});

						adminAvatar =
							await loadImage(
								Buffer.from(res.data)
							);
					} catch {}
				}

				// GROUP AVATAR
				if (groupAvatarUrl) {
					try {
						groupAvatar =
							await loadImage(groupAvatarUrl);
					} catch {}
				}

				// GROUP AVATAR DRAW
				if (groupAvatar) {
					ctx.save();
					ctx.beginPath();
					ctx.arc(85, 60, 45, 0, Math.PI * 2);
					ctx.clip();

					ctx.drawImage(
						groupAvatar,
						40,
						15,
						90,
						90
					);

					ctx.restore();

					ctx.strokeStyle = "#00f5ff";
					ctx.lineWidth = 3;

					ctx.beginPath();
					ctx.arc(85, 60, 47, 0, Math.PI * 2);
					ctx.stroke();
				}

				// GROUP NAME (FULL)
				const groupGrad =
					ctx.createLinearGradient(160, 0, 900, 0);

				groupGrad.addColorStop(0, "#00f5ff");
				groupGrad.addColorStop(1, "#ff00ff");

				ctx.fillStyle = groupGrad;
				ctx.font = "bold 34px Arial";
				ctx.textAlign = "left";

				let groupName =
					threadInfo.threadName ||
					"UNKNOWN GROUP";

				ctx.fillText(groupName, 160, 72);

				// TITLE
				ctx.textAlign = "center";
				ctx.font = "bold 86px Arial";

				const titleGrad =
					ctx.createLinearGradient(300, 0, 900, 0);

				titleGrad.addColorStop(
					0,
					isKicked ? "#ff0000" : "#00ff88"
				);

				titleGrad.addColorStop(
					1,
					isKicked ? "#ff9a00" : "#00f5ff"
				);

				ctx.fillStyle = titleGrad;

				ctx.fillText(
					isKicked ? "REMOVED" : "LEFT",
					640,
					180
				);

				ctx.font = "bold 24px Arial";
				ctx.fillStyle = "#8b949e";

				ctx.fillText(
					isKicked
						? "By admin"
						: "from the group",
					640,
					220
				);
				// =========================
				// DATE & TIME BOX
				// =========================

				ctx.fillStyle =
					"rgba(255,255,255,0.08)";

				ctx.fillRect(
					430,
					240,
					420,
					50
				);

				const dtGrad =
					ctx.createLinearGradient(
						430,
						0,
						850,
						0
					);

				dtGrad.addColorStop(
					0,
					"#00f5ff"
				);

				dtGrad.addColorStop(
					1,
					"#ff00ff"
				);

				ctx.fillStyle =
					dtGrad;

				ctx.font =
					"bold 20px Arial";

				ctx.fillText(
					`${date} • ${time}`,
					640,
					273
				);
// =========================
				// FULL NAME FIX (NO CUT)
				// =========================

				function drawFullText(ctx, text, x, y, maxWidth) {
					let fontSize = 30;

					do {
						ctx.font = `bold ${fontSize}px Arial`;
					} while (
						ctx.measureText(text).width > maxWidth &&
						fontSize > 12 &&
						fontSize--
					);

					ctx.fillText(text, x, y);
				}

				// USER AVATAR
				if (userAvatar) {
					ctx.save();
					ctx.beginPath();
					ctx.arc(350, 350, 120, 0, Math.PI * 2);
					ctx.clip();

					ctx.drawImage(
						userAvatar,
						230,
						230,
						240,
						240
					);

					ctx.restore();

					ctx.strokeStyle = "#00f5ff";
					ctx.lineWidth = 6;
					ctx.beginPath();
					ctx.arc(350, 350, 123, 0, Math.PI * 2);
					ctx.stroke();
				}

				// MEMBER NAME (FULL SAFE)
				ctx.fillStyle = "#00f5ff";
				drawFullText(ctx, userName, 350, 550, 300);

				// ADMIN AVATAR
				if (isKicked && adminAvatar) {
					ctx.save();
					ctx.beginPath();
					ctx.arc(930, 350, 120, 0, Math.PI * 2);
					ctx.clip();

					ctx.drawImage(
						adminAvatar,
						810,
						230,
						240,
						240
					);

					ctx.restore();

					ctx.strokeStyle = "#ff3b30";
					ctx.lineWidth = 6;

					ctx.beginPath();
					ctx.arc(930, 350, 123, 0, Math.PI * 2);
					ctx.stroke();

					ctx.strokeStyle = "#444";
					ctx.beginPath();
					ctx.moveTo(470, 350);
					ctx.lineTo(810, 350);
					ctx.stroke();
				}

				// ADMIN NAME FULL
				if (isKicked) {
					ctx.fillStyle = "#ffcc00";
					drawFullText(ctx, adminName, 930, 550, 300);
				}

				// MEMBER COUNT
				ctx.fillStyle = "#111827";
				ctx.fillRect(430, 590, 420, 70);

				ctx.fillStyle = "#00f5ff";
				ctx.font = "bold 26px Arial";

				ctx.fillText(
					`REMAINING MEMBERS : ${memberCount}`,
					640,
					635
				);

				// FOOTER
				const footerGrad =
					ctx.createLinearGradient(
						300,
						0,
						980,
						0
					);

				footerGrad.addColorStop(
					0,
					"#00f5ff"
				);

				footerGrad.addColorStop(
					0.5,
					"#ff00ff"
				);

				footerGrad.addColorStop(
					1,
					"#00ff88"
				);

				ctx.fillStyle =
					footerGrad;

				ctx.font =
					"bold 26px Arial";

				ctx.fillText(
					`OWNER • RAIHAN CHOUDHURY • ${date}`,
					640,
					700
				);

				// SAVE
				const imagePath =
					path.join(
						cacheDir,
						`leave_${Date.now()}.png`
					);

				await fs.writeFile(
					imagePath,
					canvas.toBuffer("image/png")
				);

				const body = isKicked
					? `🚫 ${userName} was removed from ${threadInfo.threadName}`
					: `👋 ${userName} left ${threadInfo.threadName}`;

				await message.reply({
					body,
					attachment: fs.createReadStream(imagePath)
				});

				setTimeout(() => {
					try {
						if (fs.existsSync(imagePath))
							fs.unlinkSync(imagePath);
					} catch {}
				}, 5000);

			} catch (err) {
				console.log("Leave Event Error:", err);
			}
		};
	}
};
