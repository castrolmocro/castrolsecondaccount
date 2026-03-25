module.exports.config = {
    name: "console",
    version: "1.0.0",
    permission: 3,
    credits: "IMRAN",
    prefix: true,
    premium: false,
    description: "",
    category: "system",
    usages: "",
    cooldowns: 0
};
module.exports.handleEvent = async function ({ api, args, Users, event, Threads, utils, client }) {
  let { messageID, threadID, senderID, mentions } = event;
  const chalk = require('chalk');
  const moment = require("moment-timezone");
  var time = moment.tz("Asia/Dhaka").format("LLLL");   
  const thread = global.data.threadData.get(event.threadID) || {};
  if (typeof thread["console"] !== "undefined" && thread["console"] == true) return;
  if (event.senderID == global.data.botID) return;

  let nameBox;
  let userorgroup;
  let threadid;
  let Imran;
  let Imran1;

  try {
    const isGroup = await global.data.threadInfo.get(event.threadID).threadName || "name does not exist";
    nameBox = `${isGroup}\n`;
    threadid = `${threadID}\n`;
    Imran = chalk.hex("#00FFFF").bold('➤ Group Name : ');
    Imran1 = chalk.hex("#00FFFF").bold('➤ Group ID : ');
    userorgroup = chalk.hex("#FF00FF").bold("♝ Group Chat Message ♝");
  } catch (error) {
    Imran = "";
    Imran1 = "";
    threadid = "";
    nameBox = "";
    userorgroup = chalk.hex("#FF00FF").bold("♝ Private Chat Message ♝");
  }

  var nameUser = await Users.getNameUser(event.senderID)
  var msg = event.body || "photos, videos or special characters";

  console.log(
    '\n' + chalk.hex("#00FF00")(`⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯`) + 
    chalk.hex("#FFA500")(`\n             ${userorgroup}\n`) +
    chalk.hex("#00FF00")(`⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n`) +
    `\n${Imran}${chalk.hex("#ADD8E6")(nameBox)}` +
    `${Imran1}${chalk.hex("#ADD8E6")(threadid)}` +
    chalk.hex("#FF00FF").bold(`➤ User Name : `) + chalk.hex("#E6E6FA")(nameUser) + 
    '\n' + chalk.hex("#FF00FF").bold(`➤ User ID : `) + chalk.hex("#E6E6FA")(senderID) +
    '\n' + chalk.hex("#FF00FF").bold(`➤ Message : `) + chalk.hex("#FFFF00").italic(msg) +
    `\n\n` + chalk.hex("#00FF00")(`⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯`) +
    chalk.hex("#FFA500")(`\n        ${time}`) +
    `\n` + chalk.hex("#00FF00")(`⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯\n`)
  );
}

module.exports.run = async function ({ api, args, Users, event, Threads, utils, client }) {}