const fs = require("fs");
const axios = require("axios");
const path = require("path");

module.exports.config = {
  name: "shazam",
  version: "1.1.0",
  permission: 0,
  credits: "Nayan",
  description: "Search and select media, then download audio or video.",
  prefix: true,
  category: "user",
  usages: "[reply media or provide URL]",
  cooldowns: 5,
  dependencies: {
    "axios": ""
  }
};

module.exports.run = async ({ api, event, args }) => {
  const link = event.messageReply?.attachments[0]?.url || args.join(" ");
  if (!link) return api.sendMessage('[⚜️]➜ Please provide an image or video link.', event.threadID, event.messageID);

  try {
    const cleanedLink = link.trim().replace(/\s/g, '');
    if (!/^https?:\/\//.test(cleanedLink)) {
      return api.sendMessage('[⚜️]➜ Invalid URL: must start with http:// or https://', event.threadID, event.messageID);
    }

    const encodedUrl = encodeURIComponent(cleanedLink);
    const { data } = await axios.get(`http://65.109.80.126:20392/nayan/song?url=${encodedUrl}`);

    if (!data || data.length === 0) {
      return api.sendMessage(`[⚜️]➜ No results found for this media.`, event.threadID, event.messageID);
    }

    let msg = `Here are the results:\n\n`;
    data.forEach((item, index) => {
      msg += `${index + 1}. ${item.title}\nDuration: ${item.length}\n\n`;
    });
    msg += `Reply with a number (e.g., 1) to choose.`;

    const message = await api.sendMessage(msg, event.threadID, event.messageID);

    global.client.handleReply.push({
      name: this.config.name,
      messageID: message.messageID,
      author: event.senderID,
      results: data,
      originalLink: cleanedLink
    });
  } catch (error) {
    console.error(error);
    return api.sendMessage('[⚜️]➜ Error fetching data.', event.threadID, event.messageID);
  }
};

module.exports.handleReply = async ({ api, event, handleReply }) => {
  const { author, results, ytUrl, step } = handleReply;
  if (event.senderID !== author) return;

  const reply = event.body.trim();
  api.unsendMessage(handleReply.messageID);


  
  if (!step) {
    const choice = parseInt(reply);
    if (isNaN(choice) || choice < 1 || choice > results.length) {
      return api.sendMessage("[⚜️]➜ Invalid choice. Please reply with a valid number.", event.threadID, event.messageID);
    }


    const selected = results[choice - 1];
    const ytUrlEncoded = encodeURIComponent(selected.url);

    const message = await api.sendMessage(
      `You selected:\n${selected.title}\n\nReply with:\n1 ➜ Download Audio\n2 ➜ Download Video`,
      event.threadID,
      event.messageID
    );

    global.client.handleReply.push({
      name: module.exports.config.name,
      messageID: message.messageID,
      author: event.senderID,
      step: 2,
      ytUrl: ytUrlEncoded,
      title: selected.title
    });
  }

  
  if (step === 2) {
    if (reply !== '1' && reply !== '2') {
      return api.sendMessage("[⚜️]➜ Please reply with 1 for audio or 2 for video.", event.threadID, event.messageID);
    }

    const type = reply === '1' ? "audio" : "video";
    try {
      const { data } = await axios.get(`https://nayan-video-downloader.vercel.app/ytdown?url=${ytUrl}`);
      if (!data?.status || !data?.data) {
        return api.sendMessage("[⚜️]➜ Failed to fetch download URL.", event.threadID, event.messageID);
      }

      const downloadUrl = type === 'audio' ? data.data.video : data.data.video;
      const fileName = `download_${Date.now()}.${type === 'audio' ? 'mp3' : 'mp4'}`;
      const filePath = path.join(__dirname, 'cache', fileName);

      const response = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
      fs.writeFileSync(filePath, Buffer.from(response.data, 'binary'));

      api.sendMessage({
        body: `✅ Here is your ${type}:\n${handleReply.title}`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID, () => {
        fs.unlinkSync(filePath);
      }, event.messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage("[⚜️]➜ Error while downloading media.", event.threadID, event.messageID);
    }
  }
};
