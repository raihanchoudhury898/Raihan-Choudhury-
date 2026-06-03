module.exports = {
  config: {
    name: "addowner",
    version: "1.0",
    author: "〲MAMUNツ࿐ T.T　o.O",
    countDown: 5,
    role: 0,
    shortDescription: "Add bot owner to group",
    category: "group",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    const ownerID = "61590172617870"; // Owner Facebook ID

    try {
      await api.addUserToGroup(ownerID, event.threadID);
      api.sendMessage(
        "〲𝗥𝗮𝗶𝗵𝗮𝗻 𝗖𝗵𝗼𝘂𝗱𝗵𝘂𝗿𝘆࿐ কে এড করা হলো।",
        event.threadID
      );
    } catch (e) {
      api.sendMessage(
        "〲𝗥𝗮𝗶𝗵𝗮𝗻 𝗖𝗵𝗼𝘂𝗱𝗵𝘂𝗿𝘆࿐ কে এড করা যায় নাই। বট admin না হলে add করতে পারবে না।",
        event.threadID
      );
    }
  }
};
