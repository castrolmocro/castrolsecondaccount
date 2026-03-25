module.exports.config = {
  name: "out", // Command name
  version: "1.0.0", // Command version
  permission: 2, // Permission level (2: bot admins)
  credits: "IMRAN", // Original creator
  description: "Remove bot from group", // Command description
  prefix: false, // Use prefix (true/false)
  premium: false, // Premium-only command (true/false)
  category: "Admin", // Command category
  usages: "leave [tid]", // Command usage
  cooldowns: 3 // Cooldown in seconds
};

module.exports.run = async ({ api, event, args, Threads, Users, getText }) => {
  const tid = args.join(" ");
  if (!tid) {
    return api.removeUserFromGroup(api.getCurrentUserID(), event.threadID);
  } else {
    return api.removeUserFromGroup(api.getCurrentUserID(), tid, () => {
      api.sendMessage("The bot has left this group", event.threadID, event.messageID);
    });
  }
};
