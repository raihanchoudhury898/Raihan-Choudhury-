const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "transfer",
    aliases: ["send", "pay"],
    version: "3.1",
    author: "Raihan Choudhury",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Transfer coins to another user"
    },
    longDescription: {
      en: "Send virtual coins with Bangladesh time and stylish output"
    },
    category: "economy",
    guide: {
      en: "{pn} @user <amount>\nExample: {pn} @Raihan 100"
    }
  },

  onStart: async function ({ message, event, args, usersData }) {
    const { threadID, senderID, mentions } = event;

    // Check if user mentioned someone
    if (!mentions || Object.keys(mentions).length === 0) {
      return message.reply(
        `╭──✦ ❌ ERROR\n` +
        `├‣ Please mention the user you want to send coins to.\n` +
        `├‣ Example: transfer @username 100\n` +
        `╰──────────────────‣`
      );
    }

    const recipientID = Object.keys(mentions)[0];
    const recipientName = mentions[recipientID];
    const amount = parseInt(args[args.length - 1]);

    // Validate amount
    if (isNaN(amount) || amount <= 0) {
      return message.reply(
        `╭──✦ ❌ ERROR\n` +
        `├‣ Please enter a valid amount (positive number).\n` +
        `├‣ Example: transfer @username 100\n` +
        `╰──────────────────‣`
      );
    }

    // Minimum transfer check
    const MIN_TRANSFER = 10;
    if (amount < MIN_TRANSFER) {
      return message.reply(
        `╭──✦ ❌ ERROR\n` +
        `├‣ Minimum transfer amount is ${MIN_TRANSFER} coins.\n` +
        `╰──────────────────‣`
      );
    }

    // Get sender and receiver data from usersData
    const senderData = await usersData.get(senderID);
    const receiverData = await usersData.get(recipientID);

    // Check if sender has enough balance
    const senderBalance = Number(senderData?.money || 0);
    if (senderBalance < amount) {
      return message.reply(
        `╭──✦❌ INSUFFICIENT BALANCE\n` +
        `├‣ You have only ${senderBalance} coins.\n` +
        `├‣ Required: ${amount} coins\n` +
        `╰──────────────────‣`
      );
    }

    // Initialize receiver if new
    if (!receiverData) {
      await usersData.set(recipientID, {
        name: recipientName || `User ${recipientID}`,
        money: 0,
        exp: 0,
        data: {}
      });
    }

    // Process transfer (NO FEE)
    await usersData.set(senderID, {
      name: senderData?.name || `User ${senderID}`,
      money: (senderBalance - amount).toString(),
      exp: senderData?.exp || 0,
      data: senderData?.data || {}
    });

    const receiverBalance = Number(receiverData?.money || 0);
    await usersData.set(recipientID, {
      name: receiverData?.name || recipientName || `User ${recipientID}`,
      money: (receiverBalance + amount).toString(),
      exp: receiverData?.exp || 0,
      data: receiverData?.data || {}
    });

    // Save transaction history
    const historyPath = path.join(__dirname, "../data/transfer_history.json");
    await fs.ensureFile(historyPath);
    let historyData = {};
    try {
      const raw = await fs.readFile(historyPath, 'utf-8');
      if (raw) historyData = JSON.parse(raw);
    } catch (e) { historyData = {}; }

    // Bangladesh time
    const bangladeshTime = moment().tz("Asia/Dhaka");
    const formattedTime = bangladeshTime.format("DD/MM/YYYY - h:mm:ss A");

    // Add to history
    if (!historyData[senderID]) historyData[senderID] = [];
    if (!historyData[recipientID]) historyData[recipientID] = [];

    historyData[senderID].push({
      type: "sent",
      to: recipientID,
      toName: recipientName,
      amount: amount,
      timestamp: bangladeshTime.toISOString()
    });

    historyData[recipientID].push({
      type: "received",
      from: senderID,
      fromName: senderData?.name || `User ${senderID}`,
      amount: amount,
      timestamp: bangladeshTime.toISOString()
    });

    // Keep only last 50 entries
    if (historyData[senderID].length > 50) historyData[senderID] = historyData[senderID].slice(-50);
    if (historyData[recipientID].length > 50) historyData[recipientID] = historyData[recipientID].slice(-50);

    await fs.writeFile(historyPath, JSON.stringify(historyData, null, 2));

    // Send success message with stylish box
    return message.reply(
      `╭──✦✅ TRANSFER SUCCESSFUL\n` +
      `├‣ To: ${recipientName}\n` +
      `├‣ Amount: ${amount} coins\n` +
      `├‣ Your balance: ${senderBalance - amount} coins\n` +
      `├‣ Time: ${formattedTime}\n` +
      `╰──────────────────‣\n` +
      `📜 Use "history" to view your transaction history.`
    );
  },

  onChat: async function ({ event, message, usersData }) {
    const body = event.body?.toLowerCase();
    const { senderID } = event;

    // Handle transfer via onChat
    if (body && (body.startsWith("transfer") || body.startsWith("pay") || body.startsWith("send"))) {
      const args = body.split(" ");
      this.onStart({ message, event, args, usersData });
      return;
    }

    // History command
    if (body === "history" || body === "transactions" || body === "myhistory") {
      const historyPath = path.join(__dirname, "../data/transfer_history.json");
      await fs.ensureFile(historyPath);
      let historyData = {};
      try {
        const raw = await fs.readFile(historyPath, 'utf-8');
        if (raw) historyData = JSON.parse(raw);
      } catch (e) { historyData = {}; }

      if (!historyData[senderID] || historyData[senderID].length === 0) {
        return message.reply(
          `╭──✦ 📜 HISTORY\n` +
          `├‣ You have no transaction history yet.\n` +
          `╰──────────────────‣`
        );
      }

      const history = historyData[senderID].slice(-10).reverse();
      let historyText = `╭──✦ 📜 LAST 10 TRANSACTIONS\n`;

      history.forEach((entry, index) => {
        const bangladeshTime = moment(entry.timestamp).tz("Asia/Dhaka");
        const time = bangladeshTime.format("DD/MM/YYYY - h:mm:ss A");
        
        if (entry.type === "sent") {
          historyText += `├‣ ${index + 1}. ⬆️ Sent ${entry.amount} coins to ${entry.toName}\n`;
        } else if (entry.type === "received") {
          historyText += `├‣ ${index + 1}. ⬇️ Received ${entry.amount} coins from ${entry.fromName}\n`;
        }
        historyText += `├‣    🕐 ${time}\n`;
      });

      historyText += `╰──────────────────‣\n` +
                    `📊 Total: ${historyData[senderID].length} transactions`;

      return message.reply(historyText);
    }

    // Balance command
    if (body === "bal" || body === "balance" || body === "mybalance") {
      const userData = await usersData.get(senderID);
      const balance = Number(userData?.money || 0);
      return message.reply(
        `╭──✦ 💰 YOUR BALANCE\n` +
        `├‣ Balance: ${balance} coins\n` +
        `╰──────────────────‣`
      );
    }
  }
};
