module.exports.config = {
  name: "castrol",
  version: "1.0.0",
  permission: 0,
  credits: "l7wak",
  description: "l7wak",
  prefix: true,
  category: "system",
  usages: "[page]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args }) {
  const { threadID } = event;
  const { commands } = global.client;

  const commandList = Array.from(commands.values());
  const itemsPerPage = 10;
  const totalPages = Math.ceil(commandList.length / itemsPerPage);

  let page = parseInt(args[0]) || 1;
  if (page < 1) page = 1;
  if (page > totalPages) page = totalPages;

  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;

  const currentCommands = commandList.slice(start, end);

  const emojis = ["🌪","🗞","🕷","🪭","☁"];

  let msg = `ꤲ 𝐁꙲𝗼ȶ 𐺔͢ ⃟🔵 𝕮͜𝐚𝐬𝐭͡𝐫𝐨͜𝐥 🇰🇮\n\n`;
  msg += `َ          ៹࣪. َ 𝐂҈𝐨𝐦͡𝐦͜𝐚𝐧͢𝐝𝐬↴ ꗹ\n\n`;

  let count = start + 1;

  for (let i = 0; i < currentCommands.length; i++) {
    const cmd = currentCommands[i];
    const emoji = emojis[i % emojis.length];

    msg += `⪼ ⁽ ${cmd.config.name} ₎ ${emoji}\n\n`;
    count++;
  }

  msg += `\n〔☬〕Ƥ͜𝐚𝐠͡𝐞 ${page}/${totalPages} 🔰\n`;
  msg += `---------------------------------------\n\n`;
  msg += `👑 ⏤͟͟͞͞ َ𝕾̸̷̶ 𝐂𝖆͜𝖘𝖙͡𝖗𝖔𝖑 • 𝕷̷̸̶͜𝗜̶𝗦̶͡𝗧̶  -   🀩`;

  return api.sendMessage(msg, threadID);
};
