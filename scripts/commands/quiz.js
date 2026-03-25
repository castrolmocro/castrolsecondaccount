const axios = require("axios");

module.exports.config = {
  name: "quiz",
  version: "2.0.0",
  permission: 0,
  credits: "Developer",
  description: "API থেকে কুইজ প্রশ্ন পান এবং আপনার জ্ঞান পরীক্ষা করুন",
  prefix: false,
  premium: false,
  category: "ধাঁধার খেলা",
  usages: "quiz [guide]",
  cooldowns: 5,
  dependencies: {
    "axios": ""
  }
};

const timeoutDuration = 30 * 1000; // ৩০ সেকেন্ড

module.exports.run = async function ({ api, event, args }) {
  const { threadID, senderID, messageID } = event;

  if (args[0]?.toLowerCase() === "guide") {
    return api.sendMessage(
      `🧠 | কুইজ খেলার গাইড ✨\n\n` +
      `➤ কমান্ড: quiz\n` +
      `➤ API থেকে এলোমেলো কুইজ প্রশ্ন পাবেন।\n` +
      `➤ ৪টি অপশন থেকে সঠিক উত্তরটি নির্বাচন করুন (0-3 লিখুন)।\n` +
      `➤ ৩০ সেকেন্ডের মধ্যে উত্তর দিন!\n` +
      `➤ ভুল হলে আবার চেষ্টা করুন!\n\n` +
      `⚡ শুভকামনা!`, 
      threadID, 
      messageID
    );
  }

  try {
    const res = await axios.get("https://masterapi.fun/api/quiz");
    const item = res.data;

    if (!item.question || !item.options || item.answer === undefined) {
      throw new Error("Invalid quiz data");
    }

    const correctAnswerText = item.options[item.answer];
    const optionsList = item.options.map((opt, index) => `${index}. ${opt}`).join("\n");

    const quizMsg = `📝 প্রশ্ন: ${item.question}\nবিভাগ: ${item.category}\nস্তর: ${item.difficulty}\n\n${optionsList}\n\n💡 ইঙ্গিত: ${item.hint}\n\n✏️ উত্তর দিতে 0 থেকে 3 নম্বর লিখুন!\n⏳ সময়: ৩০ সেকেন্ড!`;

    return api.sendMessage(quizMsg, threadID, async (err, info) => {
      const timeout = setTimeout(() => {
        try {
          api.unsendMessage(info.messageID);
          api.sendMessage(`⏰ | সময় শেষ! সঠিক উত্তর ছিল: ${correctAnswerText}`, threadID);
        } catch (e) {
          console.error("Timeout error:", e);
        }
      }, timeoutDuration);

      // Push to handleReply system
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID,
        answer: item.answer,
        correctAnswer: correctAnswerText,
        timeout
      });
    });

  } catch (error) {
    console.error("Quiz error:", error);
    return api.sendMessage("❌ | কুইজ ডেটা লোড করতে সমস্যা হয়েছে!", threadID, messageID);
  }
};

module.exports.handleReply = async function ({ api, event, handleReply }) {
  const { threadID, senderID, messageID, body } = event;

  if (senderID !== handleReply.author) return;

  const userAnswer = parseInt(body.trim());
  if (isNaN(userAnswer) || userAnswer < 0 || userAnswer > 3) {
    return api.sendMessage("⚠️ | দয়া করে 0 থেকে 3 নম্বরের মধ্যে সঠিক উত্তর দিন!", threadID, messageID);
  }

  clearTimeout(handleReply.timeout);

  try {
    await api.unsendMessage(handleReply.messageID);
  } catch (e) {
    console.error("Unsend error:", e);
  }

  if (userAnswer === handleReply.answer) {
    return api.sendMessage(`✅ | সঠিক উত্তর! আপনি 天才ですね!`, threadID, messageID);
  } else {
    return api.sendMessage(`❌ | ভুল উত্তর! সঠিক উত্তর ছিল: ${handleReply.correctAnswer}`, threadID, messageID);
  }
};