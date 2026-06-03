const axios = require("axios");

module.exports = {
  config: {
    name: "ai",
    version: "12.0",
    author: "Raihan Choudhury",
    countDown: 3,
    role: 0,
    description: "AI System (Grok + Groq + Gemini + Voice + Image)",
    category: "ai",
    guide: {
      en: `
ai <model> <question>
ai voice <text>
ai image <prompt>

Models:
grok | groq | gemini
      `
    }
  },

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
  // VOICE (TTS)
  // =========================
  voice(text) {
    return `https://api.streamelements.com/kappa/v2/speech?voice=Brian&text=${encodeURIComponent(text)}`;
  },

  // =========================
  // IMAGE GENERATOR
  // =========================
  image(prompt) {
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`;
  },

  // =========================
  // GROK
  // =========================
  async grok(prompt, history) {
    try {
      const res = await axios.post(
        "https://api.x.ai/v1/chat/completions",
        {
          model: "grok-2-latest",
          messages: [
            { role: "system", content: "You are Grok AI assistant." },
            ...history
          ]
        },
        {
          headers: {
            Authorization: `Bearer xai-GkYC3ltJufHYDaEPkyZud5yYcA4rWT8s3Pk6QlOfivxP9xdjX9t28kIK2jJFW4VrER6LoKOnGC6WhWPe`,
            "Content-Type": "application/json"
          }
        }
      );

      return res.data?.choices?.[0]?.message?.content;
    } catch {
      return null;
    }
  },

  // =========================
  // GROQ
  // =========================
  async groq(prompt, history) {
    try {
      const res = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: "You are a helpful assistant." },
            ...history
          ]
        },
        {
          headers: {
            Authorization: `Bearer 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`,
            "Content-Type": "application/json"
          }
        }
      );

      return res.data?.choices?.[0]?.message?.content;
    } catch {
      return null;
    }
  },

  // =========================
  // GEMINI
  // =========================
  async gemini(prompt) {
    try {
      const res = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AQ.Ab8RN6LCvMTLuFuAaiSwzKsNrBdCIUuPSLW1bLk4qoIIC5EsFg",
        {
          contents: [{ parts: [{ text: prompt }] }]
        }
      );

      return res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch {
      return null;
    }
  },

  // =========================
  // ROUTER
  // =========================
  async router(model, prompt, history) {
    if (model === "grok") return await this.grok(prompt, history);
    if (model === "groq") return await this.groq(prompt, history);
    if (model === "gemini") return await this.gemini(prompt);
    return "❌ Invalid model (grok / groq / gemini)";
  },

  // =========================
  // MAIN
  // =========================
  onStart: async function ({ message, args, event }) {
    this.init();

    const id = event.senderID;
    const cmd = args[0]?.toLowerCase();

    // ================= VOICE =================
    if (cmd === "voice") {
      const text = args.slice(1).join(" ");
      if (!text) return message.reply("❌ Please provide text");

      const audio = this.voice(text);
      return message.reply({ attachment: await global.utils.getStreamFromURL(audio) });
    }

    // ================= IMAGE =================
    if (cmd === "image") {
      const prompt = args.slice(1).join(" ");
      if (!prompt) return message.reply("❌ Please provide prompt");

      const img = this.image(prompt);
      return message.reply(img);
    }

    // ================= AI CHAT =================
    if (args.length < 2) {
      return message.reply(
`Usage:
ai <model> <question>

Extra:
ai voice <text>
ai image <prompt>`
      );
    }

    const model = cmd;
    const prompt = args.slice(1).join(" ");

    const session = this.getSession(id);

    this.addHistory(id, "user", prompt);

    try {
      const reply = await this.router(model, prompt, session.history);

      if (!reply) return message.reply("❌ No response");

      this.addHistory(id, "assistant", reply);

      return message.reply(
`╭─── AI (${model.toUpperCase()}) ───╮

${reply}

╰────────────────────────╯`
      );

    } catch (err) {
      console.log(err);
      return message.reply("❌ System error");
    }
  }
};
