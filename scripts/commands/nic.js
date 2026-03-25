if (!global.nickLocks) global.nickLocks = new Map();

module.exports.config = {
  name: "nic",
  version: "1.0.0",
  permission: 2,
  credits: "imran",
  prefix: true,
  description: "Lock everyone's nickname in the group to a chosen name",
  category: "admin",
  usages: "nic [nickname] | nic stop",
  cooldowns: 5
};

async function runNickLock(api, threadID, nickname) {
  const lockEntry = global.nickLocks.get(threadID);
  if (!lockEntry || !lockEntry.active) return;

  let info;
  try {
    info = await api.getThreadInfo(threadID);
  } catch (e) {
    return;
  }

  const participants = (info.participantIDs || []).filter(id => id !== api.getCurrentUserID());

  let index = lockEntry.index || 0;
  if (index >= participants.length) index = 0;

  const userID = participants[index];

  try {
    await api.changeNickname(nickname, threadID, userID);
  } catch (e) {}

  lockEntry.index = index + 1;
  global.nickLocks.set(threadID, lockEntry);

  lockEntry.timer = setTimeout(() => {
    runNickLock(api, threadID, nickname);
  }, 5000);
}

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

  const subcommand = (args[0] || "").toLowerCase();

  if (subcommand === "stop") {
    const existing = global.nickLocks.get(threadID);
    if (!existing || !existing.active) {
      return api.sendMessage("ℹ️ Nickname lock is not active in this group.", threadID);
    }
    if (existing.timer) clearTimeout(existing.timer);
    global.nickLocks.delete(threadID);
    return api.sendMessage("🔓 Nickname lock stopped.", threadID);
  }

  const nickname = args.join(" ");
  if (!nickname) {
    return api.sendMessage(
      "⚠️ Usage:\n• !nic [nickname] — start locking everyone's nickname\n• !nic stop — stop the nickname lock",
      threadID
    );
  }

  const existing = global.nickLocks.get(threadID);
  if (existing && existing.active) {
    if (existing.timer) clearTimeout(existing.timer);
  }

  global.nickLocks.set(threadID, { active: true, nickname, index: 0, timer: null });

  api.sendMessage(
    `🔒 Nickname lock started!\nNickname: "${nickname}"\n\nChanging one person every 5 seconds.\nType !nic stop to disable.`,
    threadID
  );

  runNickLock(api, threadID, nickname);
};
