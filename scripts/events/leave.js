const axios = require("axios");

module.exports.config = {
  name: "leave",
  eventType: ["log:unsubscribe"],
  version: "1.0.0",
  credits: "Imran",
  description: "Notify when a member leaves or gets kicked from the group.",
};

module.exports.run = async function({ api, event, Users, Threads }) {
  if (event.logMessageData?.leftParticipantFbId == api.getCurrentUserID()) return;
  
  const { threadID } = event;
  const threadData = global.data.threadData.get(parseInt(threadID)) || (await Threads.getData(threadID)).data;
  const userID = event.logMessageData?.leftParticipantFbId;
  if (!userID) return;
  const kickerID = event.author;
  
  // Get names
  const userName = global.data.userName.get(userID) || (await Users.getNameUser(userID));
  let kickerName = kickerID && kickerID !== userID ?
    global.data.userName.get(kickerID) || (await Users.getNameUser(kickerID)) :
    null;
  
  // Get group name
  const boxName = global.data.threadInfo.get(threadID)?.threadName || (await api.getThreadInfo(threadID)).threadName;
  
  // English messages with status indicators
  let message;
  if (kickerID === userID) {
    message = `🚪 | 𝐋𝐞𝐟𝐭 𝐌𝐞𝐦𝐛𝐞𝐫\n━━━━━━━━━━━━━━━━━━\n❏ 𝐍𝐚𝐦𝐞: ${userName}\n❏ 𝐆𝐫𝐨𝐮𝐩: ${boxName}\n\n${userName} has left the group 😔\nWe'll miss you and wish you all the best! ❤️`;
  } else {
    message = `🛑 | 𝐌𝐞𝐦𝐛𝐞𝐫 𝐑𝐞𝐦𝐨𝐯𝐞𝐝\n━━━━━━━━━━━━━━━━━━\n❏ 𝐍𝐚𝐦𝐞: ${userName}\n❏ 𝐆𝐫𝐨𝐮𝐩: ${boxName}\n❏ 𝐑𝐞𝐦𝐨𝐯𝐞𝐝 𝐛𝐲: ${kickerName || "System"}\n\n${userName} was removed from the group ⚠️\nPlease ensure to follow group rules next time. 🙏`;
  }
  
  // Custom message handling
  if (typeof threadData.customLeave === "string" && threadData.customLeave.trim() !== "") {
    const typeReplacement = kickerID === userID ? "left voluntarily" : "was removed";
    message = threadData.customLeave
      .replace(/\{name\}/g, userName)
      .replace(/\{type\}/g, typeReplacement)
      .replace(/\{boxName\}/g, boxName)
      .replace(/\{kickerName\}/g, kickerName || "System");
  }
  
  try {
    
    const apiu = "https://raw.githubusercontent.com/MR-IMRAN-60/ImranBypass/refs/heads/main/imran.json";
  const config = await axios.get(apiu);
  const res = config.data.wlc;
    const byeApiUrl = `${res}/api/bye?uid=${encodeURIComponent(userID)}&user_name=${encodeURIComponent(userName)}&owner_name=${encodeURIComponent("IMRAN AHMED")}&theme=dark`;
    
    const response = await axios.get(byeApiUrl, {
      responseType: "stream",
      validateStatus: (status) => status === 200,
    });
    
    return api.sendMessage(
      {
        body: message,
        attachment: response.data,
      },
      threadID
    );
  } catch (err) {
    console.error("Leave image failed:", err);
    return api.sendMessage(message, threadID);
  }
};
