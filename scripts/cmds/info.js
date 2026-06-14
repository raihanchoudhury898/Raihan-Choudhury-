const { createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const os = require("os");

module.exports = {
	config: {
		name: "info",
		version: "1.0",
		author: "Raihan Choudhury",
		role: 0,
		category: "utility",
		shortDescription: {
			en: "Personal Information Card"
		},
		longDescription: {
			en: "Generate Windows 11 style personal info card"
		},
		guide: {
			en: "{pn}"
		}
	},

	onStart: async function ({
		message,
		event
	}) {
		try {

			const canvas =
				createCanvas(1280, 720);

			const ctx =
				canvas.getContext("2d");

			// ===== BACKGROUND =====

			const bg =
				ctx.createLinearGradient(
					0,
					0,
					1280,
					720
				);

			bg.addColorStop(
				0,
				"#0f172a"
			);

			bg.addColorStop(
				1,
				"#111827"
			);

			ctx.fillStyle = bg;

			ctx.fillRect(
				0,
				0,
				1280,
				720
			);

			// ===== GLASS PANEL =====

			ctx.fillStyle =
				"rgba(255,255,255,0.05)";

			ctx.beginPath();

			ctx.roundRect(
				40,
				40,
				1200,
				640,
				25
			);

			ctx.fill();

			ctx.strokeStyle =
				"rgba(255,255,255,0.08)";

			ctx.lineWidth = 2;

			ctx.stroke();

			// ===== TITLE =====

			ctx.font =
				"bold 42px Arial";

			ctx.fillStyle =
				"#ec4899";

			ctx.fillText(
				"PERSONAL INFORMATION",
				70,
				95
			);

			ctx.font =
				"24px Arial";

			ctx.fillStyle =
				"rgba(255,255,255,0.55)";

			ctx.fillText(
				"",
				70,
				130
			);

			// ===== DATE / TIME =====

			const now = new Date();

const date = now.toLocaleDateString(
	"en-GB",
	{
		timeZone: "Asia/Dhaka"
	}
);

const time = now.toLocaleTimeString(
	"en-US",
	{
		timeZone: "Asia/Dhaka"
	}
);

			// ===== BOT UPTIME =====

			const sec =
				process.uptime();

			const days =
				Math.floor(sec / 86400);

			const hours =
				Math.floor(
					(sec % 86400) / 3600
				);

			const mins =
				Math.floor(
					(sec % 3600) / 60
				);

			const uptime =
				`${days}d ${hours}h ${mins}m`;

			// ===== PERSONAL DATA =====

			const info = [
				["Name", "Raihan Choudhury"],
				["Age", "20 Years"],
				["Education", "HSC (2nd Year)"],
				["Nationality", "Bangladeshi"],
				["District", "Noakhali"],
				["Occupation", "Student"],
				["Phone", "01604884635"],
				["UID", "61589394020592"]
			];
			// ===== LEFT INFORMATION PANEL =====

			const startX = 80;
			const startY = 190;
			const lineHeight = 42;

			info.forEach((item, index) => {

				const y =
					startY +
					(index * lineHeight);

				ctx.font =
					"bold 24px Arial";

				ctx.fillStyle =
					"#60a5fa";

				ctx.fillText(
					item[0] + " :",
					startX,
					y
				);

				ctx.font =
					"24px Arial";

				ctx.fillStyle =
					"#ffffff";

				ctx.fillText(
					item[1],
					startX + 190,
					y
				);

			});

			// ===== RIGHT SIDE PROFILE CARD =====

			ctx.fillStyle =
				"rgba(255,255,255,0.04)";

			ctx.beginPath();

			ctx.roundRect(
				760,
				180,
				420,
				260,
				22
			);

			ctx.fill();

			ctx.strokeStyle =
				"rgba(255,255,255,0.08)";

			ctx.stroke();

			ctx.font =
				"bold 34px Arial";

			ctx.fillStyle =
				"#fbbf24";

			ctx.fillText(
				"Raihan Choudhury",
				790,
				250
			);

			ctx.font =
				"22px Arial";

			ctx.fillStyle =
				"#38bdf8";

			ctx.fillText(
				"BOT OWNER",
				790,
				295
			);

			ctx.font =
				"20px Arial";

			ctx.fillStyle =
				"rgba(255,255,255,0.75)";

			ctx.fillText(
				"",
				790,
				340
			);

			ctx.fillText(
				"From",
				790,
				375
			);

			ctx.fillText(
				"Noakhali, Bangladesh",
				790,
				410
			);

			// ===== STATUS LINE =====

			ctx.fillStyle =
				"#22c55e";

			ctx.beginPath();

			ctx.arc(
				790,
				470,
				8,
				0,
				Math.PI * 2
			);

			ctx.fill();

			ctx.font =
				"20px Arial";

			ctx.fillStyle =
				"#22c55e";

			ctx.fillText(
				"ONLINE",
				810,
				477
			);

			// ===== SYSTEM INFO HEADER =====

			ctx.font =
				"bold 28px Arial";

			ctx.fillStyle =
				"#ffffff";

			ctx.fillText(
				"",
				80,
				640
			);
			// ===== DATE / TIME / UPTIME CARDS =====

			const cardY = 520;
			const cardW = 250;
			const cardH = 90;

			const cards = [
				{
					title: "DATE",
					value: date,
					color: "#3b82f6"
				},
				{
					title: "TIME",
					value: time,
					color: "#10b981"
				},
				{
					title: "UPTIME",
					value: uptime,
					color: "#f59e0b"
				},
				{
					title: "FRAMEWORK",
					value: "𝚁𝙰𝙸𝙷𝙰𝙽'𝚂 𝙶𝙾𝙰𝚃 𝙱𝙾𝚃",
					color: "#8b5cf6"
				}
			];

			cards.forEach((card, index) => {

				const x =
					80 +
					(index * 285);

				ctx.fillStyle =
					"rgba(255,255,255,0.05)";

				ctx.beginPath();

				ctx.roundRect(
					x,
					cardY,
					cardW,
					cardH,
					18
				);

				ctx.fill();

				ctx.strokeStyle =
					"rgba(255,255,255,0.08)";

				ctx.stroke();

				ctx.font =
					"18px Arial";

				ctx.fillStyle =
					"rgba(255,255,255,0.55)";

				ctx.fillText(
					card.title,
					x + 18,
					cardY + 28
				);

				ctx.font =
					"bold 22px Arial";

				ctx.fillStyle =
					card.color;

				ctx.fillText(
					card.value,
					x + 18,
					cardY + 62
				);

			});

			// ===== FOOTER =====

			ctx.font =
				"18px Arial";

			ctx.fillStyle =
				"rgba(255,255,255,0.35)";

			ctx.fillText(
				"",
				80,
				690
			);

			// ===== SAVE IMAGE =====

			const cacheDir =
				path.join(
					__dirname,
					"cache"
				);

			fs.ensureDirSync(
				cacheDir
			);

			const output =
				path.join(
					cacheDir,
					`info_${Date.now()}.png`
				);

			fs.writeFileSync(
				output,
				canvas.toBuffer("image/png")
			);

			await message.reply({
				attachment:
					fs.createReadStream(
						output
					)
			});

			setTimeout(() => {

				if (
					fs.existsSync(
						output
					)
				) {
					fs.unlinkSync(
						output
					);
				}

			}, 15000);

		} catch (err) {

			console.error(err);

			return message.reply(
				"Failed to generate info card."
			);

		}
	}
};
