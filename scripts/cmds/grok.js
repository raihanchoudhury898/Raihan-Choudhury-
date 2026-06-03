const axios = require("axios");

module.exports = { config: { name: "grok", version: "1.0", author: "Raihan Choudhury", countDown: 5, role: 0, description: "AI Assistant powered by xAI Grok", category: "ai", guide: { en: "{pn} " } },

onStart: async function ({ message, args }) { 	if (!args.length) { 		return message.reply( 

`╭─── GROK AI ───╮

Usage: grok 

Examples: grok Who is Elon Musk? grok What is JavaScript? grok Tell me about Bangladesh

╰────────────────╯` ); }

	const prompt = args.join(" "); 	try { 		const apiKey = "xai-GkYC3ltJufHYDaEPkyZud5yYcA4rWT8s3Pk6QlOfivxP9xdjX9t28kIK2jJFW4VrER6LoKOnGC6WhWPe"; 		const response = await axios.post( 			"https://api.x.ai/v1/chat/completions", 			{ 				model: "grok-3", 				messages: [ 					{ 						role: "system", 						content: "You are Grok, a professional AI assistant. Always answer in the same language used by the user. Be accurate, helpful and concise." 					}, 					{ 						role: "user", 						content: prompt 					} 				], 				temperature: 0.7, 				max_tokens: 2000 			}, 			{ 				headers: { 					Authorization: `Bearer ${apiKey}`, 					"Content-Type": "application/json" 				}, 				timeout: 30000 			} 		); 		const answer = 			response.data?.choices?.[0]?.message?.content || 			"No response received."; 		return message.reply( 

`╭────── GROK AI ──────╮

${answer}

╰─────────────────────╯` );

	} catch (error) { 		console.log(error.response?.data || error); 		return message.reply( 

`❌ Request Failed

Possible Reasons: • Invalid API Key • Rate Limit Exceeded • Network Issue • Service Unavailable

Please try again later.` ); } } };
