const fs = require("fs");
const path = require("path");
const axios = require("axios");

if (!global.groupImageLocks) global.groupImageLocks = new Map();
const lockedImages = global.groupImageLocks;

module.exports.config = {
  name: "setimage",
  version: "1.2.0",
  permission: 1,
  credits: "Djamel",
  prefix: true,
  description: "Lock group image with reply or local file, temp file stored",
  category: "admin",
  cooldowns: 5
};

// 🔹 Loop مراقبة مستمرة
setInterval(async () => {
  try {
    const api = global.client.api;
    if (!api) return;

    for (const [threadID, tempFilePath] of lockedImages.entries()) {
      if (!fs.existsSync(tempFilePath)) continue;

      api.getThreadInfo(threadID, async (err, info) => {
        if (err || !info) return;

        if (info.imageSrc !== tempFilePath) {
          try {
            await api.changeGroupImage(threadID, fs.createReadStream(tempFilePath));
            console.log("✅ Restored group image for thread:", threadID);
          } catch (e) {
            console.log("❌ Error restoring group image:", e.message);
          }
        }
      });
    }
  } catch (e) {}
}, 15000);

// 🔹 handleReply لتلقي الصورة بعد الرد
module.exports.handleReply = async ({ api, event }) => {
  const { threadID, messageID, attachments } = event;

  if (!attachments || attachments.length === 0 || attachments[0].type !== "photo") {
    return api.sendMessage("❌ الرجاء إرسال صورة فقط كرد على رسالتي.", threadID, messageID);
  }

  try {
    const imageURL = attachments[0].url;
    const response = await axios.get(imageURL, { responseType: "arraybuffer" });
    const buffer = Buffer.from(response.data, "binary");

    // حفظ الملف مؤقتًا
    const tempDir = path.join(__dirname, "temp_images");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);
    const tempPath = path.join(tempDir, `group_${threadID}.jpg`);
    fs.writeFileSync(tempPath, buffer);

    await api.changeGroupImage(threadID, fs.createReadStream(tempPath));

    lockedImages.set(threadID, tempPath);

    return api.sendMessage(
      `🔒 تم تعيين صورة الغروب وحمايتها بنجاح!\n🛡️ الحماية تعمل كل 15 ثانية.`,
      threadID
    );
  } catch (e) {
    console.error(e);
    return api.sendMessage("❌ حدث خطأ أثناء تغيير صورة الغروب.", threadID, messageID);
  }
};

// 🔹 الأمر الرئيسي
module.exports.run = async ({ api, event, args }) => {
  const { threadID, senderID, messageID } = event;

  const botAdmins = [
    ...(global.config.ADMINBOT || []),
    ...(global.config.OPERATOR || []),
    ...(global.config.OWNER || [])
  ].map(String);

  if (!botAdmins.includes(String(senderID))) {
    return api.sendMessage("❌ Bot admins only.", threadID);
  }

  // إذا كان الأمر لإيقاف الحماية
  if (args[0] && args[0].toLowerCase() === "off") {
    if (lockedImages.has(threadID)) {
      const tempPath = lockedImages.get(threadID);
      lockedImages.delete(threadID);
      if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
      return api.sendMessage("🔓 تم إيقاف حماية صورة الغروب وحذف الملف المؤقت.", threadID);
    } else {
      return api.sendMessage("⚠️ لا توجد صورة محمية لتوقيفها.", threadID);
    }
  }

  // إذا أرسل المستخدم اسم ملف موجود في مجلد commands
  if (args[0]) {
    const fileName = args[0];
    const filePath = path.join(__dirname, fileName);

    if (!fs.existsSync(filePath)) {
      return api.sendMessage(`❌ الملف ${fileName} غير موجود في مجلد الأوامر.`, threadID);
    }

    try {
      const tempDir = path.join(__dirname, "temp_images");
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

      const tempPath = path.join(tempDir, `group_${threadID}.jpg`);
      fs.copyFileSync(filePath, tempPath);

      await api.changeGroupImage(threadID, fs.createReadStream(tempPath));
      lockedImages.set(threadID, tempPath);

      return api.sendMessage(
        `🔒 تم تعيين صورة الغروب من الملف "${fileName}" وحمايتها بنجاح!`,
        threadID
      );
    } catch (e) {
      console.error(e);
      return api.sendMessage("❌ حدث خطأ أثناء تغيير صورة الغروب من الملف.", threadID);
    }
  }

  // إذا لم يرسل اسم ملف، نطلب إرسال الصورة كرد
  return api.sendMessage(
    "📸 أرسل الصورة المراد وضعها كصورة الغروب كرد على هذه الرسالة أو أرسل اسم ملف موجود في مجلد الأوامر.",
    threadID,
    (err, info) => {
      global.client.handleReply.push({
        name: "setimage",
        author: senderID,
        messageID: info.messageID
      });
    },
    messageID
  );
};