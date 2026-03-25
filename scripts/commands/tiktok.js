const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = { 
  name: "tiktok",
  version: "1.1.3",
  permission: 0,
  credits: "Imran",
  prefix: false,
  description: "এআই দিয়ে খুঁজে এনে টিকটক ভাইরাল ভিডিও পাঠায়",
  category: "Entertainment",
  premium: false,
  usages: "[সার্চ শব্দ]",
  cooldowns: 15,
  dependencies: {
    "axios": "",
    "fs-extra": ""
  }
};

module.exports.run = async function({ api, event, args }) {
  const { threadID, messageID, senderID } = event;

  const style = {
    name: "『 𝚅𝙸𝚁𝙰𝙻 𝚅𝙸𝙳𝙴𝙾 』",
    symbol: "🎬",
    line: "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬",
    cooldownMessage: "⏳ দয়া করে %1 সেকেন্ড অপেক্ষা করুন!"
  };

  const cooldown = global.cooldown || {};
  if (cooldown[module.exports.config.name] && cooldown[module.exports.config.name][senderID] > Date.now()) {
    const remaining = Math.ceil((cooldown[module.exports.config.name][senderID] - Date.now()) / 1000);
    return api.sendMessage(style.cooldownMessage.replace("%1", remaining), threadID, messageID);
  }

  try {
    let selectedQuery;

    if (args.length > 0) {
      // ইউজার সার্চ দিলে সেটাই নেবে
      selectedQuery = args.join(" ");
    } else {
      // ইউজার কিছু না দিলে র‍্যান্ডম ভাবে নিচের যেকোনোটা নেবে
      const fallbackQueries = [
  "_nure_alam_017_",
  "biddut__editor__30",
  "habib___editz___888",
  "momin.editz143",
  "salim_editz2",
  "lyrics_rabby5",
  "nafisa.nur29",
  "miss_pakhi18",
  "__sakib__editz__10",
  "editor...bhaiya",
  "njr_774",
  "_safwan_shakib",
  ".brokenhard2.0",
  "nisho_jibon_mks",
  "shuvo_biswas10",
  "zihadkhan7887",
  "its_your_atik_007",
  "forhan.rajib.2.0",
  "rj.sohel.rana12",
  "smtamijuddin",
  "a.m.masud4924",
  "sayan_xyz",
  "mr.mahim5",
  "nayan_moni.02",
  "shinereja170"
];
      selectedQuery = fallbackQueries[Math.floor(Math.random() * fallbackQueries.length)];
    }

    const encodedQuery = encodeURIComponent(selectedQuery);
    const apiResponse = await axios.get(`https://masterapi.fun/api/tiksarch?search=${encodedQuery}`);
    const videoUrl = apiResponse.data.play_url;

    if (!videoUrl) throw new Error("ভিডিও লিংক পাওয়া যায়নি।");

    const videoData = await axios.get(videoUrl, { responseType: 'arraybuffer' });
    const fileName = `${Date.now()}_viral.mp4`;
    const filePath = __dirname + `/cache/${fileName}`;
    await fs.writeFile(filePath, Buffer.from(videoData.data, 'binary'));

    const userInfo = await api.getUserInfo(senderID);
    const senderName = userInfo[senderID]?.name || "ব্যবহারকারী";

    api.sendMessage({
      body: `${style.symbol} ${style.name}\n${style.line}\n👤 Requested by: @${senderName}\n🔍 Search: ${selectedQuery}\n${style.line}`,
      mentions: [{
        tag: `@${senderName}`,
        id: senderID
      }],
      attachment: fs.createReadStream(filePath)
    }, threadID, async () => {
      await fs.unlink(filePath);
    });

    if (!cooldown[module.exports.config.name]) cooldown[module.exports.config.name] = {};
    cooldown[module.exports.config.name][senderID] = Date.now() + module.exports.config.cooldowns * 1000;
    global.cooldown = cooldown;

  } catch (error) {
    console.error("Viral Video Error:", error);
    api.sendMessage(`❌ ভিডিও আনতে ব্যর্থ!\nসমস্যা: ${error.message}`, threadID, messageID);
  }
};