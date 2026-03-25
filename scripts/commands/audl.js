const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
  name: "auto",
  version: "0.0.2",
  permission: 0,
  credits: "Nayan",
  description: "Auto video downloader",
  prefix: true,
  premium: false,
  category: "User",
  usages: "",
  cooldowns: 5
};

module.exports.handleEvent = async ({ api, event }) => {
  const content = event.body ? event.body.trim() : '';
  const body = content.toLowerCase();

  if (body.startsWith("auto")) return;

  if (body.startsWith("https://")) {
    try {
      api.setMessageReaction("🔍", event.messageID, () => {}, true);

      const response = await axios.get(`https://nayan-video-downloader.vercel.app/alldown?url=${encodeURIComponent(content)}`);
      const { low, high, title } = response.data.data;

      api.setMessageReaction("✔️", event.messageID, () => {}, true);

      const video = (await axios.get(high, {
        responseType: "arraybuffer"
      })).data;

      const filePath = __dirname + "/cache/auto.mp4";
      fs.writeFileSync(filePath, Buffer.from(video, "binary"));

      api.sendMessage({
        body: `《TITLE》: ${title}`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, event.messageID);
    } catch (error) {
      console.error("Download error:", error);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return api.sendMessage("Failed to download the video. Please check the link.", event.threadID, event.messageID);
    }
  }
};

module.exports.run = async ({ api, event }) => {
  api.sendMessage("Send a video link starting with https:// to auto-download.", event.threadID, event.messageID);
};
