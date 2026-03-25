const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "addadmin",
  version: "1.0.0",
  permission: 1,
  credits: "imran",
  prefix: true,
  description: "Add a new bot admin (ADMINBOT level)",
  category: "admin",
  usages: "addadmin [account ID] أو بالرد على رسالة",
  cooldowns: 3
};

module.exports.run = async function ({ api, event, args, Users }) {
  const { threadID, senderID, messageReply } = event;

  const owner = (global.config.OWNER || []).map(String);
  const operator = (global.config.OPERATOR || []).map(String);

  const canUse = owner.includes(String(senderID)) || operator.includes(String(senderID));
  if (!canUse) {
    return api.sendMessage("❌ Only OWNER or OPERATOR can add admins.", threadID);
  }

  let targetID;

  // ✅ الحالة 1: الرد على رسالة
  if (messageReply) {
    targetID = String(messageReply.senderID);
  }

  // ✅ الحالة 2: ID عادي
  else if (args[0] && !isNaN(args[0])) {
    targetID = args[0].trim();
  }

  // ❌ لا يوجد هدف
  else {
    return api.sendMessage("⚠️ Usage:\n- !addadmin [ID]\n- أو رد على رسالة الشخص واكتب !addadmin", threadID);
  }

  const configPath = global.client.configPath;
  delete require.cache[require.resolve(configPath)];
  const config = require(configPath);

  if (config.ADMINBOT.includes(targetID)) {
    return api.sendMessage(`⚠️ ${targetID} is already an admin.`, threadID);
  }

  config.ADMINBOT.push(targetID);
  global.config.ADMINBOT.push(targetID);

  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");

  let name = targetID;
  try { name = await Users.getNameUser(targetID); } catch (e) {}

  return api.sendMessage(`✅ Added new admin:\nName: ${name}\nID: ${targetID}`, threadID);
};