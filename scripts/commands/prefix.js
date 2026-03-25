module.exports.config = {
  name: "prefix",
  version: "1.0.0",
  permission: 0,
  credits: "IMRAN",
  prefix: true,
  description: "Show bot prefix",
  category: "system",
  premium: false,
  usages: "",
  cooldowns: 5,
};

module.exports.handleEvent = async ({ event, api, Threads }) => {
  const { threadID, messageID, body } = event;
  const threadData = await Threads.getData(threadID);
  const data = threadData?.data || {};
  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
  const prefix = threadSetting.PREFIX || global.config.PREFIX;

  const queries = [
    "prefix", "mprefix", "mpre", "command mark",
    "what is the prefix of the bot?", "PREFIX"
  ];

  for (const query of queries) {
    const lowerBody = body?.toLowerCase()?.trim();
    if (lowerBody === query.toLowerCase()) {
      return api.sendMessage(
        `🌟 𝑽𝑰𝑷 𝑷𝒓𝒆𝒇𝒊𝒙 𝑮𝒖𝒊𝒅𝒆 🌟\n\n` +
        `🪄 Current prefix of the bot: [ ${prefix} ]\n` +
        `⚙️ Use "${prefix}help" to view all commands!\n\n` +
        `👑 Stay VIP, Stay Awesome!`,
        threadID, messageID
      );
    }
  }
};

module.exports.run = async ({ event, api }) => {
  const prefix = global.config.PREFIX;
  return api.sendMessage(
    `📌 Use this prefix: [ ${prefix} ]\nType "${prefix}help" for the command list.`,
    event.threadID
  );
};