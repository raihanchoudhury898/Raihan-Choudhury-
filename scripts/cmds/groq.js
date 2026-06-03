const axios = require("axios");

module.exports = { config: { name: "groq", version: "1.1", author: "Raihan Choudhury", countDown: 5, role: 0, description: "AI Assistant powered by Groq", category: "ai", guide: { en: "{pn} " } },

onStart: async function ({ message, args }) { 	if (!args.length) { 		return message.reply( 

`╭─── GROQ AI ───╮

Usage: groq 

Examples: groq Who are you? groq What is JavaScript? groq Tell me about Bangladesh

╰────────────────╯` ); }

	const prompt = args.join(" "); 	try { 		const apiKey = process.env.GROQ_API_KEY || "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"; 		const response = await axios.post( 			"https://api.groq.com/openai/v1/chat/completions", 			{ 				model: "llama-3.3-70b-versatile", 				messages: [ 					{ 						role: "system", 						content: "You are a professional AI assistant. Always respond in the same language used by the user. Keep responses clear, accurate, and helpful." 					}, 					{ 						role: "user", 						content: prompt 					} 				], 				temperature: 0.7, 				max_tokens: 2000 			}, 			{ 				headers: { 					Authorization: `Bearer ${apiKey}`, 					"Content-Type": "application/json" 				}, 				timeout: 30000 			} 		); 		const answer = response.data.choices[0].message.content; 		return message.reply( 

`╭─── GROQ AI RESPONSE ───╮

${answer}

╰────────────────────────╯` );

	} catch (error) { 		console.log(error.response?.data || error); 		return message.reply( 

`❌ Request Failed

Possible Reasons: • Invalid API Key • Rate Limit Exceeded • Network Issue • Server Unavailable

Please try again later.` ); } } };
