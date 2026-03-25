module.exports.config = {
  name: "say",
  version: "2.0.0",
  permission: 0,
  credits: "fixed by GPT",
  description: "Text to speech",
  prefix: true,
  category: "media",
  usages: "say [text]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  try {
    const fs = global.nodemodule["fs-extra"];
    const path = global.nodemodule["path"];

    // 📌 إنشاء مجلد cache إذا ماكانش
    const cachePath = path.resolve(__dirname, "cache");
    if (!fs.existsSync(cachePath)) {
      fs.mkdirSync(cachePath);
    }

    // 📌 النص
    let content = event.type == "message_reply"
      ? event.messageReply.body
      : args.join(" ");

    if (!content) {
      return api.sendMessage("⚠️ اكتب نص باش نحولو لصوت", event.threadID);
    }

    // 📌 اللغات المدعومة
    const langs = ["ar", "en", "fr", "ru", "ko", "ja", "tl"];

    let languageToSay = "en"; // default
    let msg = content;

    const firstWord = content.split(" ")[0];

    if (langs.includes(firstWord)) {
      languageToSay = firstWord;
      msg = content.slice(firstWord.length).trim();
    }

    if (!msg) {
      return api.sendMessage("⚠️ اكتب كلام بعد تحديد اللغة", event.threadID);
    }

    const filePath = path.resolve(cachePath, `${event.threadID}_${event.senderID}.mp3`);

    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(msg)}&tl=${languageToSay}&client=tw-ob`;

    // 📥 تحميل الصوت
    await global.utils.downloadFile(url, filePath);

    // 📤 إرسال
    return api.sendMessage({
      body: `🔊 ${languageToSay.toUpperCase()}`,
      attachment: fs.createReadStream(filePath)
    }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);

  } catch (e) {
    console.log(e);
    return api.sendMessage("❌ صار خطأ", event.threadID);
  }
};