const axios = require("axios");

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID, senderID, mentions, type, messageReply } = event;

  let targetID, targetName;

  // دعم الرد
  if (type === "message_reply") {
    targetID = messageReply.senderID;
    targetName = messageReply.senderName || "this user";
  } 
  // دعم منشن
  else if (mentions && Object.keys(mentions).length > 0) {
    targetID = Object.keys(mentions)[0];
    targetName = mentions[targetID].name || "this user";
  } 
  else {
    return api.sendMessage("⚠️ منشن أو رد على شخص باش تدير hug 🤗", threadID, messageID);
  }

  if (!global.imranapi || !global.imranapi.canvas) {
    return api.sendMessage("❌ API غير معرف", threadID, messageID);
  }

  const imgURL = `${global.imranapi.canvas}/hug?one=${senderID}&two=${targetID}`;

  try {
    // ✅ جلب الصورة كـ arraybuffer
    const response = await axios.get(imgURL, { responseType: "arraybuffer" });

    // ✅ تحويلها إلى Buffer
    const imageBuffer = Buffer.from(response.data, "binary");

    // إرسال الصورة
    return api.sendMessage({
      body: `🤗 ${targetName}, you just got a hug!`,
      attachment: imageBuffer
    }, threadID, messageID);

  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ فشل تحميل الصورة", threadID, messageID);
  }
};