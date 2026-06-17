const { config } = global.GoatBot;
const { writeFileSync } = require("fs-extra");

module.exports = {
  config: {
    name: "admin",
    aliases: ["operator"],
    version: "2.4",
    author: "Raihan Choudhury",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Operator system" },
    longDescription: { en: "Add/remove operator or premium users (only owner)" },
    category: "box chat",
    guide: {
      en: '   {pn} add <uid/@tag/reply> - Add admin\n   {pn} remove <uid/@tag/reply> - Remove admin\n   {pn} premium add <uid/@tag/reply> - Add premium user\n   {pn} premium remove <uid/@tag/reply> - Remove premium user\n   {pn} list - List all admins & premium users'
    }
  },

  langs: {
    en: {
      added: "✅ | Added operator for %1 users:\n%2",
      alreadyAdmin: "\n⚠ | %1 users already operator:\n%2",
      missingIdAdd: "⚠ | Please enter ID, tag, or reply to a message to add operator.",
      removed: "✅ | Removed operator of %1 users:\n%2",
      notAdmin: "⚠ | %1 users are not operator:\n%2",
      missingIdRemove: "⚠ | Please enter ID, tag, or reply to a message to remove operator.",
      
      premiumAdded: "✅ | Added premium for %1 users:\n%2",
      alreadyPremium: "\n⚠ | %1 users already premium:\n%2",
      missingIdPremiumAdd: "⚠ | Please enter ID, tag, or reply to a message to add premium user.",
      premiumRemoved: "✅ | Removed premium of %1 users:\n%2",
      notPremium: "⚠ | %1 users are not premium:\n%2",
      missingIdPremiumRemove: "⚠ | Please enter ID, tag, or reply to a message to remove premium user.",
      
      listAdmin: "👑 | Operator list:\n%1",
      listPremium: "⭐ | Premium Users:\n%1"
    }
  },

  onStart: async function ({ message, args, usersData, event, getLang }) {
    const senderID = event.senderID;

    // Get owner from config (first admin in adminBot array)
    const OWNER = config.adminBot.length > 0 ? [config.adminBot[0]] : [];

    // Check if sender is owner
    const isOwner = OWNER.includes(senderID);

    // Helper function to get UIDs from various input methods
    function getUIDs() {
      let uids = [];
      if (event.type === "message_reply") {
        uids.push(event.messageReply.senderID);
      } else if (Object.keys(event.mentions).length > 0) {
        uids = Object.keys(event.mentions);
      } else if (args.slice(1).length > 0) {
        uids = args.slice(1).filter(arg => !isNaN(arg));
      }
      return uids;
    }

    // Helper function to get names for UIDs
    async function getNames(uids) {
      return await Promise.all(
        uids.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
      );
    }

    //━━━━━━━━━━━━━━━━━━━━━━━
    // ADMIN MANAGEMENT
    //━━━━━━━━━━━━━━━━━━━━━━━
    if (args[0] === "add" || args[0] === "-a") {
      if (!isOwner) {
        return message.reply("❌ Only main admin can add operator.");
      }

      const uids = getUIDs();
      if (uids.length === 0) {
        return message.reply(getLang("missingIdAdd"));
      }

      const notAdminIds = [];
      const adminIds = [];

      for (const uid of uids) {
        if (config.adminBot.includes(uid)) {
          adminIds.push(uid);
        } else {
          notAdminIds.push(uid);
        }
      }

      config.adminBot.push(...notAdminIds);
      const names = await getNames(uids);
      writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

      let replyMsg = "";
      if (notAdminIds.length > 0) {
        replyMsg += getLang(
          "added",
          notAdminIds.length,
          names.filter(n => notAdminIds.includes(n.uid)).map(i => `• ${i.name} (${i.uid})`).join("\n")
        );
      }
      if (adminIds.length > 0) {
        replyMsg += getLang(
          "alreadyAdmin",
          adminIds.length,
          adminIds.map(uid => `• ${uid}`).join("\n")
        );
      }
      return message.reply(replyMsg);
    }

    else if (args[0] === "remove" || args[0] === "-r") {
      if (!isOwner) {
        return message.reply("❌ Only main admin can remove operator.");
      }

      const uids = getUIDs();
      if (uids.length === 0) {
        return message.reply(getLang("missingIdRemove"));
      }

      const notAdminIds = [];
      const adminIds = [];

      for (const uid of uids) {
        if (config.adminBot.includes(uid)) {
          adminIds.push(uid);
        } else {
          notAdminIds.push(uid);
        }
      }

      const names = await getNames(adminIds);
      
      for (const uid of adminIds) {
        const index = config.adminBot.indexOf(uid);
        if (index !== -1) {
          config.adminBot.splice(index, 1);
        }
      }

      writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

      let replyMsg = "";
      if (adminIds.length > 0) {
        replyMsg += getLang(
          "removed",
          adminIds.length,
          names.map(i => `• ${i.name} (${i.uid})`).join("\n")
        );
      }
      if (notAdminIds.length > 0) {
        replyMsg += getLang(
          "notAdmin",
          notAdminIds.length,
          notAdminIds.map(uid => `• ${uid}`).join("\n")
        );
      }
      return message.reply(replyMsg);
    }

    //━━━━━━━━━━━━━━━━━━━━━━━
    // PREMIUM MANAGEMENT
    //━━━━━━━━━━━━━━━━━━━━━━━
    else if (args[0] === "premium" && args[1] === "add") {
      if (!isOwner) {
        return message.reply("❌ Only main admin can add premium users.");
      }

      const uids = getUIDs();
      if (uids.length === 0) {
        return message.reply(getLang("missingIdPremiumAdd"));
      }

      // Initialize premiumUsers if it doesn't exist
      if (!config.premiumUsers) {
        config.premiumUsers = [];
      }

      const notPremiumIds = [];
      const premiumIds = [];

      for (const uid of uids) {
        if (config.premiumUsers.includes(uid)) {
          premiumIds.push(uid);
        } else {
          notPremiumIds.push(uid);
        }
      }

      config.premiumUsers.push(...notPremiumIds);
      const names = await getNames(uids);
      writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

      let replyMsg = "";
      if (notPremiumIds.length > 0) {
        replyMsg += getLang(
          "premiumAdded",
          notPremiumIds.length,
          names.filter(n => notPremiumIds.includes(n.uid)).map(i => `• ${i.name} (${i.uid})`).join("\n")
        );
      }
      if (premiumIds.length > 0) {
        replyMsg += getLang(
          "alreadyPremium",
          premiumIds.length,
          premiumIds.map(uid => `• ${uid}`).join("\n")
        );
      }
      return message.reply(replyMsg);
    }

    else if (args[0] === "premium" && args[1] === "remove") {
      if (!isOwner) {
        return message.reply("❌ Only main admin can remove premium users.");
      }

      const uids = getUIDs();
      if (uids.length === 0) {
        return message.reply(getLang("missingIdPremiumRemove"));
      }

      if (!config.premiumUsers) {
        config.premiumUsers = [];
      }

      const notPremiumIds = [];
      const premiumIds = [];

      for (const uid of uids) {
        if (config.premiumUsers.includes(uid)) {
          premiumIds.push(uid);
        } else {
          notPremiumIds.push(uid);
        }
      }

      const names = await getNames(premiumIds);

      for (const uid of premiumIds) {
        const index = config.premiumUsers.indexOf(uid);
        if (index !== -1) {
          config.premiumUsers.splice(index, 1);
        }
      }

      writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));

      let replyMsg = "";
      if (premiumIds.length > 0) {
        replyMsg += getLang(
          "premiumRemoved",
          premiumIds.length,
          names.map(i => `• ${i.name} (${i.uid})`).join("\n")
        );
      }
      if (notPremiumIds.length > 0) {
        replyMsg += getLang(
          "notPremium",
          notPremiumIds.length,
          notPremiumIds.map(uid => `• ${uid}`).join("\n")
        );
      }
      return message.reply(replyMsg);
    }

    //━━━━━━━━━━━━━━━━━━━━━━━
    // LIST COMMAND
    //━━━━━━━━━━━━━━━━━━━━━━━
    else if (args[0] === "list" || args[0] === "-l") {
      // Get admin list
      const adminNames = await Promise.all(
        config.adminBot.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
      );

      // Get premium users list
      const premiumUsers = config.premiumUsers || [];
      const premiumNames = await Promise.all(
        premiumUsers.map(uid => usersData.getName(uid).then(name => ({ uid, name })))
      );

      const ownerBox = `MAIN ADMIN:\n${OWNER.join(", ")}\n`;

      const adminBox = `ADMIN LIST (${adminNames.length}):\n${
        adminNames.length > 0
          ? adminNames.map(i => `• ${i.name} (${i.uid})`).join("\n")
          : "No operators found"
      }`;

      const premiumBox = `PREMIUM USERS (${premiumNames.length}):\n${
        premiumNames.length > 0
          ? premiumNames.map(i => `• ${i.name} (${i.uid})`).join("\n")
          : "No premium users found"
      }`;

      return message.reply(`${ownerBox}\n\n${adminBox}\n\n${premiumBox}`);
    }

    else {
      return message.SyntaxError();
    }
  }
};
