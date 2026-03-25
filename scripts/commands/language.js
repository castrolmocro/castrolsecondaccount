module.exports.config = {
  name: "language",
  version: "1.0.0",
  permission: 2,
  prefix: true,
  credits: "ryuko",
  description: "change the bot language",
  premium: false,
  category: "admin",
  usages: "[vi] [en] [ar] [bd] [bs] [tl]",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args, getText }) => {
  let operator = global.config.OPERATOR;
  if (!operator.includes(event.senderID)) return api.sendMessage(`only bot operators can use this command.`, event.threadID, event.messageID);
  const { threadID, messageID } = event;

  if (!args[0]) return api.sendMessage("Syntax error, use: language [vi/en/ar/bd/bs/tl]", threadID, messageID);

  const lang = args[0].toLowerCase();
  const languages = {
    "vi": "Tiếng Việt",
    "en": "English",
    "ar": "Arabic",
    "bd": "Bengali",
    "bs": "Bosnian",
    "tl": "Tagalog"
  };

  if (languages[lang]) {
    const fs = require('fs-extra');
    const path = require('path');
    const configPath = path.join(__dirname, '../../Config.json');
    global.config.language = lang;
    fs.writeFileSync(configPath, JSON.stringify(global.config, null, 2));
    
    // Force reload language in system if possible
    if (global.getText) {
        // Some systems need a reload trigger
    }
    
    return api.sendMessage(`Language has been set to ${languages[lang]}. Please restart the bot if changes don't apply immediately.`, threadID, messageID);
  } else {
    return api.sendMessage("Unsupported language. Available: vi, en, ar, bd, bs, tl", threadID, messageID);
  }
}