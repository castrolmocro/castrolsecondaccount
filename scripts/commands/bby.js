const axios = require("axios");
const baseApiUrl = "https://simsimi-fun.vercel.app";

module.exports.config = {
  name: "bby",
  version: "3.1.0",
  permission: 0,
  credits: "IMRAN",
  description: "Cute AI bot with Simsimi API + online teach feature",
  prefix: false,
  premium: false,
  category: "chat",
  usages: "[your message]",
  cooldowns: 0
};

const cuteReplies = [
  "হ্যাঁ জানু 😘",
  "বলো বাবু 💖",
  "শুনছি জান 🥰",
  "কি হইছে বলো তো? 😏"
];

module.exports.run = async ({ api, event, args }) => {
  const { threadID, messageID, senderID } = event;
  const input = args.join(" ").trim();

  // Just "imu"
  if (!input) {
    const reply = cuteReplies[Math.floor(Math.random() * cuteReplies.length)];
    return api.sendMessage(reply, threadID, (err, info) => {
      if (!err) global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        author: senderID
      });
    }, messageID);
  }

  // Teach mode
  if (input.toLowerCase().startsWith("teach ")) {
    const content = input.slice(6).trim();
    const [ask, ans] = content.split("=").map(s => s.trim());

    if (!ask || !ans) {
      return api.sendMessage("❌ সঠিক ফরম্যাট ব্যবহার করো:\nimu teach প্রশ্ন = উত্তর", threadID, messageID);
    }

    try {
      const teachURL = `${baseApiUrl}/teach?ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}`;
      const res = await axios.get(teachURL);
      if (res.data.data.ask && res.data.data.ans) {
        return api.sendMessage(`✅ শেখা সম্পন্ন:\n❓ ${res.data.data.ask}\n💬 ${res.data.data.ans}`, threadID, messageID);
      } else {
        return api.sendMessage("❌ শেখাতে ব্যর্থ! পরে আবার চেষ্টা করো।", threadID, messageID);
      }
    } catch (err) {
      console.error("Teach API Error:", err.message);
      return api.sendMessage("⚠️ Teach API তে সমস্যা হয়েছে!", threadID, messageID);
    }
  }

  // Normal Chat
  try {
    const res = await axios.get(`${baseApiUrl}/sim?text=${encodeURIComponent(input)}`);
    const reply = res.data.reply || "🤔 আমি ঠিক বুঝতে পারিনি, আবার বলো তো!";
    return api.sendMessage(reply, threadID, (err, info) => {
      if (!err) global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        author: senderID
      });
    }, messageID);
  } catch (err) {
    console.error("Chat API Error:", err.message);
    return api.sendMessage("⚠️ উত্তর আনতে সমস্যা হয়েছে!", threadID, messageID);
  }
};

module.exports.handleReply = async ({ api, event, handleReply }) => {
  const { threadID, messageID, senderID, body } = event;
  if (handleReply.author !== senderID) return;

  try {
    const res = await axios.get(`${baseApiUrl}/sim?text=${encodeURIComponent(body)}`);
    const reply = res.data.reply || "🤔 আমি বুঝতে পারিনি, আরেকটু সহজ করে বলো।";
    return api.sendMessage(reply, threadID, (err, info) => {
      if (!err) global.client.handleReply.push({
        name: module.exports.config.name,
        messageID: info.messageID,
        author: senderID
      });
    }, messageID);
  } catch (err) {
    console.error("Reply Error:", err.message);
    return api.sendMessage("⚠️ উত্তর আনতে সমস্যা হয়েছে!", threadID, messageID);
  }
};
  
