if (!global.nameLocks) global.nameLocks = new Map();

const lockedNames = global.nameLocks;

module.exports.config = {
  name: "nm",
  version: "7.0.0",
  permission: 1,
  credits: "Djamel",
  prefix: true,
  description: "Lock group name (strong protection)",
  category: "admin",
  cooldowns: 5
};

//  نظام مراقبة مستمر
setInterval(async () => {
  try {
    const api = global.client.api;
    if (!api) return;

    for (const [threadID, lockedName] of lockedNames.entries()) {
      api.getThreadInfo(threadID, async (err, info) => {
        if (err || !info) return;

        if (info.threadName !== lockedName) {
          try {
            await api.setTitle(lockedName, threadID);
            console.log("✅ Restored name:", lockedName);
          } catch (e) {
            console.log("❌ Error restoring:", e.message);
          }
        }
      });
    }
  } catch (e) {}
}, 15000); // كل 15 ثانية

// 🔹 الأمر
module.exports.run = async function ({ api, event, args }) {
  const { threadID, senderID } = event;

  const botAdmins = [
    ...(global.config.ADMINBOT || []),
    ...(global.config.OPERATOR || []),
    ...(global.config.OWNER || [])
  ].map(String);

  if (!botAdmins.includes(String(senderID))) {
    return api.sendMessage("❌ Bot admins only.", threadID);
  }

  if (args[0] === "off") {
    lockedNames.delete(threadID);
    return api.sendMessage("🔓 Name lock disabled.", threadID);
  }

  const name = args.join(" ");
  if (!name) {
    return api.sendMessage("⚠️ Usage: !nm [name] | !nm off", threadID);
  }

  try {
    await api.setTitle(name, threadID);
    lockedNames.set(threadID, name);

    api.sendMessage(
      `🔒 Name locked: ${name}\n🛡️ Protection active (checks every 15s)`,
      threadID
    );
  } catch (e) {
    api.sendMessage("❌ البوت لازم يكون أدمن", threadID);
  }
};