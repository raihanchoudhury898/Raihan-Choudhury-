module.exports = {
  config: {
    name: "mcq",
    aliases: ["cq"],
    version: "4.0",
    author: "Raihan Choudhury",
    countDown: 0,
    role: 0,
    category: "game",
    guide: "{p}mcq - Play MCQ quiz\n{p}mcq stats - View your stats"
  },

  onStart: async function ({ api, event, usersData, args }) {
    const timeout = 120;

    // Handle stats command
    if (args[0] && args[0].toLowerCase() === "stats") {
      const userData = await usersData.get(event.senderID);
      const stats = userData.data?.mcqStats || {
        totalPlayed: 0,
        totalCorrect: 0,
        totalWrong: 0,
        totalEarned: 0,
        lastPlayed: null
      };

      const currentStreak = userData.data?.currentStreak || 0;
      const level = userData.data?.level || 1;

      const statsMsg = `╭──✦ MCQ STATS
├‣ Games: ${stats.totalPlayed}
├‣ Correct: ${stats.totalCorrect}
├‣ Wrong: ${stats.totalWrong}
├‣ Accuracy: ${stats.totalPlayed > 0 ? Math.round((stats.totalCorrect / stats.totalPlayed) * 100) : 0}%
├‣ Level: ${level}
├‣ Streak: ${currentStreak}/5
├‣ Earned: ${stats.totalEarned} coins
${stats.lastPlayed ? `├‣ Last: ${new Date(stats.lastPlayed).toLocaleString()}` : ''}
╰──────────────────‣`;

      return api.sendMessage(statsMsg, event.threadID, event.messageID);
    }

    // Main quiz logic
    const questionBank = [
      {
        question: "What is the capital of Bangladesh?",
        correctAnswer: "a",
        options: { a: "Dhaka", b: "Chittagong", c: "Rajshahi", d: "Khulna" }
      },
      {
        question: "When is the Bengali New Year celebrated?",
        correctAnswer: "b",
        options: { a: "1 January", b: "14 April", c: "21 February", d: "16 December" }
      },
      {
        question: "বাংলাদেশের স্বাধীনতা ঘোষণা কত তারিখে হয়েছিল?",
        correctAnswer: "b",
        options: { a: "১৬ ডিসেম্বর ১৯৭১", b: "২৬ মার্চ ১৯৭১", c: "৭ মার্চ ১৯৭১", d: "৪ নভেম্বর ১৯৭২" }
      },
      {
        question: "What is the past tense of 'run'?",
        correctAnswer: "a",
        options: { a: "Ran", b: "Runned", c: "Run", d: "Running" }
      },
      {
        question: "বাংলা ভাষায় মাত্রাহীন বর্ণ কয়টি?",
        correctAnswer: "b",
        options: { a: "৮টি", b: "১০টি", c: "১২টি", d: "৬টি" }
      },
      {
        question: "What is the largest planet in our solar system?",
        correctAnswer: "c",
        options: { a: "Earth", b: "Mars", c: "Jupiter", d: "Saturn" }
      },
      {
        question: "Which country is known as the Land of the Rising Sun?",
        correctAnswer: "b",
        options: { a: "China", b: "Japan", c: "South Korea", d: "Thailand" }
      },
      {
        question: "What is the chemical symbol for water?",
        correctAnswer: "a",
        options: { a: "H2O", b: "CO2", c: "NaCl", d: "HCl" }
      },
      {
        question: "Who wrote 'Hamlet'?",
        correctAnswer: "b",
        options: { a: "Charles Dickens", b: "William Shakespeare", c: "Mark Twain", d: "Jane Austen" }
      }
    ];

    const randomIndex = Math.floor(Math.random() * questionBank.length);
    const quizData = questionBank[randomIndex];
    const { question, correctAnswer, options } = quizData;
    const { a, b, c, d } = options;

    const quizMsg = {
      body: `╭──✦ ${question}\n├‣ 𝗔) ${a}\n├‣ 𝗕) ${b}\n├‣ 𝗖) ${c}\n├‣ 𝗗) ${d}\n╰──────────────────‣\nReply with A, B, C, or D.`
    };

    const startTime = Date.now();

    api.sendMessage(
      quizMsg,
      event.threadID,
      (error, info) => {
        if (error) return;

        global.GoatBot.onReply.set(info.messageID, {
          type: "reply",
          commandName: this.config.name,
          author: event.senderID,
          messageID: info.messageID,
          correctAnswer: correctAnswer,
          startTime: startTime,
          attempts: 0,
          gameOver: false,
          answered: false // Add this flag to track if user already answered correctly
        });

        setTimeout(async () => {
          try {
            const replyData = global.GoatBot.onReply.get(info.messageID);
            if (replyData && !replyData.answered) {
              await api.unsendMessage(info.messageID);
              delete global.GoatBot.onReply[info.messageID];
            }
          } catch (err) {}
        }, timeout * 1000);
      },
      event.messageID
    );
  },

  onReply: async ({ event, api, Reply, usersData }) => {
    const { correctAnswer, author, startTime, messageID, attempts, gameOver, answered } = Reply;

    if (event.senderID !== author) {
      return api.sendMessage(
        `╭──✦ ACCESS DENIED\n├‣ This quiz is not for you.\n╰──────────────────‣`,
        event.threadID,
        event.messageID
      );
    }

    const maxAttempts = 2;
    let userReply = event.body.trim().toLowerCase();

    if (!["a", "b", "c", "d"].includes(userReply)) {
      return api.sendMessage(
        `╭──✦ INVALID REPLY\n├‣ Please reply with A, B, C, or D only.\n╰──────────────────‣`,
        event.threadID,
        event.messageID
      );
    }

    // ===== REWARD FUNCTIONS =====
    function getBaseReward(time) {
      if (time <= 2) return 1000;
      if (time <= 4) return 800;
      if (time <= 6) return 650;
      if (time <= 8) return 500;
      if (time <= 10) return 400;
      if (time <= 15) return 300;
      if (time <= 20) return 200;
      return 100;
    }

    function getSpeedBonus(time) {
      const bonus = Math.max(0, 500 - (time * 25));
      return Math.floor(bonus / 5) * 5;
    }

    function getStreakBonus(streak) {
      if (streak >= 50) return 20000;
      if (streak >= 40) return 14000;
      if (streak >= 30) return 9000;
      if (streak >= 25) return 6500;
      if (streak >= 20) return 4500;
      if (streak >= 15) return 3000;
      if (streak >= 10) return 2000;
      if (streak >= 5) return 2000;
      return 0;
    }

    function getRandomAdmin() {
      const adminIds = global.GoatBot.config.adminBot || [];
      if (adminIds.length === 0) return null;
      const randomIndex = Math.floor(Math.random() * adminIds.length);
      return adminIds[randomIndex];
    }

    // ===== CHECK IF GAME IS ALREADY OVER =====
    if (Reply.gameOver) {
      const userData = await usersData.get(author);

      const maxBaseCoins = 1000;
      const maxSpeedBonus = 475;
      const currentStreak = userData.data?.currentStreak || 0;
      const maxStreakBonus = getStreakBonus(currentStreak);
      const totalLostCoins = maxBaseCoins + maxSpeedBonus + maxStreakBonus;

      const randomAdmin = getRandomAdmin();

      if (randomAdmin) {
        const adminData = await usersData.get(randomAdmin);
        await usersData.set(randomAdmin, {
          money: (adminData.money || 0) + totalLostCoins
        });

        let adminName = "Admin";
        try {
          const adminInfo = await api.getUserInfo(randomAdmin);
          adminName = adminInfo[randomAdmin]?.name || "Admin";
        } catch (e) {}

        const adminMsg = `╭──✦ REWARD TRANSFERRED
├‣ ${totalLostCoins} coins sent to:
├‣ ${adminName}
├‣ ID: ${randomAdmin}
├‣ Correct Answer: ${correctAnswer.toUpperCase()}
╰──────────────────‣`;

        api.sendMessage(adminMsg, event.threadID, event.messageID);
      }

      delete global.GoatBot.onReply[Reply.messageID];
      return;
    }

    // ===== CHECK IF USER ALREADY ANSWERED CORRECTLY =====
    if (Reply.answered) {
      return api.sendMessage(
        `╭──✦ ALREADY ANSWERED\n├‣ You've already answered this question correctly!\n╰──────────────────‣`,
        event.threadID,
        event.messageID
      );
    }

    switch (Reply.type) {
      case "reply": {
        // Get current attempts from Reply object
        let currentAttempts = Reply.attempts || 0;
        
        const userData = await usersData.get(author);
        const timeTaken = (Date.now() - startTime) / 1000;

        // Initialize data if not exists
        if (!userData.data) userData.data = {};
        if (!userData.data.mcqStats) {
          userData.data.mcqStats = {
            totalPlayed: 0,
            totalCorrect: 0,
            totalWrong: 0,
            totalEarned: 0
          };
        }
        if (!userData.data.currentStreak) userData.data.currentStreak = 0;
        if (!userData.data.level) userData.data.level = 1;

        const stats = userData.data.mcqStats;

        if (userReply === correctAnswer) {
          // User answered correctly
          Reply.answered = true; // Mark as answered
          global.GoatBot.onReply.set(Reply.messageID, Reply);
          
          await api.unsendMessage(Reply.messageID).catch(console.error);

          userData.data.currentStreak += 1;
          const currentStreak = userData.data.currentStreak;

          let leveledUp = false;
          let levelUpMessage = "";
          
          if (currentStreak >= 5) {
            userData.data.level += 1;
            userData.data.currentStreak = 0;
            leveledUp = true;
            levelUpMessage = `\n├‣ LEVEL UP! You are now Level ${userData.data.level}`;
          }

          const baseCoins = getBaseReward(timeTaken);
          const speedBonus = getSpeedBonus(timeTaken);
          const streakBonus = getStreakBonus(currentStreak);
          const totalCoins = baseCoins + speedBonus + streakBonus;

          stats.totalPlayed += 1;
          stats.totalCorrect += 1;
          stats.totalEarned += totalCoins;
          stats.lastPlayed = Date.now();

          await usersData.set(author, {
            money: (userData.money || 0) + totalCoins,
            data: userData.data
          });

          let correctMsg = `╭──✦ CORRECT!\n`;
          correctMsg += `├‣ Answer: ${userReply.toUpperCase()}\n`;
          correctMsg += `├‣ Time: ${Math.round(timeTaken)}s\n`;
          correctMsg += `├‣ Base: +${baseCoins} coins\n`;
          correctMsg += `├‣ Speed: +${speedBonus} coins\n`;
          correctMsg += `├‣ Streak: ${currentStreak}/5`;
          
          if (currentStreak >= 5) {
            correctMsg += ` COMPLETED!`;
          }
          
          correctMsg += `\n├‣ Streak Bonus: +${streakBonus} coins\n`;
          correctMsg += `├‣ Total: +${totalCoins} coins\n`;
          correctMsg += `├‣ Level: ${userData.data.level}`;
          
          if (levelUpMessage) {
            correctMsg += levelUpMessage;
          }
          
          correctMsg += `\n╰──────────────────‣`;

          api.sendMessage(correctMsg, event.threadID, event.messageID);
          delete global.GoatBot.onReply[Reply.messageID];

        } else {
          // ===== WRONG ANSWER =====
          currentAttempts += 1;
          Reply.attempts = currentAttempts;
          
          // Check if this is the second wrong attempt (game over)
          if (currentAttempts >= maxAttempts) {
            Reply.gameOver = true;
            global.GoatBot.onReply.set(Reply.messageID, Reply);

            userData.data.currentStreak = 0;
            
            stats.totalPlayed += 1;
            stats.totalWrong += 1;
            stats.lastPlayed = Date.now();

            await usersData.set(author, {
              ...userData,
              data: userData.data
            });

            const lastWrongMessages = [
              `╭──✦ WRONG ANSWER\n├‣ Option ${userReply.toUpperCase()} is incorrect.\n├‣ Streak Reset! (0/5)\n├‣ Attempt: 2/2\n├‣ Get 5 correct in a row to level up!\n╰──────────────────‣`,
              `╭──✦ OOPS!\n├‣ ${userReply.toUpperCase()} is not correct.\n├‣ Streak Reset! (0/5)\n├‣ Attempt: 2/2\n├‣ Target: 5 consecutive correct answers\n╰──────────────────‣`,
              `╭──✦ NOT QUITE!\n├‣ ${userReply.toUpperCase()} is incorrect.\n├‣ Streak broken! (0/5)\n├‣ Attempt: 2/2\n├‣ Need 5 correct in a row for level up\n╰──────────────────‣`
            ];

            const randomMsg = lastWrongMessages[Math.floor(Math.random() * lastWrongMessages.length)];
            await api.sendMessage(randomMsg, event.threadID, event.messageID);
            
            // Game over, delete the reply handler
            delete global.GoatBot.onReply[Reply.messageID];
            return;
          }

          // First wrong attempt - update and save
          global.GoatBot.onReply.set(Reply.messageID, Reply);

          userData.data.currentStreak = 0;
          
          stats.totalPlayed += 1;
          stats.totalWrong += 1;
          stats.lastPlayed = Date.now();

          await usersData.set(author, {
            ...userData,
            data: userData.data
          });

          const wrongMessages = [
            `╭──✦ WRONG ANSWER\n├‣ Option ${userReply.toUpperCase()} is incorrect.\n├‣ Streak Reset! (0/5)\n├‣ Attempt: 1/2\n├‣ Get 5 correct in a row to level up!\n╰──────────────────‣`,
            `╭──✦ OOPS!\n├‣ ${userReply.toUpperCase()} is not correct.\n├‣ Streak Reset! (0/5)\n├‣ Attempt: 1/2\n├‣ Target: 5 consecutive correct answers\n╰──────────────────‣`,
            `╭──✦ NOT QUITE!\n├‣ ${userReply.toUpperCase()} is incorrect.\n├‣ Streak broken! (0/5)\n├‣ Attempt: 1/2\n├‣ Need 5 correct in a row for level up\n╰──────────────────‣`
          ];

          const randomMsg = wrongMessages[Math.floor(Math.random() * wrongMessages.length)];
          api.sendMessage(randomMsg, event.threadID, event.messageID);
        }
        break;
      }
      default:
        break;
    }
  }
};
