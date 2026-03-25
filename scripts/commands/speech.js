const fs = require("fs");
const path = require("path");
const { text2voice } = require("nayan-api-servers");

module.exports.config = {
  name: "speech", // Command name
  version: "1.0.0",
  permission: 0,
  credits: "IMRAN",
  description: "Convert text to speech using nayan-api-servers",
  prefix: false,
  premium: false,
  category: "Voice",
  usages: "speech [text]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const content = (event.type === "message_reply" && event.messageReply?.body)
    ? event.messageReply.body
    : args.join(" ");

  const name = "Nabanita"; // Voice name (can be made dynamic)
  const fileName = `speech-${event.senderID}.mp3`;
  const filePath = path.join(__dirname, fileName);

  if (!content) {
    return api.sendMessage(
      "❌ Please provide the text to convert to speech.\nExample: speech আমার নাম ইমরান",
      event.threadID,
      event.messageID
    );
  }

  try {
    await text2voice(content, name, filePath);

    if (fs.existsSync(filePath)) {
      api.sendMessage(
        {
          body: "🔊 Here is your speech:",
          attachment: fs.createReadStream(filePath)
        },
        event.threadID,
        () => fs.unlinkSync(filePath),
        event.messageID
      );
    } else {
      api.sendMessage("❌ Failed to generate the speech file.", event.threadID, event.messageID);
    }
  } catch (error) {
    console.error(error);
    api.sendMessage("⚠️ An error occurred while generating the speech.", event.threadID, event.messageID);
  }
};
