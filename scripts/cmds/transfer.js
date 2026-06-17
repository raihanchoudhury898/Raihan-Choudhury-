const fs = require("fs-extra");
const path = require("path");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "transfer",
    aliases: ["send", "pay"],
    version: "3.6",
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
      en: "{pn} @user <amount>\n{pn} <uid> <amount>\n{pn} reply to message <amount>\nExample: {pn} @Raihan 100\n{pn} 1234567890 50\nReply to a message: {pn} 200"
    }
  },

  onStart: async function ({ message, event, args, usersData }) {
    const { threadID, senderID, mentions, messageReply } = event;

    //━━━━━━━━━━━━━━━━━━━━━━━
    // ✅ ADMIN & PREMIUM CHECK
    //━━━━━━━━━━━━━━━━━━━━━━━
    const adminUIDs = global.GoatBot?.config?.adminBot || global.config?.adminBot || [];
    const premiumUIDs = global.GoatBot?.config?.premiumUsers || global.config?.premiumUsers || [];
    const isAdmin = adminUIDs.includes(senderID);
    const isPremium = premiumUIDs.includes(senderID);

    //━━━━━━━━━━━━━━━━━━━━━━━
    // GET RECIPIENT ID
    //━━━━━━━━━━━━━━━━━━━━━━━
    let recipientID = null;
    let recipientName = null;

    if (mentions && Object.keys(mentions).length > 0) {
      recipientID = Object.keys(mentions)[0];
      recipientName = mentions[recipientID];
    } else if (messageReply) {
      recipientID = messageReply.senderID;
      const userData = await usersData.get(recipientID);
      recipientName = userData?.name || `User ${recipientID}`;
    } else if (args[0] && !isNaN(args[0])) {
      recipientID = args[0];
      const userData = await usersData.get(recipientID);
      recipientName = userData?.name || `User ${recipientID}`;
    }

    if (!recipientID) {
      return message.reply(
        `╭──✦ ❌ ERROR\n` +
        `├‣ Please mention a user, reply to a message, or provide a UID.\n` +
        `├‣ Example: transfer @user 100\n` +
        `├‣ Example: transfer 1234567890 50\n` +
        `├‣ Reply to a message: transfer 200\n` +
        `╰──────────────────‣`
      );
    }

    //━━━━━━━━━━━━━━━━━━━━━━━
    // GET AMOUNT
    //━━━━━━━━━━━━━━━━━━━━━━━
    let amount = 0;
    const lastArg = args[args.length - 1];
    amount = parseInt(lastArg);

    if (isNaN(amount) || amount <= 0) {
      return message.reply(
        `╭──✦ ❌ ERROR\n` +
        `├‣ Please enter a valid amount (positive number).\n` +
        `├‣ Example: transfer @user 100\n` +
        `╰──────────────────‣`
      );
    }

    //━━━━━━━━━━━━━━━━━━━━━━━
    // CHECK SELF TRANSFER
    //━━━━━━━━━━━━━━━━━━━━━━━
    if (recipientID === senderID) {
      return message.reply(
        `╭──✦ ❌ ERROR\n` +
        `├‣ You cannot transfer coins to yourself.\n` +
        `╰──────────────────‣`
      );
    }

    //━━━━━━━━━━━━━━━━━━━━━━━
    // GET USER DATA
    //━━━━━━━━━━━━━━━━━━━━━━━
    const senderData = await usersData.get(senderID);
    const receiverData = await usersData.get(recipientID);
    const senderBalance = Number(senderData?.money || 0);

    //━━━━━━━━━━━━━━━━━━━━━━━
    // 🆕 PREMIUM FREE TRANSFER WITH COOLDOWN
    //━━━━━━━━━━━━━━━━━━━━━━━
    const PREMIUM_FREE_LIMIT = 1000;
    const COOLDOWN_HOURS = 12;
    const COOLDOWN_MS = COOLDOWN_HOURS * 60 * 60 * 1000;

    let isFreeTransfer = false;
    let finalAmount = amount;
    let deductionAmount = 0;
    let cooldownRemaining = 0;

    // Check premium cooldown
    if (isPremium && amount <= PREMIUM_FREE_LIMIT) {
      // Check if user has cooldown data
      const cooldownPath = path.join(__dirname, "../data/premium_cooldown.json");
      await fs.ensureFile(cooldownPath);
      let cooldownData = {};
      try {
        const raw = await fs.readFile(cooldownPath, 'utf-8');
        if (raw) cooldownData = JSON.parse(raw);
      } catch (e) { cooldownData = {}; }

      const lastFreeTransfer = cooldownData[senderID] || 0;
      const timeSinceLast = Date.now() - lastFreeTransfer;

      if (timeSinceLast < COOLDOWN_MS) {
        // Cooldown active - cannot use free transfer
        cooldownRemaining = COOLDOWN_MS - timeSinceLast;
        const hoursLeft = Math.floor(cooldownRemaining / (60 * 60 * 1000));
        const minutesLeft = Math.floor((cooldownRemaining % (60 * 60 * 1000)) / (60 * 1000));
        
        return message.reply(
          `╭──✦ ⏳ COOLDOWN ACTIVE\n` +
          `├‣ You have already used your free transfer.\n` +
          `├‣ Please wait ${hoursLeft}h ${minutesLeft}m before using free transfer again.\n` +
          `├‣ You can still transfer using your balance.\n` +
          `╰──────────────────‣`
        );
      }

      // Free transfer available
      isFreeTransfer = true;
      finalAmount = amount;
      deductionAmount = 0;
      
      // Update cooldown
      cooldownData[senderID] = Date.now();
      await fs.writeFile(cooldownPath, JSON.stringify(cooldownData, null, 2));
    }
    // Premium user wants to transfer more than free limit
    else if (isPremium && amount > PREMIUM_FREE_LIMIT) {
      // Check if they have free cooldown available
      const cooldownPath = path.join(__dirname, "../data/premium_cooldown.json");
      await fs.ensureFile(cooldownPath);
      let cooldownData = {};
      try {
        const raw = await fs.readFile(cooldownPath, 'utf-8');
        if (raw) cooldownData = JSON.parse(raw);
      } catch (e) { cooldownData = {}; }

      const lastFreeTransfer = cooldownData[senderID] || 0;
      const timeSinceLast = Date.now() - lastFreeTransfer;
      const isCooldownExpired = timeSinceLast >= COOLDOWN_MS;

      if (isCooldownExpired) {
        // First 1000 free, rest from balance
        isFreeTransfer = true;
        finalAmount = amount;
        deductionAmount = amount - PREMIUM_FREE_LIMIT;
        
        // Update cooldown
        cooldownData[senderID] = Date.now();
        await fs.writeFile(cooldownPath, JSON.stringify(cooldownData, null, 2));
        
        if (!isAdmin && senderBalance < deductionAmount) {
          return message.reply(
            `╭──✦ ❌ INSUFFICIENT BALANCE\n` +
            `├‣ You have only ${senderBalance} coins.\n` +
            `├‣ Required for extra amount: ${deductionAmount} coins\n` +
            `├‣ (First ${PREMIUM_FREE_LIMIT} coins are free for premium users)\n` +
            `╰──────────────────‣`
          );
        }
      } else {
        // No free transfer available - full amount from balance
        isFreeTransfer = false;
        finalAmount = amount;
        deductionAmount = amount;
        
        if (!isAdmin && senderBalance < amount) {
          return message.reply(
            `╭──✦ ❌ INSUFFICIENT BALANCE\n` +
            `├‣ You have only ${senderBalance} coins.\n` +
            `├‣ Required: ${amount} coins\n` +
            `├‣ Free transfer cooldown active. Please wait.\n` +
            `╰──────────────────‣`
          );
        }
      }
    }
    // Normal user or premium user without cooldown
    else {
      // Normal user: full amount from balance
      if (!isAdmin && senderBalance < amount) {
        return message.reply(
          `╭──✦ ❌ INSUFFICIENT BALANCE\n` +
          `├‣ You have only ${senderBalance} coins.\n` +
          `├‣ Required: ${amount} coins\n` +
          `╰──────────────────‣`
        );
      }
    }

    //━━━━━━━━━━━━━━━━━━━━━━━
    // MINIMUM TRANSFER CHECK (EXCEPT ADMIN)
    //━━━━━━━━━━━━━━━━━━━━━━━
    const MIN_TRANSFER = 10;
    if (!isAdmin && amount < MIN_TRANSFER) {
      return message.reply(
        `╭──✦ ❌ ERROR\n` +
        `├‣ Minimum transfer amount is ${MIN_TRANSFER} coins.\n` +
        `╰──────────────────‣`
      );
    }

    //━━━━━━━━━━━━━━━━━━━━━━━
    // INIT RECEIVER IF NEW
    //━━━━━━━━━━━━━━━━━━━━━━━
    if (!receiverData) {
      await usersData.set(recipientID, {
        name: recipientName || `User ${recipientID}`,
        money: 0,
        exp: 0,
        data: {}
      });
    }

    //━━━━━━━━━━━━━━━━━━━━━━━
    // PROCESS TRANSFER
    //━━━━━━━━━━━━━━━━━━━━━━━
    let balanceAfterDeduction = senderBalance;

    if (isAdmin) {
      // Admin: no deduction
      balanceAfterDeduction = senderBalance;
    } else if (isPremium && isFreeTransfer) {
      // Premium: deduct only the extra amount beyond free limit
      if (deductionAmount > 0) {
        balanceAfterDeduction = senderBalance - deductionAmount;
        await usersData.set(senderID, {
          name: senderData?.name || `User ${senderID}`,
          money: balanceAfterDeduction.toString(),
          exp: senderData?.exp || 0,
          data: senderData?.data || {}
        });
      }
      // else: no deduction (free transfer within limit)
    } else if (isPremium && !isFreeTransfer) {
      // Premium user without free transfer: full deduction
      balanceAfterDeduction = senderBalance - amount;
      await usersData.set(senderID, {
        name: senderData?.name || `User ${senderID}`,
        money: balanceAfterDeduction.toString(),
        exp: senderData?.exp || 0,
        data: senderData?.data || {}
      });
    } else {
      // Normal user: full deduction
      balanceAfterDeduction = senderBalance - amount;
      await usersData.set(senderID, {
        name: senderData?.name || `User ${senderID}`,
        money: balanceAfterDeduction.toString(),
        exp: senderData?.exp || 0,
        data: senderData?.data || {}
      });
    }

    // Add coins to receiver
    const receiverBalance = Number(receiverData?.money || 0);
    await usersData.set(recipientID, {
      name: receiverData?.name || recipientName || `User ${recipientID}`,
      money: (receiverBalance + finalAmount).toString(),
      exp: receiverData?.exp || 0,
      data: receiverData?.data || {}
    });

    //━━━━━━━━━━━━━━━━━━━━━━━
    // SAVE HISTORY
    //━━━━━━━━━━━━━━━━━━━━━━━
    const historyPath = path.join(__dirname, "../data/transfer_history.json");
    await fs.ensureFile(historyPath);
    let historyData = {};
    try {
      const raw = await fs.readFile(historyPath, 'utf-8');
      if (raw) historyData = JSON.parse(raw);
    } catch (e) { historyData = {}; }

    const bangladeshTime = moment().tz("Asia/Dhaka");
    const formattedTime = bangladeshTime.format("DD/MM/YYYY - h:mm:ss A");

    if (!historyData[senderID]) historyData[senderID] = [];
    if (!historyData[recipientID]) historyData[recipientID] = [];

    const transferType = isAdmin ? "admin" : (isPremium ? "premium" : "normal");

    historyData[senderID].push({
      type: "sent",
      to: recipientID,
      toName: recipientName || `User ${recipientID}`,
      amount: finalAmount,
      isAdmin: isAdmin,
      isPremium: isPremium,
      isFreeTransfer: isFreeTransfer,
      deduction: deductionAmount,
      transferType: transferType,
      cooldownUsed: isPremium && isFreeTransfer,
      timestamp: bangladeshTime.toISOString()
    });

    historyData[recipientID].push({
      type: "received",
      from: senderID,
      fromName: senderData?.name || `User ${senderID}`,
      amount: finalAmount,
      isAdmin: isAdmin,
      isPremium: isPremium,
      transferType: transferType,
      timestamp: bangladeshTime.toISOString()
    });

    if (historyData[senderID].length > 50) historyData[senderID] = historyData[senderID].slice(-50);
    if (historyData[recipientID].length > 50) historyData[recipientID] = historyData[recipientID].slice(-50);

    await fs.writeFile(historyPath, JSON.stringify(historyData, null, 2));

    //━━━━━━━━━━━━━━━━━━━━━━━
    // SEND RESPONSE
    //━━━━━━━━━━━━━━━━━━━━━━━
    let balanceMsg = `├‣ Your balance: ${balanceAfterDeduction} coins`;
    
    if (isAdmin) {
      balanceMsg = `├‣ Admin: Unlimited (no deduction)`;
    } else if (isPremium && isFreeTransfer) {
      if (deductionAmount > 0) {
        balanceMsg = `├‣ Premium: ${PREMIUM_FREE_LIMIT} free + ${deductionAmount} from balance\n` +
                     `├‣ Your balance: ${balanceAfterDeduction} coins`;
      } else {
        balanceMsg = `├‣ Premium: Free transfer (${amount} coins)\n` +
                     `├‣ Your balance: ${senderBalance} coins (unchanged)\n` +
                     `├‣ Next free transfer available after ${COOLDOWN_HOURS} hours`;
      }
    }

    let transferInfo = `├‣ Amount: ${finalAmount} coins`;
    if (isPremium && isFreeTransfer && deductionAmount > 0) {
      transferInfo = `├‣ Amount: ${finalAmount} coins (${PREMIUM_FREE_LIMIT} free + ${deductionAmount} from balance)`;
    } else if (isPremium && isFreeTransfer && deductionAmount === 0) {
      transferInfo = `├‣ Amount: ${finalAmount} coins (FREE for premium - ${COOLDOWN_HOURS}h cooldown)`;
    }

    return message.reply(
      `╭──✦ ✅ TRANSFER SUCCESSFUL\n` +
      `├‣ To: ${recipientName || `User ${recipientID}`}\n` +
      `${transferInfo}\n` +
      `${balanceMsg}\n` +
      `├‣ Time: ${formattedTime}\n` +
      `╰──────────────────‣\n` +
      `📜 Use "history" to view your transaction history.`
    );
  },

  onChat: async function ({ event, message, usersData }) {
    const body = event.body?.toLowerCase();
    const { senderID } = event;

    if (body && (body.startsWith("transfer") || body.startsWith("pay") || body.startsWith("send"))) {
      const args = body.split(" ");
      this.onStart({ message, event, args, usersData });
      return;
    }

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
        
        let tag = "";
        if (entry.isAdmin) tag = " 👑";
        else if (entry.isPremium && entry.isFreeTransfer && entry.deduction === 0) tag = " ⭐ FREE";
        else if (entry.isPremium) tag = " ⭐";
        
        if (entry.type === "sent") {
          historyText += `├‣ ${index + 1}. ⬆️ Sent ${entry.amount} coins to ${entry.toName}${tag}\n`;
        } else if (entry.type === "received") {
          historyText += `├‣ ${index + 1}. ⬇️ Received ${entry.amount} coins from ${entry.fromName}${tag}\n`;
        }
        historyText += `├‣    🕐 ${time}\n`;
      });

      historyText += `╰──────────────────‣\n` +
                    `📊 Total: ${historyData[senderID].length} transactions`;

      return message.reply(historyText);
    }

    if (body === "coin" || body === "balance" || body === "mybalance" || body === "bal") {
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
