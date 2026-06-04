module.exports = {
  config: {
    name: "join",
    aliases: ["boxlist", "allbox"],
    version: "2.0.0",
    author: "Raihan Choudhury",
    role: 2,
    shortDescription: "Show group list & add owner",
    longDescription: "Display all active groups and add the bot owner to selected groups.",
    category: "system",
    countDown: 10
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, senderID } = event;
    const perPage = 10;

    try {
      // Fetch inbox threads
      const allThreads = await api.getThreadList(
        50,
        null,
        ["INBOX"]
      );

      // Active groups only
      const groups = allThreads.filter(
        thread => thread.isGroup && thread.isSubscribed
      );

      if (!groups.length) {
        return api.sendMessage(
          "No active groups found.",
          threadID,
          messageID
        );
      }

      const page = 1;
      const start = (page - 1) * perPage;
      const end = start + perPage;
      const currentGroups = groups.slice(start, end);

      let msg = `┌──── ACTIVE GROUPS ────┐\n\n`;

      currentGroups.forEach((group, index) => {
        msg += `${start + index + 1}. ${group.name || "Unnamed Group"}\n`;
        msg += `${group.threadID}\n\n`;
      });

      msg +=
        `└──────────────────────┘\n\n` +
        `Reply:\n` +
        `add 1\n` +
        `add 2 5\n\n` +
        `Or\n` +
        `page 2`;

      api.sendMessage(
        msg,
        threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            author: senderID,
            groups,
            page,
            perPage
          });
        },
        messageID
      );

    } catch (err) {
      console.log(err);
      api.sendMessage(
        "Failed to fetch group list.",
        threadID,
        messageID
      );
    }
  },

  onReply: async function ({ api, event, Reply }) {

    if (event.senderID != Reply.author) return;

    const args = event.body.trim().toLowerCase().split(/\s+/);
    const perPage = Reply.perPage || 10;

    // =========================
    // PAGE SYSTEM
    // =========================

    if (args[0] === "page") {

      const pageNum = parseInt(args[1]);

      if (isNaN(pageNum) || pageNum < 1) {
        return api.sendMessage(
          "Invalid page number.",
          event.threadID
        );
      }

      const start = (pageNum - 1) * perPage;
      const end = start + perPage;
      const currentGroups = Reply.groups.slice(start, end);

      if (!currentGroups.length) {
        return api.sendMessage(
          "No more groups available.",
          event.threadID
        );
      }

      let msg = `┌──── ACTIVE GROUPS ────┐\n\n`;

      currentGroups.forEach((group, index) => {
        msg += `${start + index + 1}. ${group.name || "Unnamed Group"}\n`;
        msg += `${group.threadID}\n\n`;
      });

      msg +=
        `└──────────────────────┘\n\n` +
        `Reply:\n` +
        `add 1\n` +
        `add 2 5\n\n` +
        `Or\n` +
        `page ${pageNum + 1}`;

      api.sendMessage(
        msg,
        event.threadID,
        (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: Reply.commandName,
            author: Reply.author,
            groups: Reply.groups,
            page: pageNum,
            perPage
          });
        }
      );

      return;
    }

    // =========================
    // ADD OWNER SYSTEM
    // =========================

    if (args[0] === "add") {

      const OWNER_UID = "61589394020592";

      for (let i = 1; i < args.length; i++) {

        const index = parseInt(args[i]) - 1;

        if (
          isNaN(index) ||
          index < 0 ||
          index >= Reply.groups.length
        ) {
          await api.sendMessage(
            `Invalid group number: ${args[i]}`,
            event.threadID
          );
          continue;
        }

        const group = Reply.groups[index];

        try {

          const info = await api.getThreadInfo(
            group.threadID
          );

          // Already exists
          if (
            info.participantIDs.includes(OWNER_UID)
          ) {
            await api.sendMessage(
              `Already added:\n${group.name || "Unnamed Group"}`,
              event.threadID
            );
            continue;
          }

          // Try add owner
          await api.addUserToGroup(
            OWNER_UID,
            group.threadID
          );

          await api.sendMessage(
            `Successfully sent add request:\n${group.name || "Unnamed Group"}`,
            event.threadID
          );

        } catch (err) {

          const error = String(
            err?.error ||
            err?.message ||
            err
          ).toLowerCase();

          // Admin approval
          if (
            error.includes("approval") ||
            error.includes("pending")
          ) {
            await api.sendMessage(
              `Admin approval is enabled:\n${group.name || "Unnamed Group"}`,
              event.threadID
            );
          }

          // Bot not admin
          else if (
            error.includes("admin") ||
            error.includes("permission")
          ) {
            await api.sendMessage(
              `Cannot add:\n${group.name || "Unnamed Group"}\n\nReason: Bot is not an administrator.`,
              event.threadID
            );
          }

          // Privacy restriction
          else if (
            error.includes("privacy") ||
            error.includes("restricted") ||
            error.includes("cannot")
          ) {
            await api.sendMessage(
              `Cannot add:\n${group.name || "Unnamed Group"}\n\nReason: Facebook privacy restriction.`,
              event.threadID
            );
          }

          // Unknown
          else {
            await api.sendMessage(
              `Failed:\n${group.name || "Unnamed Group"}\n\nReason:\n${err.error || err.message || "Unknown Error"}`,
              event.threadID
            );
          }
        }
      }
    }
  }
};
