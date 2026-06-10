const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
	config: {
		name: "adminadd",
		version: "1.1",
		author: "Raihan Choudhury",
		category: "events"
	},

	onStart: async function ({
		api,
		event,
		usersData,
		threadsData,
		message
	}) {

		// GoatBot V2 Admin Event
		if (event.logMessageType !== "log:thread-admins")
			return;

		return async function () {

			try {

				const { threadID } = event;

				const threadInfo =
					await api.getThreadInfo(threadID);

				if (!threadInfo)
					return;

				// =====================
				// EVENT DATA
				// =====================

				const logData =
					event.logMessageData || {};

				// =====================
				// TARGET USER
				// =====================

				const targetID =
					logData.TARGET_ID ||
					logData.target_id ||
					logData.userFbId ||
					logData.uid ||
					logData.adminId ||
					logData.userID ||
					null;

				const executorID =
					event.author;

				if (!targetID)
					return;

				// =====================
				// SMART EVENT DETECTION
				// =====================

				let isPromote = false;
				let isRemove = false;

				const eventString =
					JSON.stringify(logData)
						.toLowerCase();

				if (
					eventString.includes("add_admin") ||
					eventString.includes("add") ||
					eventString.includes("promote")
				) {
					isPromote = true;
				}

				if (
					eventString.includes("remove_admin") ||
					eventString.includes("remove") ||
					eventString.includes("demote")
				) {
					isRemove = true;
				}

				// Safety Fix
				if (isPromote) {
					isRemove = false;
				}

				// =====================
				// TARGET NAME
				// =====================

				let targetName =
					"Unknown User";

				try {

					targetName =
						await usersData.getName(
							targetID
						);

				} catch (e) {}

				if (
					(!targetName ||
						targetName === "Unknown User") &&
					threadInfo.userInfo
				) {

					const target =
						threadInfo.userInfo.find(
							u =>
								u.id == targetID ||
								u.userID == targetID
						);

					if (target?.name)
						targetName =
							target.name;
				}

				// =====================
				// EXECUTOR NAME
				// =====================

				let executorName =
					"Unknown Admin";

				try {

					executorName =
						await usersData.getName(
							executorID
						);

				} catch (e) {}

				if (
					(!executorName ||
						executorName === "Unknown Admin") &&
					threadInfo.userInfo
				) {

					const admin =
						threadInfo.userInfo.find(
							u =>
								u.id == executorID ||
								u.userID == executorID
						);

					if (admin?.name)
						executorName =
							admin.name;
				}

				// =====================
				// GROUP INFO
				// =====================

				const groupName =
					threadInfo.threadName ||
					"UNKNOWN GROUP";

				const memberCount =
					threadInfo.participantIDs.length;

				// =====================
				// BANGLADESH DATE & TIME
				// =====================

				const now =
					new Date();

				const date =
					now.toLocaleDateString(
						"en-GB",
						{
							timeZone:
								"Asia/Dhaka",
							day: "2-digit",
							month: "short",
							year: "numeric"
						}
					);

				const time =
					now.toLocaleTimeString(
						"en-US",
						{
							timeZone:
								"Asia/Dhaka",
							hour: "2-digit",
							minute: "2-digit",
							hour12: true
						}
					);

				// =====================
				// CACHE
				// =====================

				const cacheDir =
					path.join(
						__dirname,
						"cache"
					);

				await fs.ensureDir(
					cacheDir
				);

				// =====================
				// CANVAS INIT
				// =====================

				const canvas =
					createCanvas(
						1280,
						720
					);

				const ctx =
					canvas.getContext(
						"2d"
					);

				ctx.fillStyle =
					"#0b0f19";

				ctx.fillRect(
					0,
					0,
					1280,
					720
				);
				// =====================
				// AVATAR URLS
				// =====================

				const targetAvatarUrl =
					`https://arshi-facebook-pp.vercel.app/api/pp?uid=${targetID}`;

				const executorAvatarUrl =
					`https://arshi-facebook-pp.vercel.app/api/pp?uid=${executorID}`;

				const groupAvatarUrl =
					threadInfo.imageSrc;

				let targetAvatar = null;
				let executorAvatar = null;
				let groupAvatar = null;

				// =====================
				// LOAD TARGET AVATAR
				// =====================

				try {

					const res =
						await axios.get(
							targetAvatarUrl,
							{
								responseType: "arraybuffer"
							}
						);

					targetAvatar =
						await loadImage(
							Buffer.from(
								res.data
							)
						);

				} catch (e) {
					console.log(
						"Target avatar error"
					);
				}

				// =====================
				// LOAD EXECUTOR AVATAR
				// =====================

				try {

					const res =
						await axios.get(
							executorAvatarUrl,
							{
								responseType: "arraybuffer"
							}
						);

					executorAvatar =
						await loadImage(
							Buffer.from(
								res.data
							)
						);

				} catch (e) {
					console.log(
						"Executor avatar error"
					);
				}

				// =====================
				// LOAD GROUP AVATAR
				// =====================

				if (groupAvatarUrl) {

					try {

						groupAvatar =
							await loadImage(
								groupAvatarUrl
							);

					} catch (e) {
						console.log(
							"Group avatar error"
						);
					}
				}

				// =====================
				// HEADER BAR
				// =====================

				ctx.fillStyle =
					"#111827";

				ctx.fillRect(
					0,
					0,
					1280,
					120
				);

				// =====================
				// GROUP AVATAR
				// =====================

				if (groupAvatar) {

					ctx.save();

					ctx.beginPath();

					ctx.arc(
						85,
						60,
						45,
						0,
						Math.PI * 2
					);

					ctx.clip();

					ctx.drawImage(
						groupAvatar,
						40,
						15,
						90,
						90
					);

					ctx.restore();

					ctx.shadowColor =
						"#00f5ff";

					ctx.shadowBlur =
						20;

					ctx.strokeStyle =
						"#00f5ff";

					ctx.lineWidth =
						3;

					ctx.beginPath();

					ctx.arc(
						85,
						60,
						47,
						0,
						Math.PI * 2
					);

					ctx.stroke();

					ctx.shadowBlur = 0;
				}

				// =====================
				// GROUP NAME
				// =====================

				const groupGrad =
					ctx.createLinearGradient(
						150,
						0,
						900,
						0
					);

				groupGrad.addColorStop(
					0,
					"#00f5ff"
				);

				groupGrad.addColorStop(
					1,
					"#ff00ff"
				);

				ctx.fillStyle =
					groupGrad;

				ctx.font =
					"bold 34px Arial";

				ctx.textAlign =
					"left";

				ctx.fillText(
					groupName,
					160,
					72
				);

				// =====================
				// TITLE
				// =====================

				ctx.textAlign =
					"center";

				ctx.font =
					"bold 84px Arial";

				const titleGrad =
					ctx.createLinearGradient(
						300,
						0,
						980,
						0
					);

				if (isPromote) {

					titleGrad.addColorStop(
						0,
						"#00ff88"
					);

					titleGrad.addColorStop(
						1,
						"#00f5ff"
					);

					ctx.fillStyle =
						titleGrad;

					ctx.fillText(
						"ADMIN PROMOTED",
						640,
						190
					);

				}

				else if (isRemove) {

					titleGrad.addColorStop(
						0,
						"#ff3b30"
					);

					titleGrad.addColorStop(
						1,
						"#ffcc00"
					);

					ctx.fillStyle =
						titleGrad;

					ctx.fillText(
						"ADMIN REMOVED",
						640,
						190
					);

				}

				// =====================
				// SUB TITLE
				// =====================

				ctx.font =
					"bold 24px Arial";

				ctx.fillStyle =
					"#9ca3af";

				ctx.fillText(
					isPromote
						? "Member has been promoted to administrator"
						: "Administrator privileges removed",
					640,
					235
				);

				// =====================
				// DATE & TIME BOX
				// =====================

				ctx.fillStyle =
					"#161b22";

				ctx.fillRect(
					470,
					255,
					340,
					60
				);

				ctx.strokeStyle =
					"#30363d";

				ctx.lineWidth = 2;

				ctx.strokeRect(
					470,
					255,
					340,
					60
				);

				ctx.font =
					"bold 18px Arial";

				ctx.fillStyle =
					"#ffffff";

				ctx.fillText(
					`${date} • ${time}`,
					640,
					293
				);
				// =====================
				// FULL NAME FUNCTION
				// =====================

				function drawFullName(
					ctx,
					text,
					x,
					y,
					maxWidth,
					color
				) {

					let fontSize = 30;

					do {

						ctx.font =
							`bold ${fontSize}px Arial`;

					}
					while (
						ctx.measureText(text).width > maxWidth &&
						fontSize > 12 &&
						fontSize--
					);

					ctx.fillStyle =
						color;

					ctx.fillText(
						text,
						x,
						y
					);
				}

				// =====================
				// TARGET AVATAR
				// =====================

				if (targetAvatar) {

					ctx.save();

					ctx.shadowColor =
						isPromote
							? "#00ff88"
							: "#ff3b30";

					ctx.shadowBlur =
						25;

					ctx.beginPath();

					ctx.arc(
						350,
						420,
						120,
						0,
						Math.PI * 2
					);

					ctx.clip();

					ctx.drawImage(
						targetAvatar,
						230,
						300,
						240,
						240
					);

					ctx.restore();

					ctx.shadowBlur = 0;

					ctx.strokeStyle =
						isPromote
							? "#00ff88"
							: "#ff3b30";

					ctx.lineWidth = 6;

					ctx.beginPath();

					ctx.arc(
						350,
						420,
						123,
						0,
						Math.PI * 2
					);

					ctx.stroke();
				}

				// =====================
				// EXECUTOR AVATAR
				// =====================

				if (executorAvatar) {

					ctx.save();

					ctx.shadowColor =
						"#00f5ff";

					ctx.shadowBlur =
						25;

					ctx.beginPath();

					ctx.arc(
						930,
						420,
						120,
						0,
						Math.PI * 2
					);

					ctx.clip();

					ctx.drawImage(
						executorAvatar,
						810,
						300,
						240,
						240
					);

					ctx.restore();

					ctx.shadowBlur = 0;

					ctx.strokeStyle =
						"#00f5ff";

					ctx.lineWidth = 6;

					ctx.beginPath();

					ctx.arc(
						930,
						420,
						123,
						0,
						Math.PI * 2
					);

					ctx.stroke();
				}

				// =====================
				// RELATION ARROW
				// =====================

				ctx.strokeStyle =
					"#666";

				ctx.lineWidth = 4;

				ctx.beginPath();

				ctx.moveTo(
					480,
					420
				);

				ctx.lineTo(
					800,
					420
				);

				ctx.stroke();

				ctx.font =
					"bold 42px Arial";

				ctx.fillStyle =
					isPromote
						? "#00ff88"
						: "#ff3b30";

				ctx.fillText(
					isPromote
						? "⬆"
						: "⬇",
					640,
					435
				);

				// =====================
				// TARGET LABEL
				// =====================

				ctx.font =
					"bold 24px Arial";

				ctx.fillStyle =
					"#ffffff";

				ctx.fillText(
					isPromote
						? "NEW ADMIN"
						: "REMOVED ADMIN",
					350,
					580
				);

				// =====================
				// TARGET NAME
				// =====================

				drawFullName(
					ctx,
					targetName,
					350,
					620,
					320,
					isPromote
						? "#00ff88"
						: "#ffcc00"
				);

				// =====================
				// EXECUTOR LABEL
				// =====================

				ctx.font =
					"bold 24px Arial";

				ctx.fillStyle =
					"#ffffff";

				ctx.fillText(
					"EXECUTED BY",
					930,
					580
				);

				// =====================
				// EXECUTOR NAME
				// =====================

				drawFullName(
					ctx,
					executorName,
					930,
					620,
					320,
					"#00f5ff"
				);

				// =====================
				// MEMBER COUNT
				// =====================

				ctx.fillStyle =
					"#111827";

				ctx.fillRect(
					470,
					500,
					340,
					60
				);

				ctx.strokeStyle =
					"#30363d";

				ctx.lineWidth = 2;

				ctx.strokeRect(
					470,
					500,
					340,
					60
				);

				ctx.font =
					"bold 22px Arial";

				ctx.fillStyle =
					"#ffffff";

				ctx.fillText(
					`MEMBERS : ${memberCount}`,
					640,
					540
				);

				// =====================
				// FOOTER
				// =====================

				const footerGrad =
					ctx.createLinearGradient(
						250,
						0,
						1050,
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
					"OWNER • RAIHAN CHOUDHURY",
					640,
					695
				);

				// =====================
				// SAVE IMAGE
				// =====================

				const imagePath =
					path.join(
						cacheDir,
						`admin_${Date.now()}.png`
					);

				await fs.writeFile(
					imagePath,
					canvas.toBuffer("image/png")
				);

				// =====================
				// MESSAGE BODY
				// =====================

				const body =
					isPromote
						? `👑 ${targetName} has been promoted to admin by ${executorName}`
						: `🚫 ${targetName} has been removed from admin by ${executorName}`;

				// =====================
				// SEND
				// =====================

				await message.reply({
					body,
					attachment:
						fs.createReadStream(
							imagePath
						)
				});

				// =====================
				// CLEANUP
				// =====================

				setTimeout(() => {

					try {

						if (
							fs.existsSync(
								imagePath
							)
						) {
							fs.unlinkSync(
								imagePath
							);
						}

					} catch (e) {}

				}, 5000);

			}

			catch (err) {

				console.log(
					"Admin Event Error:",
					err
				);

			}

		};

	}

};
