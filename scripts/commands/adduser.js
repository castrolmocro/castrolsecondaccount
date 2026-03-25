module.exports.config = {
  name: "adduser",
  version: "1.0.0",
  permission: 0,
  credits: "IMRAN",
  description: "Add users to group using profile link or UID",
  prefix: false,
  premium: false,
  category: "Group",
  usages: "<link/UID>",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args, Threads, Users }) => {
  const axios = require('axios');
  const { threadID, messageID } = event;
  const link = args.join(" ");

  if (!args[0]) return api.sendMessage('Please provide a Facebook profile link or UID to add!', threadID, messageID);

  try {
    const { participantIDs, approvalMode, adminIDs } = await api.getThreadInfo(threadID);
    
    let uidUser;
    if (link.includes(".com/")) {
      const res = await axios.get(`https://golike.com.vn/func-api.php?user=${link}`);
      uidUser = res.data.data.uid;
    } else {
      uidUser = link;
    }

    if (participantIDs.includes(uidUser)) {
      return api.sendMessage('🌸 This user is already in the group! 🌸', threadID, messageID);
    }

    await api.addUserToGroup(uidUser, threadID, (err) => {
      if (err) {
        return api.sendMessage('Failed to add user to the group!', threadID, messageID);
      }
      
      if (approvalMode && !adminIDs.some(item => item.id === api.getCurrentUserID())) {
        api.sendMessage('✅ Successfully added to approval list!', threadID, messageID);
      } else {
        api.sendMessage('🌸 Successfully added to the group! 🌸', threadID, messageID);
      }
    });

  } catch (error) {
    console.error(error);
    return api.sendMessage('An error occurred while processing your request!', threadID, messageID);
  }
};
