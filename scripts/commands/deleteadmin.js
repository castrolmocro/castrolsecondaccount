const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "deleteadmin",
  version: "1.0.0",
  permission: 1,
  credits: "imran",
  prefix: true,
  description: "Remove a bot admin (ADMINBOT level) — OWNER IDs are protected",
  category: "admin",
  usages: "deleteadmin [account ID]",
  cooldowns: 3
};

module.exports.run = async function ({ api, event, args, Users }) {
  const { threadID, senderID } = event;

  const owner = (global.config.OWNER || []).map(String);
  const operator = (global.config.OPERATOR || []).map(String);

  const canUse = owner.includes(String(senderID)) || operator.includes(String(senderID));
  if (!canUse) {
    return api.sendMessage("❌ Only OWNER or OPERATOR can remove admins.", threadID);
  }

  const targetID = args[0]?.trim();
  if (!targetID || isNaN(targetID)) {
    return api.sendMessage("⚠️ Usage: !deleteadmin [account ID]", threadID);
  }

  if (owner.includes(String(targetID))) {
    return api.sendMessage("🚫 Cannot remove an OWNER. OWNERs are protected.", threadID);
  }

  const configPath = global.client.configPath;
  delete require.cache[require.resolve(configPath)];
  const config = require(configPath);

  const index = config.ADMINBOT.findIndex(id => String(id) === String(targetID));
  if (index === -1) {
    return api.sendMessage(`⚠️ ${targetID} is not in the admin list.`, threadID);
  }

  config.ADMINBOT.splice(index, 1);
  const globalIndex = global.config.ADMINBOT.findIndex(id => String(id) === String(targetID));
  if (globalIndex !== -1) global.config.ADMINBOT.splice(globalIndex, 1);

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");

  let name = targetID;
  try { name = await Users.getNameUser(targetID); } catch (e) {}

  return api.sendMessage(`✅ Removed admin:\nName: ${name}\nID: ${targetID}`, threadID);
};
