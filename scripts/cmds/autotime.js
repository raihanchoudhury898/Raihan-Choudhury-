module.exports.config = {
name: "autotime",
version: "4.0.0",
hasPermssion: 0,
credits: "Raihan Choudhury",
description: "Advanced Auto Time Message System",
commandCategory: "system",
usages: "",
cooldowns: 5
};

const messages = [
{
timer: "12:00:00 AM",
period: "🌙 গভীর রাত",
message: [
"রাত অনেক হয়েছে, বিশ্রাম নাও। 😴",
"নিজের শরীরের যত্ন নাও, পর্যাপ্ত ঘুম খুবই গুরুত্বপূর্ণ। 🤍",
"আজকের ক্লান্তি ভুলে শান্তিতে ঘুমিয়ে পড়ো। 🌙"
]
},
{
timer: "1:00:00 AM",
period: "🌙 গভীর রাত",
message: [
"এখনও জেগে আছো? একটু বিশ্রাম নাও। 😴",
"রাত জাগা কমিয়ে স্বাস্থ্যকর অভ্যাস গড়ে তোলো। 💙"
]
},
{
timer: "2:00:00 AM",
period: "🌙 গভীর রাত",
message: [
"গভীর রাত চলছে। নিজের যত্ন নিতে ভুলবে না। ✨",
"আগামী দিনের জন্য শক্তি সঞ্চয় করো। 🤍"
]
},
{
timer: "3:00:00 AM",
period: "🌌 রাত",
message: [
"নতুন ভোরের অপেক্ষা। সুন্দর কিছু পরিকল্পনা করো। 🌠"
]
},
{
timer: "4:00:00 AM",
period: "🌄 ভোর",
message: [
"ভোরের নির্মল বাতাস নতুন আশা নিয়ে আসে। 🌿"
]
},
{
timer: "5:00:00 AM",
period: "🌅 ভোর",
message: [
"শুভ সকাল! নতুন দিন, নতুন সম্ভাবনা। ☀️"
]
},
{
timer: "6:00:00 AM",
period: "☀️ সকাল",
message: [
"সুপ্রভাত! দিনটা সুন্দর কাটুক। 🌼",
"সকালের শুরুটা ইতিবাচক চিন্তা দিয়ে করো। 💛"
]
},
{
timer: "7:00:00 AM",
period: "☀️ সকাল",
message: [
"ঘুম থেকে উঠে পড়লে? ফ্রেশ হয়ে নাও। 🌤️"
]
},
{
timer: "8:00:00 AM",
period: "☀️ সকাল",
message: [
"আজকের লক্ষ্য ঠিক করো এবং আত্মবিশ্বাস নিয়ে এগিয়ে যাও। 💪"
]
},
{
timer: "9:00:00 AM",
period: "☀️ সকাল",
message: [
"সাফল্য আসে ধারাবাহিক পরিশ্রমের মাধ্যমে। ✨"
]
},
{
timer: "10:00:00 AM",
period: "☕ সকাল",
message: [
"ব্যস্ততার মাঝেও নিজের যত্ন নিতে ভুলো না। ☕"
]
},
{
timer: "11:00:00 AM",
period: "🌞 দুপুর",
message: [
"দুপুর ঘনিয়ে আসছে, কাজগুলো গুছিয়ে নাও। 📋"
]
},
{
timer: "12:00:00 PM",
period: "🌞 দুপুর",
message: [
"শুভ দুপুর! আশা করি দিনটা ভালো যাচ্ছে। 😊"
]
},
{
timer: "1:00:00 PM",
period: "🍽️ দুপুর",
message: [
"সময়মতো খাবার খেতে ভুলবে না। ❤️"
]
},
{
timer: "2:00:00 PM",
period: "🌿 বিকাল",
message: [
"দিনের অর্ধেক শেষ, নতুন উদ্যমে এগিয়ে চলো। 🌿"
]
},
{
timer: "3:00:00 PM",
period: "🌤️ বিকাল",
message: [
"ছোট ছোট অগ্রগতিই বড় সাফল্য এনে দেয়। ✨"
]
},
{
timer: "4:00:00 PM",
period: "🌤️ বিকাল",
message: [
"নিজের জন্য কিছু সময় রাখো। 😊"
]
},
{
timer: "5:00:00 PM",
period: "🌇 সন্ধ্যা",
message: [
"দিনের ব্যস্ততা শেষে একটু বিশ্রাম নাও। 🌇"
]
},
{
timer: "6:00:00 PM",
period: "🌆 সন্ধ্যা",
message: [
"শুভ সন্ধ্যা। প্রিয়জনদের সাথে সময় কাটাও। ❤️"
]
},
{
timer: "7:00:00 PM",
period: "🌆 সন্ধ্যা",
message: [
"সন্ধ্যার শান্ত পরিবেশ উপভোগ করো। 🌸"
]
},
{
timer: "8:00:00 PM",
period: "🌙 রাত",
message: [
"রাত শুরু হয়েছে, নিজের দিনের হিসাব নাও। ✨"
]
},
{
timer: "9:00:00 PM",
period: "🌙 রাত",
message: [
"আগামীকালের জন্য সুন্দর পরিকল্পনা করো। 💫"
]
},
{
timer: "10:00:00 PM",
period: "🌙 রাত",
message: [
"দিনের ক্লান্তি দূরে রেখে বিশ্রাম নাও। 😌"
]
},
{
timer: "11:00:00 PM",
period: "🌙 রাত",
message: [
"ঘুমানোর সময় হয়ে এসেছে। সবাই ভালো থেকো। 🤍"
]
}
];

const sentHistory = new Set();

module.exports.onLoad = async ({ api }) => {

setInterval(async () => {
	try {

		const now = new Date(Date.now() + 21600000);

		const currentTime = now.toLocaleTimeString("en-US", {
			hour12: true
		});

		const currentDate = now.toDateString();
		const uniqueKey = `${currentDate}_${currentTime}`;

		if (sentHistory.has(uniqueKey))
			return;

		const data = messages.find(
			item => item.timer === currentTime
		);

		if (!data)
			return;

		sentHistory.add(uniqueKey);

		if (sentHistory.size > 100)
			sentHistory.clear();

		const randomMessage =
			data.message[
				Math.floor(
					Math.random() * data.message.length
				)
			];

		const finalMessage =

`╭─────────────⏰
│ 𝗔𝗨𝗧𝗢 𝗧𝗜𝗠𝗘 𝗥𝗘𝗠𝗜𝗡𝗗𝗘𝗥
├─────────────
│ ${data.period}
│ 🕒 ${currentTime}
╰─────────────

${randomMessage}

✨ Have a Nice Day ✨`;

		for (const threadID of global.data.allThreadID) {
			try {
				api.sendMessage(
					finalMessage,
					threadID
				);
			}
			catch (e) {}
		}

	}
	catch (err) {
		console.log(
			"[AUTOTIME ERROR]",
			err
		);
	}
}, 30000);

};

module.exports.run = async function () {};
