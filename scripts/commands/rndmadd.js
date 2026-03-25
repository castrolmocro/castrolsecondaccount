const axios = require('axios');

module.exports.config = {
  name: "add",
  version: "2.0.1",
  permission: 0,
  credits: "IMRAN",
  description: "Uploads video media and adds it to an album with stylish notifications",
  prefix: true,
  premium: false,
  category: "Media",
  usages: "add [link] [title] or reply to a video",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const missingInput = () => {
    api.sendMessage(
      `⚠️━━━━━━━━━━━━━━━━━━⚠️\n   𝙈𝙄𝙎𝙎𝙄𝙉𝙂 𝙋𝘼𝙍𝘼𝙈𝙀𝙏𝙀𝙍\n⚠️━━━━━━━━━━━━━━━━━━⚠️\nℹ️ 𝙋𝙡𝙚𝙖𝙨𝙚 𝙥𝙧𝙤𝙫𝙞𝙙𝙚 𝙖 𝙫𝙞𝙙𝙚𝙤 𝙐𝙍𝙇 𝙤𝙧 𝙧𝙚𝙥𝙡𝙮 𝙩𝙤 𝙖 𝙫𝙞𝙙𝙚𝙤!`,
      event.threadID,
      event.messageID
    );
  };

  const replyAttachment = event?.messageReply?.attachments?.[0];
  const isVideoReply = replyAttachment && replyAttachment.type === "video";

  if (!args[0] && !isVideoReply) return missingInput();

  try {
    const inputUrl = isVideoReply ? replyAttachment.url : args[0];
    const title = (isVideoReply ? args.join(" ") : args.slice(1).join(" ")) || "📁 𝙐𝙥𝙡𝙤𝙖𝙙𝙚𝙙 𝙑𝙞𝙙𝙚𝙤";

    const base = await axios.get(`https://raw.githubusercontent.com/MR-IMRAN-60/ImranBypass/main/imran.json`);
    const driveApi = base.data.drive;

    const res = await axios.get(`${driveApi}/upload?videoUrl=${encodeURIComponent(inputUrl)}`);
    if (!res.data.fileId || !res.data.webContentLink) {
      throw new Error("Invalid response from upload API");
    }

    const { fileId, webContentLink } = res.data;

    const albumRes = await axios.get(`http://de3.spaceify.eu:25335/album?title=${encodeURIComponent(title)}&url=${encodeURIComponent(webContentLink)}`);

    const successMessage =
      `💌 𝙈𝙀𝙎𝙎𝘼𝙂𝙀: 𝙎𝙐𝘾𝘾𝙀𝙎𝙎𝙁𝙐𝙇𝙇𝙔 𝘼𝘿𝘿𝙀𝘿!\n` +
      `📛 𝙏𝙞𝙩𝙡𝙚: ${albumRes.data.data.title}\n\n` +
      `🔗 𝙐𝙍𝙇: ${webContentLink}\n` +
      `🆔 𝙄𝘿: ${fileId}\n\n` +
      `🌐 𝘼𝙡𝙗𝙪𝙢 𝙐𝙥𝙙𝙖𝙩𝙚𝙙 𝙎𝙪𝙘𝙘𝙚𝙨𝙨𝙛𝙪𝙡𝙡𝙮!`;

    api.sendMessage(successMessage, event.threadID, event.messageID);
  } catch (error) {
    console.error("Error:", error);

    const errorMessage =
      `❌━━━━━━━━━━━━━━━━━━❌\n   𝙀𝙍𝙍𝙊𝙍 𝙊𝘾𝘾𝙐𝙍𝙍𝙀𝘿!\n❌━━━━━━━━━━━━━━━━━━❌\n\n` +
      `🔧 𝘿𝙚𝙩𝙖𝙞𝙡𝙨: ${error.message}\n\n` +
      `⚠️ 𝙋𝙡𝙚𝙖𝙨𝙚 𝙩𝙧𝙮 𝙖𝙜𝙖𝙞𝙣 𝙤𝙧 𝙘𝙝𝙚𝙘𝙠 𝙩𝙝𝙚 𝙞𝙣𝙥𝙪𝙩!`;

    api.sendMessage(errorMessage, event.threadID, event.messageID);
  }
};
