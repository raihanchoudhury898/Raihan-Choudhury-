const fs = require("fs-extra");
const path = require("path");
const { createCanvas } = require("canvas");

/**
 * Creates a visual representation of the Tic-Tac-Toe board with clear styling
 * - Dark background for contrast
 * - Cyan grid lines
 * - Green X and pink O with bold typography
 * - Numbered empty cells for easy reference
 */
function makeBoard(board) {
  const canvas = createCanvas(600, 600);
  const ctx = canvas.getContext("2d");

  // Background
  ctx.fillStyle = "#101827";
  ctx.fillRect(0, 0, 600, 600);

  // Grid lines
  ctx.strokeStyle = "#00ffff";
  ctx.lineWidth = 6;

  for (let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(i * 200, 0);
    ctx.lineTo(i * 200, 600);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * 200);
    ctx.lineTo(600, i * 200);
    ctx.stroke();
  }

  // Text styling
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Draw symbols or numbers
  for (let i = 0; i < 9; i++) {
    const x = (i % 3) * 200 + 100;
    const y = Math.floor(i / 3) * 200 + 100;

    if (board[i] == "X") {
      ctx.fillStyle = "#00ff88";
      ctx.font = "bold 100px Arial";
      ctx.fillText("X", x, y);
    } else if (board[i] == "O") {
      ctx.fillStyle = "#ff0066";
      ctx.font = "bold 100px Arial";
      ctx.fillText("O", x, y);
    } else {
      ctx.fillStyle = "white";
      ctx.font = "40px Arial";
      ctx.fillText(i + 1, x, y);
    }
  }

  return canvas.toBuffer();
}

/**
 * Checks win conditions for the current board state
 * Returns: 'X', 'O', 'draw', or null (game continues)
 */
function checkWin(board) {
  const winPatterns = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (let pattern of winPatterns) {
    const [a, b, c] = pattern;

    if (
      board[a] &&
      board[a] == board[b] &&
      board[a] == board[c]
    ) {
      return board[a];
    }
  }

  if (!board.includes("")) return "draw";
  return null;
}

/**
 * AI decision-making with priority strategy:
 * 1. Win if possible
 * 2. Block opponent's win
 * 3. Take center
 * 4. Take random corner
 * 5. Take any empty cell
 */
function smartBot(board, bot, player) {
  const empty = board
    .map((v, i) => (v == "" ? i : null))
    .filter((v) => v !== null);

  // Check for winning move
  for (let i of empty) {
    const test = [...board];
    test[i] = bot;
    if (checkWin(test) == bot) return i;
  }

  // Block opponent's winning move
  for (let i of empty) {
    const test = [...board];
    test[i] = player;
    if (checkWin(test) == player) return i;
  }

  // Take center
  if (board[4] == "") return 4;

  // Take a random corner
  const corners = [0, 2, 6, 8].filter((i) => board[i] == "");
  if (corners.length) {
    return corners[Math.floor(Math.random() * corners.length)];
  }

  // Take any remaining empty cell
  return empty[Math.floor(Math.random() * empty.length)];
}

