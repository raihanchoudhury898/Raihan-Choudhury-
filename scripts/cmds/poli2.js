module.exports.config = {
  name: "poli2",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Raihab Choudhury",
  description: "generate image from pollination",
  commandCategory: "user",
  usages: "poli text",
  cooldowns: 2,
};

module.exports.run = async ({ api, event, args }) => {
  const axios = require("axios");
  const fs = require("fs-extra");

  let { threadID, messageID } = event;
  let query = args.join(" ");

  if (!query)
    return api.sendMessage("put text/query", threadID, messageID);

  let text = encodeURIComponent(query);
  let path = __dirname + `/cache/poli.png`;

  try {
    const url = `https://pollinations.ai/prompt/${text}`;

    const poli = (await axios.get(url, {
      responseType: "arraybuffer",
    })).data;

    fs.writeFileSync(path, Buffer.from(poli, "utf-8"));

    api.sendMessage(
      {
        body: "Here's your image✨🌺",
        attachment: fs.createReadStream(path),
      },
      threadID,
      () => fs.unlinkSync(path),
      messageID
    );
  } catch (e) {
    api.sendMessage("❌ Error: Pollinations server not responding!", threadID, messageID);
  }
};
