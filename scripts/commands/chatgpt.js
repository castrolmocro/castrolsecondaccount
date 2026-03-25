module.exports.config = {
  name: "chatgpt",
  names: ["ai", "bot"],
  version: "1.1.0",
  permission: 0,
  credits: "ryuko",
  description: "",
  prefix: false,
  premium: true,
  category: "without prefix",
  usage: "chatgpt (question)",
  cooldowns: 3,
  dependency: {
    "axios": ""
  }
};

module.exports.run = async function ({api, event, args}) {
  try{
  const axios = require('axios');
  const {sensui} = global.apiryuko
  let ask = args.join(' ');
  if (!ask) {
    return api.sendMessage('please provide a question.', event.threadID, event.messageID)
  }
      var IDs = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
      var randomIDs = Math.floor(Math.random() * IDs.length);

  const res = await axios.get(`https://ccprojectapis.ddns.net/api/gptconvo?ask=${ask}&id=${randomIDs}`);
  const reply = res.data.response;
  if (res.error) {
    return api.sendMessage('having some unexpected error while fetching api.', event.threadID, event.messageID)
  } else {
    return api.sendMessage(`${reply}`, event.threadID, event.messageID)
  }
  } catch (error) {
    return api.sendMessage('having some unexpected error', event.threadID, event.messageID)
  }
}