const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "rndm",
  version: "1.0.0",
  permission: 0,
  credits: "IMRAN",
  description: "Fetch a random video by name",
  prefix: false,
  premium: false,
  category: "User",
  usages: "rndm [name]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const nameParam = args.join(" ");
  if (!args[0]) return api.sendMessage("🔍 Please provide a name to search.", event.threadID, event.messageID);

  try {
    const res = await axios.get(`http://de3.spaceify.eu:25335/video/${encodeURIComponent(nameParam)}`);
    const videoUrl = res.data.url;
    const title = res.data.title;
const length = res.data.length;

    if (!videoUrl) return api.sendMessage("❌ No video found for your query.", event.threadID, event.messageID);

    const videoResponse = await axios.get(videoUrl, { responseType: "arraybuffer" });
    const tempPath = path.join(__dirname, "cache", `video_${Date.now()}.mp4`);
    fs.writeFileSync(tempPath, Buffer.from(videoResponse.data));

    const styledMessage = {
  body: `🎬 𝗧𝗜𝗧𝗟𝗘: ${title || "Unknown Title"}\n🔍 𝗦𝗘𝗔𝗥𝗖𝗛 𝗤𝗨𝗘𝗥𝗬: ${nameParam}\n📦 𝗧𝗢𝗧𝗔𝗟 𝗩𝗜𝗗𝗘𝗢𝗦: ${length}\n✨ 𝗖𝗥𝗘𝗗𝗜𝗧𝗦: 𝙄𝙈𝙍𝘼𝙉 𝗕𝗢𝗧`,
  attachment: fs.createReadStream(tempPath)
};

    api.sendMessage(styledMessage, event.threadID, () => {
      fs.unlinkSync(tempPath);
    }, event.messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage("⚠️ An error occurred while processing your request.", event.threadID, event.messageID);
  }
};