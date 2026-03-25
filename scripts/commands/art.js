module.exports.config = {
  name: "art",
  version: "1.0.0",
  permission: 0,
  credits: "IMRAN",
  description: "Generate romantic and aesthetic art using canvas API",
  prefix: false,
  category: "art",
  usages: "[style] [@mention]",
  cooldowns: 5,
  dependencies: {}
};

module.exports.run = async ({ api, event, args }) => {
  const axios = require('axios');

  if (args.length === 0) {
    return api.sendMessage(
      `✨🎨 𝑨𝒓𝒕 𝑮𝒂𝒍𝒍𝒆𝒓𝒚 🎨✨\n\n` +
      `Hey there! Let's create something magical. 💖\nChoose your desired art style from this beautiful collection:\n\n` +
      `🌸 coffee\n🎨 artist\n🐐 goats\n💔 mistake\n🖌️ snap\n🛣️ pavement\n🛍️ sale\n🗼 pisa\n🐱 cat\n🕯️ summoning\n🌷 tulips\n🚇 underground\n🦇 vampire\n📸 vintage\n🖼️ wall\n💖 jigsaw\n\n` +
      `💌 Just type: art [style] [@mention]\n👉 Example: art coffee\n👉 Example: art vampire @imran\n\nI'm waiting to paint your world... 🎨`,
      event.threadID,
      event.messageID
    );
  }

  const styles = [
    "coffee", "artist", "goats", "mistake", "snap", "pavement", "sale",
    "pisa", "cat", "summoning", "tulips", "underground", "vampire",
    "vintage", "wall", "jigsaw"
  ];

  const style = args[0].toLowerCase();

  if (!styles.includes(style)) {
    return api.sendMessage(
      `💔 Oops! That's not a valid style.\n\n🎨 Available Styles:\n${styles.map(s => `• ${s}`).join('\n')}\n\n💌 Example: art coffee\n\nLet's create something beautiful together! ✨`,
      event.threadID,
      event.messageID
    );
  }

  const mentionID = Object.keys(event.mentions)[0]; // check if someone is mentioned
  const uid = mentionID || event.senderID; // use mention ID or fallback to sender

  const url = `${global.imranapi.canvas}/${style}?userid=${uid}`;

  try {
    const response = await axios.get(url, { responseType: 'stream' });
    return api.sendMessage(
      { body: `🎨 Here’s your magical ${style} art! 💫`, attachment: response.data },
      event.threadID,
      event.messageID
    );
  } catch (error) {
    console.error(error);
    return api.sendMessage(
      "💔 Sorry, I couldn't fetch your art right now. Please try again later! 🥺",
      event.threadID,
      event.messageID
    );
  }
};
