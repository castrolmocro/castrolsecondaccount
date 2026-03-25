module.exports.config = {
  name: "adduser",
  version: "1.0.0",
  permission: 2, // أدمن فقط
  credits: "IMRAN",
  description: "يضيف شخص مباشرة إلى الغروب باستخدام ID أو رابط الحساب",
  prefix: true,
  category: "admin",
  usages: "!adduser <ID أو رابط>",
  cooldowns: 5,
  premium: false,
  dependencies: {}
};

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID } = event;

  if (!args[0]) {
    return api.sendMessage("❌ الرجاء كتابة ID الشخص أو رابط الحساب بعد الأمر.\nمثال: !adduser 1234567890 أو !adduser https://www.facebook.com/username", threadID, messageID);
  }

  let userID = args[0];

  // إذا كان رابط صفحة أو ملف شخصي
  if (userID.includes("facebook.com")) {
    try {
      // تحويل الرابط إلى ID باستخدام api.getUserIDFromLink (أو دالة مناسبة حسب مكتبتك)
      if (typeof api.getUserIDFromLink === "function") {
        const res = await api.getUserIDFromLink(userID);
        if (!res || !res.id) return api.sendMessage("❌ لم أتمكن من جلب الـ ID من الرابط.", threadID, messageID);
        userID = res.id;
      } else {
        return api.sendMessage("❌ هذه النسخة من البوت لا تدعم تحويل الرابط إلى ID مباشرة.", threadID, messageID);
      }
    } catch (err) {
      console.error(`[ERROR] ${err}`);
      return api.sendMessage(`❌ حدث خطأ أثناء تحويل الرابط إلى ID.\n${err}`, threadID, messageID);
    }
  }

  try {
    await api.addUserToGroup(userID, threadID); // إضافة الشخص مباشرة إلى الغروب
    api.sendMessage(`✅ تم إضافة الشخص مباشرة إلى الغروب.`, threadID, messageID);
  } catch (err) {
    console.error(`[ADD USER ERROR] ${err}`);
    api.sendMessage(`❌ حدث خطأ أثناء محاولة إضافة الشخص للغروب.\nالخطأ: ${err}`, threadID, messageID);
  }
};