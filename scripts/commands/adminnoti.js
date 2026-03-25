const fs = require('fs');
const path = require('path');
const request = require('request');
const moment = require("moment-timezone");

module.exports.config = {
  name: "adminnoti",
  version: "2.0.0",
  permission: 2,
  credits: "IMRAN",
  description: "Send a broadcast message to all groups and allow reply flow",
  prefix: true,
  premium: false,
  category: "admin",
  usages: "[message]",
  cooldowns: 5,
};

let cacheFiles = [];

const downloadAttachments = (attachments, body) => new Promise(async (resolve) => {
  const msgData = { body };
  const downloads = [];

  for (const att of attachments) {
    await new Promise(res => {
      const ext = att.url.split('.').pop().split('?')[0];
      const filePath = path.join(__dirname, "cache", `${att.filename}.${ext}`);

      request(att.url)
        .pipe(fs.createWriteStream(filePath))
        .on("close", () => {
          cacheFiles.push(filePath);
          downloads.push(fs.createReadStream(filePath));
          res();
        });
    });
  }

  msgData.attachment = downloads;
  resolve(msgData);
});

module.exports.handleReply = async ({ api, event, handleReply, Users, Threads }) => {
  const { threadID, messageID, senderID, body, attachments } = event;
  const time = moment.tz("Asia/Manila").format("DD/MM/YYYY - HH:mm:ss");
  const senderName = await Users.getNameUser(senderID);

  switch (handleReply.type) {
    case "sendnoti": {
      let msg = `🗨️ 𝙍𝙚𝙥𝙡𝙮 𝙍𝙚𝙘𝙚𝙞𝙫𝙚𝙙\n\n👤 𝙁𝙧𝙤𝙢: ${senderName}\n🕒 𝙏𝙞𝙢𝙚: ${time}\n💬 𝙈𝙚𝙨𝙨𝙖𝙜𝙚: ${body}\n📍 𝙂𝙧𝙤𝙪𝙥: ${(await Threads.getInfo(threadID)).threadName || "Unknown"}\n\n🔁 𝙍𝙚𝙥𝙡𝙮 𝙩𝙤 𝙘𝙤𝙣𝙩𝙞𝙣𝙪𝙚.`;
      if (attachments.length > 0) {
        msg = await downloadAttachments(attachments, msg);
      }
      api.sendMessage(msg, handleReply.threadID, (err, info) => {
        clearFiles();
        global.client.handleReply.push({
          name: this.config.name,
          type: "reply",
          messageID: info.messageID,
          messID: messageID,
          threadID
        });
      });
      break;
    }

    case "reply": {
      let msg = `📨 𝘼𝙙𝙢𝙞𝙣 𝙍𝙚𝙨𝙥𝙤𝙣𝙨𝙚\n\n👤 𝘼𝙙𝙢𝙞𝙣: ${senderName}\n💬 𝙈𝙚𝙨𝙨𝙖𝙜𝙚:『 ${body} 』\n\n🔁 𝙍𝙚𝙥𝙡𝙮 𝙖𝙜𝙖𝙞𝙣 𝙩𝙤 𝙠𝙚𝙚𝙥 𝙩𝙝𝙚 𝙘𝙤𝙣𝙫𝙚𝙧𝙨𝙖𝙩𝙞𝙤𝙣 𝙜𝙤𝙞𝙣𝙜.`;
      if (attachments.length > 0) {
        msg = await downloadAttachments(attachments, msg);
      }
      api.sendMessage(msg, handleReply.threadID, (err, info) => {
        clearFiles();
        global.client.handleReply.push({
          name: this.config.name,
          type: "sendnoti",
          messageID: info.messageID,
          threadID
        });
      }, handleReply.messID);
      break;
    }
  }
};

module.exports.run = async ({ api, event, args, messageReply, Users }) => {
  const { threadID, senderID, type, messageID } = event;
  if (!args[0]) return api.sendMessage("⚠️ Please enter a message to send.", threadID);

  const time = moment.tz("Asia/Manila").format("DD/MM/YYYY - HH:mm:ss");
  const senderName = await Users.getNameUser(senderID);
  const allThreads = global.data.allThreadID || [];

  let delivered = 0, failed = 0;

  let msgContent = `📢 𝘼𝙙𝙢𝙞𝙣 𝘽𝙧𝙤𝙖𝙙𝙘𝙖𝙨𝙩 𝘼𝙡𝙚𝙧𝙩\n\n👤 𝘽𝙮: ${senderName}\n🕒 𝙏𝙞𝙢𝙚: ${time}\n📝 𝙈𝙚𝙨𝙨𝙖𝙜𝙚: ${args.join(" ")}\n\n🔁 𝙍𝙚𝙥𝙡𝙮 𝙩𝙤 𝙧𝙚𝙨𝙥𝙤𝙣𝙙 𝙙𝙞𝙧𝙚𝙘𝙩𝙡𝙮 𝙩𝙤 𝙖𝙙𝙢𝙞𝙣.`;

  if (type === "message_reply" && messageReply?.attachments?.length > 0) {
    msgContent = await downloadAttachments(messageReply.attachments, msgContent);
  }

  await Promise.all(allThreads.map(thread => {
    return new Promise(res => {
      api.sendMessage(msgContent, thread, (err, info) => {
        if (err) failed++;
        else {
          delivered++;
          global.client.handleReply.push({
            name: module.exports.config.name,
            type: "sendnoti",
            messageID: info.messageID,
            messID: messageID,
            threadID: thread
          });
        }
        res();
      });
    });
  }));

  clearFiles();
  api.sendMessage(`📬 𝘽𝙧𝙤𝙖𝙙𝙘𝙖𝙨𝙩 𝙎𝙩𝙖𝙩𝙪𝙨\n\n✅ 𝙎𝙚𝙣𝙩 𝙩𝙤: ${delivered} 𝙜𝙧𝙤𝙪𝙥𝙨\n❌ 𝙁𝙖𝙞𝙡𝙚𝙙: ${failed} 𝙜𝙧𝙤𝙪𝙥𝙨`, threadID);
};

function clearFiles() {
  for (const file of cacheFiles) {
    if (fs.existsSync(file)) fs.unlinkSync(file);
  }
  cacheFiles = [];
}