module.exports = {
  config: {
    name: "ttt",
    version: "7.0",
    author: "Raihan Choudhury",
    role: 0,
    category: "game",
    guide: "/ttt",
  },

  /**
   * Initializes a new Tic-Tac-Toe game
   * Creates empty board, stores game state, and displays numbered board
   */
  onStart: async function ({ event, message }) {
    if (!global.tttGames) global.tttGames = {};

    // Check if a game is already running in this thread
    if (global.tttGames[event.threadID]) {
      const existingGame = global.tttGames[event.threadID];
      
      // If the same user is trying to start a new game, reset their game
      if (existingGame.player === event.senderID) {
        delete global.tttGames[event.threadID];
      } else {
        // If another user is trying to start a game, inform them
        return message.reply("A game is already in progress. Please wait for it to finish.");
      }
    }

    global.tttGames[event.threadID] = {
      board: Array(9).fill(""),
      player: event.senderID,
      symbol: null,
      bot: null,
      choose: false,
      lastMsg: null,
      awaitingReply: false,
    };

    const file = path.join(__dirname, "cache", "ttt.png");
    fs.writeFileSync(file, makeBoard(global.tttGames[event.threadID].board));

    const msg = await message.reply({
      body: `𝗧𝗜𝗖 𝗧𝗔𝗖 𝗧𝗢𝗘
𝗖𝗵𝗼𝗼𝘀𝗲:
𝚁𝙴𝙿𝙻𝚈 𝗫 𝚘𝚛 𝗢 𝚃𝚘 𝚃𝙷𝙸𝚂 𝙼𝙴𝚂𝚂𝙰𝙶𝙴`,
      attachment: fs.createReadStream(file),
    });

    global.tttGames[event.threadID].lastMsg = msg.messageID;
    global.tttGames[event.threadID].awaitingReply = true;
  },

  /**
   * Handles all game interactions:
   * - Symbol selection (X or O)
   * - Move validation
   * - Player turn execution
   * - Bot turn with AI
   * - Win/draw detection
   */
  onChat: async function ({ event, message }) {
    const game = global.tttGames?.[event.threadID];
    if (!game) return;

    // Only process if user replied to the game's last message
    if (!event.messageReply || event.messageReply.messageID !== game.lastMsg) {
      return;
    }

    // Verify that the person replying is the actual player
    if (event.senderID !== game.player) {
      // If someone else tries to reply, inform them
      const msg = await message.reply({
        body: `𝚃𝙷𝙸𝚂 𝙶𝙰𝙼𝙴 𝙱𝙴𝙻𝙾𝙽𝙶𝚂 𝚃𝙾 𝙰𝙽𝙾𝚃𝙷𝙴𝚁 𝙿𝙻𝙰𝚈𝙴𝚁. 𝙾𝙽𝙻𝚈 𝚃𝙷𝙴 𝙶𝙰𝙼𝙴 𝚂𝚃𝙰𝚁𝚃𝙴𝚁 𝙲𝙰𝙽 𝙿𝙻𝙰𝚈. 𝚈𝙾𝚄 𝚂𝚃𝙰𝚁𝚃 𝚈𝙾𝚄𝚁 𝙾𝚆𝙽 𝙶𝙰𝙼𝙴.`,
      });
      return;
    }

    const text = event.body?.trim().toUpperCase();

    // Symbol selection phase
    if (!game.choose) {
      if (text == "X" || text == "O") {
        game.symbol = text;
        game.bot = text == "X" ? "O" : "X";
        game.choose = true;

        const file = path.join(__dirname, "cache", "ttt_board.png");
        fs.writeFileSync(file, makeBoard(game.board));

        const msg = await message.reply({
          body: `𝗬𝗼𝘂 𝗰𝗵𝗼𝘀𝗲 ${text}

𝚁𝙴𝙿𝙻𝚈 𝚆𝙸𝚃𝙷 𝙰𝙽𝚈 𝙽𝚄𝙼𝙱𝙴𝚁 𝙱𝙴𝚃𝚆𝙴𝙴𝙽 1-9`,
          attachment: fs.createReadStream(file),
        });

        game.lastMsg = msg.messageID;
        game.awaitingReply = true;
        return;
      }
      return;
    }

    // Parse and validate move
    const num = parseInt(text);
    if (!num || num < 1 || num > 9) {
      const msg = await message.reply({
        body: `𝙸𝙽𝚅𝙰𝙻𝙸𝙳 𝙸𝙽𝙿𝚄𝚃. 𝙿𝙻𝙴𝙰𝚂𝙴 𝚁𝙴𝙿𝙻𝚈 𝚃𝙾 𝚃𝙷𝙴 𝙱𝙾𝙰𝚁𝙳 𝚆𝙸𝚃𝙷 𝙰 𝙽𝚄𝙼𝙱𝙴𝚁 1-9`,
      });
      game.lastMsg = msg.messageID;
      game.awaitingReply = true;
      return;
    }

    if (game.board[num - 1] != "") {
      const msg = await message.reply({
        body: `𝙿𝙾𝚂𝙸𝚃𝙸𝙾𝙽 ${num} 𝙸𝚂 𝙰𝙻𝚁𝙴𝙰𝙳𝚈 𝚃𝙰𝙺𝙴𝙽. 𝚁𝙴𝙿𝙻𝚈 𝚃𝙾 𝚃𝙷𝙴 𝙱𝙾𝙰𝚁𝙳 𝚆𝙸𝚃𝙷 𝙰𝙽𝙾𝚃𝙷𝙴𝚁 𝙽𝚄𝙼𝙱𝙴𝚁.`,
      });
      game.lastMsg = msg.messageID;
      game.awaitingReply = true;
      return;
    }

    // Player's turn
    game.board[num - 1] = game.symbol;
    let result = checkWin(game.board);

    if (result) return finish(result, game, message);

    // Bot's turn
    const move = smartBot(game.board, game.bot, game.symbol);
    game.board[move] = game.bot;

    result = checkWin(game.board);
    if (result) return finish(result, game, message);

    // Update board display
    const file = path.join(__dirname, "cache", "ttt_" + Date.now() + ".png");
    fs.writeFileSync(file, makeBoard(game.board));

    const msg = await message.reply({
      body: `𝚈𝙾𝚄𝚁 𝚃𝚄𝚁𝙽: ${game.symbol}  |  𝙱𝙾𝚃: ${game.bot}

𝚁𝙴𝙿𝙻𝚈 𝚃𝙾 𝚃𝙷𝙸𝚂 𝙱𝙾𝙰𝚁𝙳 𝚆𝙸𝚃𝙷 𝙰 𝙽𝚄𝙼𝙱𝙴𝚁 1-9`,
      attachment: fs.createReadStream(file),
    });

    game.lastMsg = msg.messageID;
    game.awaitingReply = true;
  },
};

/**
 * Displays game result with clear visual feedback
 * Removes game state from memory
 */
async function finish(result, game, message) {
  let text;

  if (result == "draw") {
    text = "𝙶𝙰𝙼𝙴 𝙴𝙽𝙳𝙴𝙳 𝙸𝙽 𝙰 𝙳𝚁𝙰𝚆";
  } else if (result == game.symbol) {
    text = "𝗖𝗼𝗻𝗴𝗿𝗮𝘁𝘂𝗹𝗮𝘁𝗶𝗼𝗻𝘀! 𝚈𝙾𝚄 𝚆𝙾𝙽 𝚃𝙷𝙴 𝙶𝙰𝙼𝙴";
  } else {
    text = "𝙱𝙾𝚃 𝚆𝙸𝙽𝚂 𝚃𝙷𝙴 𝙶𝙰𝙼𝙴";
  }

  const file = path.join(__dirname, "cache", "ttt_end.png");
  fs.writeFileSync(file, makeBoard(game.board));

  delete global.tttGames[message.threadID];

  return message.reply({
    body: text,
    attachment: fs.createReadStream(file),
  });
    }
