module.exports.config = {
  name: "random",
  version: "1.0.2",
  permission: 0,
  credits: "IMRAN",
  prefix: true,
  description: "Get random anime videos",
  category: "media",
  premium: false,
  usages: "/random",
  cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    try {
        const axios = require("axios");
        const fs = require("fs-extra");
        const path = require("path");

        // Fetch video data from API
        const response = await axios.get('http://de3.spaceify.eu:25335/video/anime');
        const videoData = response.data.data;

        // Download video
        const videoResponse = await axios.get(videoData.imgurLink, {
            responseType: 'arraybuffer'
        });

        // Save video temporarily
        const tempPath = path.join(__dirname, "cache", `anime_${Date.now()}.mp4`);
        await fs.writeFile(tempPath, Buffer.from(videoResponse.data, "utf-8"));

        // Prepare message
        const message = {
            body: `🎬 𝗥𝗔𝗡𝗗𝗢𝗠 𝗩𝗜𝗗𝗘𝗢 🎬\n🧑‍ 𝗨𝗽𝗹𝗼𝗮𝗱𝗲𝗱 𝗯𝘆: ${videoData.title}`,
            attachment: fs.createReadStream(tempPath)
        };

        // Send message
        await api.sendMessage(message, event.threadID, async () => {
            // Clean up temporary file
            await fs.unlink(tempPath);
        });

    } catch (error) {
        console.error("Error in random command:", error);
        api.sendMessage("❌ An error occurred while processing the video. Please try again later.", event.threadID);
    }
};