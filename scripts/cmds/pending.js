const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "pending",
    version: "2.3",
    author: "𝗥𝗮𝗶𝗵𝗮𝗻 𝗖𝗵𝗼𝘂𝗱𝗵𝘂𝗿𝘆",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Manage pending group requests"
    },
    longDescription: {
      en: "Approve or refuse groups waiting for bot permission"
    },
    category: "owner"
  },

  langs: {
    en: {
      invalid:
`INVALID SELECTION : %1

Please select a valid group number from the pending list.`,

      refused:
`╭─────────────────╮
│  REQUEST REJECTED
├─────────────────┤
│ Groups Rejected : %1
│ Time            : %2
╰─────────────────╯`,

      approved:
`╭─────────────────╮
│  REQUEST APPROVED
├─────────────────┤
│ Groups Approved : %1
│ Time            : %2
╰─────────────────╯`,

      fetchFail:
`╭─────────────────╮
│     SYSTEM ERROR
├─────────────────┤
│ Unable to retrieve pending
│ group requests.
╰─────────────────╯`,

      list:
`╭─────────────────╮
│  PENDING REQUESTS
├─────────────────┤
│ Total Groups : %1
╰─────────────────╯

%2

╭─────────────────╮
│ Reply with number(s)
│ Example : 1
│ Multiple: 1 2 3
│ Cancel  : c 1
╰─────────────────╯`,

      empty:
`╭─────────────────╮
│    SYSTEM STATUS
├─────────────────┤
│ No pending group requests
│ were found.
╰─────────────────╯`
    }
  },

  onReply: async ({ api, event, Reply, getLang }) => {
    if (event.senderID != Reply.author)
      return;

    const input = event.body.trim();
    const { threadID, messageID } = event;
    const prefix = global.GoatBot?.config?.prefix || "-";
    const botNickname = "✺ 𝚁𝙰𝙸𝙷𝙰𝙽'𝚂 𝙶𝙾𝙰𝚃 𝙱𝙾𝚃 𖣘";
    let done = 0;

    const dateTime = moment()
      .tz("Asia/Dhaka")
      .format("ddd, YYYY-MMM-DD, HH:mm:ss");
    if (/^(c|cancel)/i.test(input)) {
      const nums = input
        .replace(/^(c|cancel)/i, "")
        .trim()
        .split(/\s+/);

      for (const n of nums) {
        if (!Number(n) || n < 1 || n > Reply.queue.length)
          return api.sendMessage(
            getLang("invalid", n),
            threadID,
            messageID
          );

        const targetThreadID =
          Reply.queue[n - 1].threadID;

        api.sendMessage(
`╭─────────────────╮
│    ACCESS DENIED
├─────────────────┤
│ Status : Rejected
│ Owner  : Raihan Choudhury
│ Time   : ${dateTime}
├─────────────────┤
│ Your request was not
│ approved at this time.
│
│ Contact the bot owner
│ for further information.
╰─────────────────╯`,
          targetThreadID
        );

        await api.removeUserFromGroup(
          api.getCurrentUserID(),
          targetThreadID
        );

        done++;
      }

      return api.sendMessage(
        getLang("refused", done, dateTime),
        threadID,
        messageID
      );
    }

    const nums = input.split(/\s+/);

    for (const n of nums) {
      if (!Number(n) || n < 1 || n > Reply.queue.length)
        return api.sendMessage(
          getLang("invalid", n),
          threadID,
          messageID
        );

      const targetThreadID =
        Reply.queue[n - 1].threadID;

      const botID = api.getCurrentUserID();

      api.sendMessage(
`╭─────────────────╮
│   ACCESS GRANTED
├─────────────────┤
│ Status : Approved
│ Prefix : ${prefix}
│ Owner  : Raihan Choudhury
│ Time   : ${dateTime}
├─────────────────┤
│ Bot has been activated
│ successfully in this group.
│
│ Type ${prefix}help to view
│ all available commands.
╰─────────────────╯`,
        targetThreadID
      );

      try {
        await api.changeNickname(
          botNickname,
          targetThreadID,
          botID
        );
      }
      catch (e) {
        console.log(
          `Nickname set error for ${targetThreadID}:`,
          e
        );
      }

      done++;
    }

    return api.sendMessage(
      getLang("approved", done, dateTime),
      threadID,
      messageID
    );
  },

  onStart: async ({
    api,
    event,
    getLang,
    commandName
  }) => {

    const {
      threadID,
      messageID,
      senderID
    } = event;

    let text = "";
    let i = 1;

    try {
      const other =
        await api.getThreadList(
          100,
          null,
          ["OTHER"]
        ) || [];

      const pending =
        await api.getThreadList(
          100,
          null,
          ["PENDING"]
        ) || [];

      const groups = [...other, ...pending]
        .filter(
          t => t.isGroup && t.isSubscribed
        );

      if (!groups.length)
        return api.sendMessage(
          getLang("empty"),
          threadID,
          messageID
        );

      for (const g of groups) {
        text +=
`[ ${i++} ]
Name : ${g.name || "Unnamed Group"}
TID  : ${g.threadID}

`;
      }

      api.sendMessage(
        getLang(
          "list",
          groups.length,
          text
        ),
        threadID,
        (err, info) => {

          global.GoatBot.onReply.set(
            info.messageID,
            {
              commandName,
              author: senderID,
              queue: groups
            }
          );

        },
        messageID
      );

    }
    catch (err) {
      return api.sendMessage(
        getLang("fetchFail"),
        threadID,
        messageID
      );
    }
  }
};
