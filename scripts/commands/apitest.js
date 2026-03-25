const axios = require("axios");
const fs = require("fs");
const path = require("path");

const urlRegex = /^(.*?\b)?https?:\/\/[\w.-]+(:\d+)?(\/[\w-./?%&=+]*)?(\b.*)?$/i;
const tempDir = path.join(__dirname, "cache");
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

const getExtensionFromContentType = (contentType) => {
  if (!contentType) return "txt";
  const typeMap = {
    "application/pdf": "pdf",
    "audio/mpeg": "mp3",
    "audio/mp3": "mp3",
    "audio/ogg": "mp3",
    "audio/wav": "mp3",
    "audio/aac": "mp3",
    "audio/flac": "mp3",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "video/mp4": "mp4"
  };
  return typeMap[contentType.split(";")[0]] || "txt";
};

const isMediaAttachment = (contentType) => /^(image|video|audio)\//.test(contentType);

module.exports.config = {
  name: "apitest", // ✅ command name
  version: "1.0.0",
  permission: 0, // ✅ public use
  credits: "IMRAN", // ✅ your credit
  description: "Test any API endpoint with GET or POST.",
  prefix: false,
  category: "example",
  usages: "apitest <url> [post_data]",
  cooldowns: 5,
  dependencies: {
    "axios": ""
  }
};

module.exports.run = async ({ api, event, args }) => {
  if (!args.length) {
    return api.sendMessage(
      `Usage:\nGET: apitest <url>\nPOST: apitest <url> <post_data>\n\nExample:\napitest https://example.com/api/chat?q=hello&uid=1\napitest https://example.com/api/chat q=hello&uid=1`,
      event.threadID, event.messageID
    );
  }

  let url = args[0]?.replace(/\(\.\)/g, ".") || "";
  if (!urlRegex.test(url)) {
    return api.sendMessage("❌ Invalid URL.", event.threadID, event.messageID);
  }

  const isPost = args.length >= 2;
  let postData = isPost ? args.slice(1).join(" ") : null;

  try {
    const options = {
      method: isPost ? "POST" : "GET",
      url,
      responseType: "arraybuffer",
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "*/*"
      },
    };

    if (isPost && postData) {
      try {
        postData = JSON.parse(postData);
        options.data = postData;
        options.headers["Content-Type"] = "application/json";
      } catch {
        options.data = new URLSearchParams(postData);
        options.headers["Content-Type"] = "application/x-www-form-urlencoded";
      }
    }

    const { data, headers } = await axios(options);
    const contentType = headers["content-type"] || "";
    const fileExt = getExtensionFromContentType(contentType);

    if (contentType.includes("json")) {
      const jsonData = JSON.parse(data.toString());
      const formatted = JSON.stringify(jsonData, null, 2);
      return api.sendMessage(formatted, event.threadID, event.messageID);
    }

    if (isMediaAttachment(contentType)) {
      return sendFile(api, event, fileExt, data, `📽️ API returned a ${fileExt.toUpperCase()}:`);
    }

    return sendFile(api, event, "txt", data.toString(), "📄 Response attached.");
  } catch (error) {
    let errMsg = `❌ API Request Failed.`;
    if (error.response) {
      errMsg += `\nStatus: ${error.response.status}`;
      if (error.response.data) {
        errMsg += `\nResponse: ${error.response.data.toString().slice(0, 400)}`;
      }
    } else {
      errMsg += `\nError: ${error.message}`;
    }
    return api.sendMessage(errMsg, event.threadID, event.messageID);
  }
};

async function sendFile(api, event, ext, data, caption) {
  const filePath = path.join(__dirname, "cache", `file_${Date.now()}.${ext}`);
  fs.writeFileSync(filePath, data);
  api.sendMessage({
    body: caption,
    attachment: fs.createReadStream(filePath)
  }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
}