module.exports = {
  config: {
    name: "addowner",
    version: "2.0",
    author: "Raihan Choudhury",
    countDown: 5,
    role: 0,
    shortDescription: "Add bot owner to group",
    longDescription: "Automatically add the bot owner to the current group.",
    category: "group",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    const ownerID = "61589394020592";

    try {
      // Group information
      const threadInfo = await api.getThreadInfo(event.threadID);

      // Owner already exists
      if (threadInfo.participantIDs.includes(ownerID)) {
        return api.sendMessage(
          "╭─────────────╮\n" +
          " Owner already exists in this group.\n" +
          "╰─────────────╯",
          event.threadID
        );
      }

      // Try adding owner
      await api.addUserToGroup(ownerID, event.threadID);

      return api.sendMessage(
        "╭─────────────╮\n" +
        " Successfully added Raihan Choudhury to the group.\n" +
        "╰─────────────╯",
        event.threadID
      );

    } catch (err) {

      const error = String(err?.error || err?.message || err).toLowerCase();

      // Admin approval enabled
      if (
        error.includes("approval") ||
        error.includes("pending") ||
        error.includes("admin approval")
      ) {
        return api.sendMessage(
          "╭─────────────╮\n" +
          " Group Admin Approval is enabled.\n" +
          " Owner has received a join request and needs approval.\n" +
          "╰─────────────╯",
          event.threadID
        );
      }

      // Bot isn't admin
      if (
        error.includes("not admin") ||
        error.includes("permissions") ||
        error.includes("admin required")
      ) {
        return api.sendMessage(
          "╭─────────────╮\n" +
          " Failed to add owner.\n" +
          " Reason: Bot is not an administrator of this group.\n" +
          "╰─────────────╯",
          event.threadID
        );
      }

      // Owner privacy settings
      if (
        error.includes("privacy") ||
        error.includes("cannot be added") ||
        error.includes("restricted")
      ) {
        return api.sendMessage(
          "╭─────────────╮\n" +
          " Failed to add owner.\n" +
          " Reason: Owner's Facebook privacy settings prevent automatic adding.\n" +
          "╰─────────────╯",
          event.threadID
        );
      }

      // Unknown error
      return api.sendMessage(
        "╭─────────────╮\n" +
        " Failed to add owner.\n" +
        ` Reason: ${err.error || err.message || "Unknown error"}\n` +
        "╰─────────────╯",
        event.threadID
      );
    }
  }
};
