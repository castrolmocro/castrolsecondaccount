module.exports.config = {
  name: "hug2",
  version: "1.0.0",
  permission: 0,
  credits: "imran",
  description: "Send hug using canvas API (stream version)",
  prefix: false,
  category: "fun",
  usages: "hug @mention",
  cooldowns: 5,
  dependencies: {
    "axios": ""
  }
};

const axios = require("axios");

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID, senderID, mentions } = event;

  if (Object.keys(mentions).length === 0) {
    return api.sendMessage("Please mention someone to hug.", threadID, messageID);
  }

  const mentionID = Object.keys(mentions)[0];
  const mentionName = mentions[mentionID];

  const imgURL = `${global.imranapi.canvas}/hug2?one=${senderID}&two=${mentionID}`;

  try {
    const response = await axios({
      url: imgURL,
      method: 'GET',
      responseType: 'stream'
    });

    api.sendMessage({
      body: `🤗 ${mentionName}, you just got a hug!`,
      attachment: response.data
    }, threadID, messageID);

  } catch (err) {
    console.error(err);
    api.sendMessage("Something went wrong. Please try again later.", threadID, messageID);
  }
};
