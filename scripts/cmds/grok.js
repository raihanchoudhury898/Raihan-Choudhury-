const axios = require("axios");

const userSessions = new Map();

module.exports = {
  config: {
    name: "grok",
    version: "4.1",
    author: "ChatGPT",
    countDown: 3,
    role: 0,
    description: "Grok AI with reply-based conversation system",
    category: "ai",
    guide: {
      en: "{pn} <question> OR reply to a message and ask a question"
    }
  },

  onStart: async function ({ message, args, event }) {
    return this.handle({ message, args, event });
  },

  handle: async function ({ message, args, event }) {
    const userID = event.senderID;

    if (!args.length && !event.messageReply) {
      return message.reply(
`╭─── GROK AI ───╮

Usage:
• grok <question>
• Reply to any message and ask

Example:
grok what is AI?

╰──────────────╯`
      );
    }

    const prompt = args.join(" ");

    let replyContext = "";

    if (event.messageReply && event.messageReply.body) {
      replyContext = `Previous message: ${event.messageReply.body}\n\n`;
    }

    if (!userSessions.has(userID)) {
      userSessions.set(userID, []);
    }

    const history = userSessions.get(userID);

    const finalInput = replyContext + prompt;

    history.push({ role: "user", content: finalInput });

    const trimmedHistory = history.slice(-10);

    try {
      const apiKey =
        process.env.XAI_API_KEY ||
        "xai-GkYC3ltJufHYDaEPkyZud5yYcA4rWT8s3Pk6QlOfivxP9xdjX9t28kIK2jJFW4VrER6LoKOnGC6WhWPe";

      const response = await axios.post(
        "https://api.x.ai/v1/chat/completions",
        {
          model: "grok-2-latest",
          messages: [
            {
              role: "system",
              content:
                "You are Grok AI. You respond clearly, accurately, and naturally. You understand follow-up questions and reply-based conversation context."
            },
            ...trimmedHistory
          ],
          temperature: 0.7,
          max_tokens: 1500
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          timeout: 30000
        }
      );

      const answer =
        response.data?.choices?.[0]?.message?.content || "No response.";

      history.push({ role: "assistant", content: answer });

      userSessions.set(userID, history.slice(-10));

      return message.reply(
`╭─── GROK RESPONSE ───╮

${answer}

╰─────────────────────╯`
      );

    } catch (error) {
      console.log(error.response?.data || error);

      return message.reply(
`Error occurred. Please try again later.`
      );
    }
  }
};
