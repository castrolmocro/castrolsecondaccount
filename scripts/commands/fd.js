const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs");

module.exports.config = {
  name: "friend",
  version: "1.0.0",
  permission: 0,
  credits: "IMRAN", // Updated
  description: "Create a friends photo frame with 3 people",
  prefix: false,
  premium: false,
  category: "Friends",
  usages: "friend @friend1 @friend2",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args, Threads, Users }) => {
  const uid = event.senderID;
  const mentions = Object.keys(event.mentions);

  if (mentions.length < 2) {
    const senderName = await Users.getNameUser(uid);
    return api.sendMessage(`${senderName}, please tag 2 friends to create the frame.`, event.threadID, event.messageID);
  }

  const friend1ID = mentions[0];
  const friend2ID = mentions[1];

  const senderName = await Users.getNameUser(uid);
  const friend1Name = await Users.getNameUser(friend1ID);
  const friend2Name = await Users.getNameUser(friend2ID);

  try {
    // Get API base from external source
    const res = await axios.get('https://raw.githubusercontent.com/MOHAMMAD-NAYAN-07/Nayan/main/api.json');
    const apiBase = res.data.api;

    const imageURL = `${apiBase}/nayan/friend?uid=${friend2ID}&uid2=${uid}&uid3=${friend1ID}`;

    api.sendMessage("Processing your image, please wait...", event.threadID, async (err, info) => {
      setTimeout(() => api.unsendMessage(info.messageID), 5000);

      try {
        const imageResponse = await axios.get(imageURL, { responseType: 'arraybuffer' });
        const image = await jimp.read(imageResponse.data);
        const filePath = `./friend_frame_${uid}.png`;
        await image.writeAsync(filePath);

        const attachment = fs.createReadStream(filePath);
        const message = `[👬] FRIEND 1: ${senderName}\n[👬] FRIEND 2: ${friend1Name}\n[👬] FRIEND 3: ${friend2Name}`;
        api.sendMessage({ body: message, attachment }, event.threadID, () => fs.unlinkSync(filePath));
      } catch (err) {
        console.error(err);
        api.sendMessage("An error occurred while generating the image.", event.threadID, event.messageID);
      }
    });
  } catch (err) {
    console.error(err);
    api.sendMessage("Failed to connect to the image API.", event.threadID, event.messageID);
  }
};
