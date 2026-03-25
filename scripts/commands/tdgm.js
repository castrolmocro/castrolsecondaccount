const axios = require("axios");

module.exports.config = {
  name: "td", // command name
  version: "1.0.0", // command version
  permission: 0, // public use
  credits: "IMRAN", // author
  description: "Get unique truth/dare challenges with user mentions", // command description
  prefix: false, // no prefix required
  category: "Fun", // category shown in help
  usages: "[truth/dare]", // usage pattern
  cooldowns: 7, // 7 seconds cooldown
  dependencies: {
    "axios": "" // install axios if not present
  }
};

const emojis = ["✨", "🎲", "🔥", "😈", "💫", "⚡"];

module.exports.run = async ({ api, event, args, Users }) => {
  const { threadID, senderID, messageID } = event;
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

  if (!args[0]) {
    return api.sendMessage(
      `${randomEmoji} Please choose "truth" or "dare"\nExample: td truth`,
      threadID,
      messageID
    );
  }

  const type = args[0].toLowerCase();
  if (!["truth", "dare"].includes(type)) {
    return api.sendMessage(
      `⚠️ Invalid type! Use either "truth" or "dare".`,
      threadID,
      messageID
    );
  }

  try {
    const name = await Users.getNameUser(senderID);
    const res = await axios.get(`https://masterapi.fun/api/${type}`);

    if (!res.data || !res.data.question) {
      throw new Error("Invalid API response");
    }

    const challenge = res.data.question;
    const msg = `╭───♡︎⋅🄷🄴🅁🄴'🅂⋅♡︎───⦁\n│  ⤷👤 | 𝗨𝘀𝗲𝗿: ${name}\n│  ⤷🎯 | 𝗧𝘆𝗽𝗲: ${type.toUpperCase()}\n│\n│  ⤷📜 | ${challenge}\n╰───⋅♡︎───────⦁`;

    return api.sendMessage(msg, threadID, messageID);
  } catch (err) {
    console.error(err);
    return api.sendMessage(
      `${randomEmoji} Failed to fetch ${type}. Please try again later.`,
      threadID,
      messageID
    );
  }
};