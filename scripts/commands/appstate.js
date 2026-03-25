const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "appstate",
  version: "1.0.0",
  permission: 2,
  credits: "imran",
  prefix: false,
  premium: false,
  description: "Change the bot appstate (cookies) without editing files manually",
  category: "admin",
  usages: "change (paste cookies json here)",
  cooldowns: 5,
  dependencies: {}
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const { ADMINBOT, OWNER, OPERATOR } = global.config;

  const isAuthorized =
    ADMINBOT.includes(senderID) ||
    OWNER.includes(senderID) ||
    OPERATOR.includes(senderID);

  if (!isAuthorized) {
    return api.sendMessage("⛔ You are not authorized to use this command.", threadID, messageID);
  }

  const body = (event.body || "").trim();

  const subcommand = args[0] ? args[0].toLowerCase() : "";

  if (subcommand !== "change") {
    return api.sendMessage(
      `📋 Usage:\n!appstate change (paste your cookies JSON here)\n\nExample:\n!appstate change ([{"key":"c_user","value":"..."}])`,
      threadID,
      messageID
    );
  }

  const match = body.match(/!appstate\s+change\s*\((.+)\)\s*$/s);
  if (!match) {
    return api.sendMessage(
      `❌ Invalid format.\n\nCorrect usage:\n!appstate change (paste cookies JSON here)\n\nMake sure to wrap the cookies inside ( )`,
      threadID,
      messageID
    );
  }

  const rawCookies = match[1].trim();

  let parsed;
  try {
    parsed = JSON.parse(rawCookies);
  } catch (e) {
    return api.sendMessage(
      `❌ Invalid JSON format inside the brackets.\n\nError: ${e.message}\n\nMake sure you paste a valid cookies JSON array.`,
      threadID,
      messageID
    );
  }

  if (!Array.isArray(parsed)) {
    return api.sendMessage(
      "❌ The cookies must be a JSON array (starting with [ and ending with ]).",
      threadID,
      messageID
    );
  }

  const appstatePath = path.join(__dirname, "../../appstate.json");

  try {
    fs.writeFileSync(appstatePath, JSON.stringify(parsed, null, "\t"), "utf8");
    api.sendMessage(
      `✅ Appstate updated successfully!\n\n• ${parsed.length} cookies saved.\n• The bot will now restart to apply the new session.`,
      threadID,
      () => process.exit(1)
    );
  } catch (err) {
    return api.sendMessage(
      `❌ Failed to write appstate.json\n\nError: ${err.message}`,
      threadID,
      messageID
    );
  }
};
