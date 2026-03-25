const fs = require('fs-extra');
const path = require('path');
const statePath = path.join(__dirname, 'angel_state.json');

const DEFAULT_TEXT = "𝗫. 𖠄⃪͜͡🌪ـ, 𝗤. 𖤛⃪͜͡🌪ـ, 𝗫. 𖠄⃪͜͡🌪ـ, 𝗤. 𖤛⃪͜͡🌪ـ, 𝗫. 𖠄⃪͜͡🌪ـ, 𝗤. 𖤛⃪͜͡🌪ـ, 𝗫. 𖠄⃪͜͡🌪ـ, 𝗤. 𖤛⃪͜͡🌪ـ, 𝗫. 𖠄⃪͜͡🌪ـ, 𝗤. 𖤛⃪͜͡🌪ـ, 𝗫. 𖠄⃪͜͡🌪ـ, 𝗤. 𖤛⃪͜͡🌪ـ, 𝗫. 𖠄⃪͜͡🌪ـ, 𝗤. 𖤛⃪͜͡🌪ـ, 𝗫. 𖠄⃪͜͡🌪ـ, 𝗤. 𖤛⃪͜͡🌪ـ,";

if (!global.angelTimes) global.angelTimes = {};

module.exports.config = {
  name: "angel",
  version: "1.3.0",
  hasPermission: 1,
  credits: "imran",
  description: "Send a message periodically to a group, survives restarts",
  category: "admin",
  prefix: true,
  usages: "!angel | !angel stop | !angel change [text] | !angel time [seconds]",
  cooldowns: 5
};

module.exports.onLoad = async function ({ api }) {
  if (!fs.existsSync(statePath)) return;
  try {
    const state = await fs.readJson(statePath);
    if (state.active && state.threadID) {
      console.log(`[ANGEL] Resuming for thread ${state.threadID}`);
      global.angelTimes[state.threadID] = (state.time || 30) * 1000;
      startAngel(api, state.threadID, state.text || DEFAULT_TEXT);
    }
  } catch (e) {
    console.error("[ANGEL] Error loading state:", e);
  }
};

function startAngel(api, threadID, text) {
  if (global.angelIntervals && global.angelIntervals[threadID]) {
    clearInterval(global.angelIntervals[threadID]);
  }
  if (!global.angelIntervals) global.angelIntervals = {};

  global.angelIntervals[threadID] = setInterval(async () => {
    try {
      const currentState = fs.existsSync(statePath) ? await fs.readJson(statePath) : {};
      const msg = currentState.text || text || DEFAULT_TEXT;
      await api.sendMessage(msg, threadID);
    } catch (e) {
      console.error(e);
    }
  }, (global.angelTimes[threadID] || 30000));
}

module.exports.run = async function ({ api, event, args }) {
  const { threadID, senderID } = event;

  const admins = [
    ...(global.config.ADMINBOT || []),
    ...(global.config.OPERATOR || []),
    ...(global.config.OWNER || [])
  ].map(String);

  if (!admins.includes(String(senderID))) {
    return api.sendMessage("❌ Admins only.", threadID);
  }

  const sub = (args[0] || "").toLowerCase();

  if (sub === "stop") {
    if (global.angelIntervals && global.angelIntervals[threadID]) {
      clearInterval(global.angelIntervals[threadID]);
      delete global.angelIntervals[threadID];
    }
    const current = fs.existsSync(statePath) ? await fs.readJson(statePath) : {};
    await fs.writeJson(statePath, { ...current, active: false });
    return api.sendMessage("Angel Engine stopped ⏹️.", threadID);
  }

  if (sub === "change") {
    const newText = args.slice(1).join(" ");
    if (!newText) {
      return api.sendMessage(
        "⚠️ Usage: !angel change [your text here]\n\nExample:\n!angel change Hello everyone! 👋",
        threadID
      );
    }
    const current = fs.existsSync(statePath) ? await fs.readJson(statePath) : {};
    await fs.writeJson(statePath, { ...current, text: newText });
    return api.sendMessage(
      `✅ Angel message updated!\n\nNew message:\n"${newText}"\n\nIt will be used on the next send.`,
      threadID
    );
  }

  if (sub === "time") {
    const seconds = parseInt(args[1]);
    if (!seconds || seconds < 5) {
      return api.sendMessage(
        "⚠️ Usage: !angel time [seconds]\nMinimum is 5 seconds.",
        threadID
      );
    }

    const current = fs.existsSync(statePath) ? await fs.readJson(statePath) : {};
    await fs.writeJson(statePath, { ...current, time: seconds });

    global.angelTimes[threadID] = seconds * 1000;

    if (global.angelIntervals && global.angelIntervals[threadID]) {
      clearInterval(global.angelIntervals[threadID]);
    }

    startAngel(api, threadID, current.text || DEFAULT_TEXT);

    return api.sendMessage(
      `⏱️ Time updated to ${seconds} seconds.`,
      threadID
    );
  }

  if (sub === "show") {
    const current = fs.existsSync(statePath) ? await fs.readJson(statePath) : {};
    const msg = current.text || DEFAULT_TEXT;
    return api.sendMessage(`📄 Current angel message:\n\n"${msg}"`, threadID);
  }

  const current = fs.existsSync(statePath) ? await fs.readJson(statePath) : {};
  const text = current.text || DEFAULT_TEXT;

  global.angelTimes[threadID] = (current.time || 30) * 1000;

  await fs.writeJson(statePath, { ...current, active: true, threadID, text });

  startAngel(api, threadID, text);

  api.sendMessage(
    `✅ Angel Engine is active!\n\nMessage: "${text}"\n\nSending every ${(current.time || 30)} seconds.\nUse !angel change [text] to change the message.\nUse !angel time [seconds] to change interval.\nUse !angel stop to stop.`,
    threadID
  );
};
