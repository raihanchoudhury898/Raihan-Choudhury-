const axios = require("axios");

module.exports = {
  config: {
    name: "ai",
    version: "10.0",
    author: "ChatGPT",
    countDown: 3,
    role: 0,
    description: "Godbot Ultimate AI System (All-in-One Script)",
    category: "ai",
    guide: {
      en: "{pn} <model> <question>\nExample: ai auto hello"
    }
  },

  // =========================
  // MEMORY SYSTEM
  // =========================
  memory: new Map(),

  init() {
    if (this._init) return;
    this._init = true;

    setInterval(() => {
      for (const [id, data] of this.memory.entries()) {
        if (!data?.history?.length) this.memory.delete(id);
      }
    }, 10 * 60 * 1000);
  },

  getSession(id) {
    if (!this.memory.has(id)) {
      this.memory.set(id, { history: [] });
    }
    return this.memory.get(id);
  },

  addHistory(id, role, content) {
    const s = this.getSession(id);
    s.history.push({ role, content });

    if (s.history.length > 20) {
      s.history = s.history.slice(-20);
    }

    this.memory.set(id, s);
  },

  // =========================
  // VOICE SYSTEM (TTS)
  // =========================
  voice(text) {
    return `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(text)}`;
  },

  // =========================
  // IMAGE HOOK (READY)
  // =========================
  async image(prompt) {
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
  },

  // =========================
  // AI CALLERS
  // =========================
  async grok(prompt, history) {
    const key = process.env.XAI_API_KEY;
    if (!key) return null;

    const res = await axios.post(
      "https://api.x.ai/v1/chat/completions",
      {
        model: "grok-2-latest",
        messages: [
          { role: "system", content: "You are Grok AI assistant." },
          ...history
        ],
        temperature: 0.7,
        max_tokens: 1200
      },
      {
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    return res.data?.choices?.[0]?.message?.content;
  },

  async groq(prompt, history) {
    const key = process.env.GROQ_API_KEY;
    if (!key) return null;

    const res = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "You are helpful assistant." },
          ...history
        ],
        temperature: 0.7,
        max_tokens: 1200
      },
      {
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json"
        },
        timeout: 30000
      }
    );

    return res.data?.choices?.[0]?.message?.content;
  },

  async gemini(prompt) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;

    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${key}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      },
      { timeout: 30000 }
    );

    return res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
  },

  // =========================
  // SMART ROUTER
  // =========================
  async router(model, prompt, history) {

    const auto = async () => {
      return (
        (await this.grok(prompt, history)) ||
        (await this.groq(prompt, history)) ||
        (await this.gemini(prompt))
      );
    };

    if (model === "grok") return await this.grok(prompt, history);
    if (model === "groq") return await this.groq(prompt, history);
    if (model === "gemini") return await this.gemini(prompt);

    return await auto();
  },

  // =========================
  // MAIN HANDLER
  // =========================
  onStart: async function ({ message, args, event }) {
    this.init();

    const id = event.senderID;

    if (!args.length) {
      return message.reply(
`╭─── GODBOT ULTIMATE AI ───╮

Commands:
ai <model> <question>

Models:
• grok
• groq
• gemini
• auto

Extra:
• ai voice <text>
• ai image <prompt>

Example:
ai auto what is AI

╰─────────────────────────╯`
      );
    }

    const model = args[0].toLowerCase();
    const prompt = args.slice(1).join(" ");

    // =========================
    // VOICE MODE
    // =========================
    if (model === "voice") {
      const url = this.voice(prompt);
      return message.reply({ attachment: await global.utils.getStreamFromURL(url) });
    }

    // =========================
    // IMAGE MODE
    // =========================
    if (model === "image") {
      const url = await this.image(prompt);
      return message.reply(url);
    }

    const session = this.getSession(id);

    this.addHistory(id, "user", prompt);

    try {
      const reply = await this.router(model, prompt, session.history);

      if (!reply) {
        return message.reply("❌ AI response failed.");
      }

      this.addHistory(id, "assistant", reply);

      return message.reply(
`╭─── AI RESPONSE (${model.toUpperCase()}) ───╮

${reply.trim()}

╰────────────────────────────────────────╯`
      );

    } catch (err) {
      console.log(err.response?.data || err.message);

      return message.reply(
`❌ SYSTEM ERROR

• API failure
• Network issue
• Rate limit

Try again later.`
      );
    }
  }
};
