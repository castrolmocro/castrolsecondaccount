const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs");

module.exports.config = {
  name: "fbcover", // Command name
  version: "1.0.0", // Command version
  permission: 0, // Permission level (0: all)
  credits: "Mohammad Nayan", // Creator of the code
  description: "Generate a Facebook cover image", // Command description
  prefix: false, // Use prefix
  premium: false, // Premium feature
  category: "Image", // Command category
  usages: "fbcover name - subname - address - email - phone - color", // Usage
  cooldowns: 2 // Cooldown in seconds
};

module.exports.run = async ({ api, event, args, Threads, Users, getText }) => {
  const uid = event.senderID;
  const info = args.join(" ");
  const apis = await axios.get('https://raw.githubusercontent.com/MOHAMMAD-NAYAN-07/Nayan/main/api.json');
  const n = apis.data.api;

  const id = Object.keys(event.mentions)[0] || event.senderID;
  const nam = await Users.getNameUser(id);

  if (!info) {
    return api.sendMessage(
      "Please enter in the format:\nfbcover name - subname - address - email - phone nbr - color (default = no)",
      event.threadID
    );
  }

  const msg = info.split("-");
  const name = msg[0]?.trim() || "";
  const subname = msg[1]?.trim() || "";
  const address = msg[2]?.trim() || "";
  const email = msg[3]?.trim() || "";
  const phone = msg[4]?.trim() || "";
  const color = msg[5]?.trim() || "no";

  api.sendMessage(`Processing your cover, please wait...`, event.threadID, (err, info) =>
    setTimeout(() => {
      api.unsendMessage(info.messageID);
    }, 5000)
  );

  const img = `${n}/fbcover/v1?name=${encodeURIComponent(name)}&uid=${id}&address=${encodeURIComponent(address)}&email=${encodeURIComponent(email)}&subname=${encodeURIComponent(subname)}&sdt=${encodeURIComponent(phone)}&color=${encodeURIComponent(color)}`;

  try {
    const response = await axios.get(img, { responseType: 'arraybuffer' });
    const image = await jimp.read(response.data);
    const outputPath = `./fbcover_${uid}.png`;
    await image.writeAsync(outputPath);

    const attachment = fs.createReadStream(outputPath);
    api.sendMessage({
      body:
        `◆━━━━━━━━◆◆━━━━━━━━◆\n` +
        `🔴INPUT NAME: ${name}\n` +
        `🔵INPUT SUBNAME: ${subname}\n` +
        `📊ADDRESS: ${address}\n` +
        `✉️EMAIL: ${email}\n` +
        `☎️PHONE NO.: ${phone}\n` +
        `🎇COLOUR: ${color}\n` +
        `🆔USER: ${nam}\n` +
        `◆━━━━━━━━◆◆━━━━━━━━◆`,
      attachment
    }, event.threadID, () => fs.unlinkSync(outputPath));
  } catch (error) {
    console.error(error);
    api.sendMessage("An error occurred while generating the FB cover.", event.threadID);
  }
};
