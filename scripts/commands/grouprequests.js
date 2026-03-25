module.exports.config = {
  name: "groups",
  version: "1.0.0",
  permission: 2,
  credits: "imran",
  prefix: false,
  premium: false,
  description: "View and accept/decline pending group chat requests",
  category: "admin",
  usages: "groups",
  cooldowns: 5
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  if (String(event.senderID) !== String(handleReply.author)) return;

  const { body, threadID, messageID, senderID } = event;
  const list = handleReply.pending;
  const input = (body || "").trim().toLowerCase();

  let name = "Admin";
  try {
    const info = await api.getUserInfo(senderID);
    name = info[senderID]?.name || "Admin";
  } catch (e) {}

  const isDecline = input.startsWith("c") || input.startsWith("d");

  if (input === "all") {
    let count = 0;
    for (const group of list) {
      try {
        await api.sendMessage(`✅ Your group has been accepted!\n\nApproved by: ${name}`, group.threadID);
        count++;
      } catch (e) {}
    }
    return api.sendMessage(`✅ Accepted all ${count} group(s).`, threadID, messageID);
  }

  if (input === "call" || input === "dall") {
    let count = 0;
    for (const group of list) {
      try {
        await api.removeUserFromGroup(api.getCurrentUserID(), group.threadID);
        count++;
      } catch (e) {}
    }
    return api.sendMessage(`❌ Declined and left all ${count} group(s).`, threadID, messageID);
  }

  const rawNumbers = input.replace(/^[a-z]+\s*/i, "").trim().split(/\s+/);
  const results = [];
  const failed = [];

  for (const num of rawNumbers) {
    const index = parseInt(num) - 1;
    if (isNaN(index) || index < 0 || index >= list.length) {
      failed.push(num);
      continue;
    }
    const group = list[index];
    try {
      if (isDecline) {
        await api.removeUserFromGroup(api.getCurrentUserID(), group.threadID);
        results.push(`❌ Declined: ${group.name || group.threadID}`);
      } else {
        await api.sendMessage(
          `✅ Your group has been accepted!\n\nApproved by: ${name}`,
          group.threadID
        );
        results.push(`✅ Accepted: ${group.name || group.threadID}`);
      }
    } catch (e) {
      failed.push(`${num} (error)`);
    }
  }

  let reply = results.join("\n");
  if (failed.length > 0) reply += `\n\n⚠️ Failed: ${failed.join(", ")}`;
  return api.sendMessage(reply || "Nothing done.", threadID, messageID);
};

module.exports.run = async function ({ api, event }) {
  const { threadID, messageID } = event;

  let list = [];
  try {
    const spam = await api.getThreadList(100, null, ["OTHER"]) || [];
    const pending = await api.getThreadList(100, null, ["PENDING"]) || [];
    list = [...spam, ...pending].filter(g => g.isSubscribed && g.isGroup);
  } catch (e) {
    return api.sendMessage("❌ Could not fetch pending groups.", threadID, messageID);
  }

  if (list.length === 0) {
    return api.sendMessage("✅ No pending group requests right now.", threadID, messageID);
  }

  let msg = `📋 Pending Group Requests — ${list.length} total\n`;
  msg += "━━━━━━━━━━━━━━━━━━━━\n\n";
  list.forEach((g, i) => {
    msg += `${i + 1}. ${g.name || "Unnamed Group"}\n`;
    msg += `   ID: ${g.threadID}\n\n`;
  });
  msg += "━━━━━━━━━━━━━━━━━━━━\n";
  msg += "Reply with:\n";
  msg += "• 1 2 3   → accept those groups\n";
  msg += "• c1 c2   → decline those groups\n";
  msg += "• all     → accept all\n";
  msg += "• call    → decline all";

  return api.sendMessage(msg, threadID, (err, info) => {
    if (err || !info) return;
    global.client.handleReply.push({
      name: this.config.name,
      messageID: info.messageID,
      author: event.senderID,
      pending: list
    });
  }, messageID);
};