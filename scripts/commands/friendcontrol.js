module.exports.config = {
  name: "friendcontrol",
  version: "1.0.0",
  permission: 2, // 0 = الجميع, 1 = mod, 2 = admin فقط
  credits: "IMRAN",
  description: "يسمح للأدمن فقط بقبول أو رفض طلبات الصداقة",
  prefix: true,
  category: "admin",
  usages: "!accept <ID> | !decline <ID>",
  cooldowns: 5,
  premium: false,
  dependencies: {}
};

module.exports.run = async ({ api, event, args, Users }) => {
  if (!args[0] || !args[1]) {
    return api.sendMessage("❌ الرجاء استخدام: !accept <ID> أو !decline <ID>", event.threadID);
  }

  const action = args[0].toLowerCase(); // 'accept' أو 'decline'
  const userID = args[1]; // ID الشخص

  try {
    if (action === "accept") {
      await api.addFriend(userID);
      api.sendMessage(`✅ تم قبول طلب الصداقة من: ${userID}`, event.threadID);
    } else if (action === "decline") {
      await api.removeFriend(userID);
      api.sendMessage(`❌ تم رفض طلب الصداقة من: ${userID}`, event.threadID);
    } else {
      api.sendMessage("❌ الأمر غير معروف. استخدم !accept أو !decline", event.threadID);
    }
  } catch (error) {
    console.error(error);
    api.sendMessage("❌ حدث خطأ أثناء تنفيذ الأمر.", event.threadID);
  }
};