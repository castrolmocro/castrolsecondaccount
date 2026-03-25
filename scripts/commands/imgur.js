const axios = require("axios");

module.exports.config = {
  name: "imgur",
  version: "1.0.0",
  permission: 0,
  credits: "IMRAN",
  description: "📤 Upload images/videos to Imgur with elegant previews",
  prefix: true,
  category: "media",
  usages: "imgur [link or reply]",
  cooldowns: 10,
  dependencies: { "axios": "" }
};

module.exports.run = async ({ api, event, args }) => {
  try {
    let link = args.join(" ");
    const attachments = event.messageReply?.attachments;

    if (!link && !attachments?.length) {
      return api.sendMessage("✨ Please reply to an image/video or provide a link.", event.threadID, event.messageID);
    }

    const items = attachments?.length
      ? attachments.map(a => a.url)
      : [link];

    const results = await Promise.all(items.map(url => {
      if (!/^https?:\/\//.test(url)) throw new Error("Invalid URL");
      return axios.get(`https://imgur-upload-psi.vercel.app/mahabub?url=${encodeURIComponent(url)}`);
    }));

    const links = results.map(r =>
      r.data?.url ? r.data.url : "❌ Upload failed"
    );

    api.sendMessage(`📤 Imgur Upload Results:\n${links.join("\n")}`, event.threadID, event.messageID);

  } catch (err) {
    console.error(err);
    api.sendMessage("❌ An error occurred while uploading. Please try again.", event.threadID, event.messageID);
  }
};
