module.exports.config = {
  name: "unm",
  version: "1.0.0",
  permission: 1,
  credits: "IMRAN",
  prefix: true,
  description: "Unlock group name (bot admins only)",
  category: "admin",
  usages: "unm",
  cooldowns: 3
};

module.exports.run = async function ({ api, event }) {
  const threadID = event.threadID;
  const senderID = String(event.senderID);

  // Init lock store if missing
  if (!global.nameLocks) global.nameLocks = new Map();

  // Bot admin check
  const botAdmins = [
    ...(global.config.ADMINBOT || []),
    ...(global.config.OPERATOR || []),
    ...(global.config.OWNER || [])
  ].map(String);

  if (!botAdmins.includes(senderID)) {
    return api.sendMessage("❌ Bot admins only.", threadID);
  }

  // Check lock
  if (!global.nameLocks.has(threadID)) {
    return api.sendMessage("ℹ️ Group name is not locked.", threadID);
  }

  // Unlock
  global.nameLocks.delete(threadID);
  api.sendMessage("🔓 Group name unlocked.", threadID);
};
