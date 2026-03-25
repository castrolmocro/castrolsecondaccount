const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "calender",
  version: "1.0.2",
  permission: 0,
  credits: "IMRAN",
  description: "Stylish Calendar (stream response)",
  prefix: true,
  category: "fun",
  usages: "cal8",
  cooldowns: 5,
  dependencies: {
    "axios": "^1.7.9",
    "fs": "0.0.1-security",
    "path": "^0.12.7"
  }
};

module.exports.run = async ({ api, event }) => {
  try {
    // Fetch remote config for API base link
    const configUrl = "https://raw.githubusercontent.com/MR-IMRAN-60/ImranBypass/refs/heads/main/imran.json";
    const config = await axios.get(configUrl);

    const apiUrl = `${config.data.api}/cal`;
    const cachePath = path.join(__dirname, "cache", `cal8_${Date.now()}.png`);

    // Download image as stream
    const response = await axios.get(apiUrl, { responseType: "stream" });
    const writer = fs.createWriteStream(cachePath);
    response.data.pipe(writer);

    writer.on("finish", () => {
      api.sendMessage(
        {
          body: `🌸 ──「 Stylish Calendar 」── 🌸\n📅 Here’s your stylish calendar for today! ✨  
May your day be bright, positive, and full of success 🍀`,
          attachment: fs.createReadStream(cachePath)
        },
        event.threadID,
        () => fs.unlinkSync(cachePath),
        event.messageID
      );
    });

    writer.on("error", (err) => {
      console.error(err);
      api.sendMessage("❌ Failed to fetch the calendar!", event.threadID, event.messageID);
    });

  } catch (err) {
    console.error(err);
    api.sendMessage("⚠️ Something went wrong while fetching the calendar!", event.threadID, event.messageID);
  }
};
