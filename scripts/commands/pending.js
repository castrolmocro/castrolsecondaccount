module.exports.config = {
	name: "pending",
	version: "1.0.5",
	credits: "ryuko",
	prefix: false,
	premium: false,
	permission: 2,
	description: "approve groups",
	category: "admin",
	cooldowns: 5
};

module.exports.languages = {
	"vi": {
		"invaildNumber": "%1 không phải là một con số hợp lệ",
		"cancelSuccess": "đã từ chối thành công %1 nhóm!",
		"notiBox": "box của bạn đã được admin phê duyệt để có thể sử dụng bot",
		"approveSuccess": "đã phê duyệt thành công %1 nhóm!",
		"cantGetPendingList": "không thể lấy danh sách các nhóm đang chờ!",
		"returnListPending": "tổng số nhóm cần duyệt : %1 nhóm \n\n%2",
		"returnListClean": "「PENDING」Hiện tại không có nhóm nào trong hàng chờ"
	},
	"en": {
		"invaildNumber": "%1 is not a valid number",
		"cancelSuccess": "refused %1 thread(s)",
		"notiBox": "✅ 𝗚𝗿𝗼𝘂𝗽 𝗔𝗽𝗽𝗿𝗼𝘃𝗲𝗱 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆! ✅\n\n━━━━━━━━━━━━━━━━━━\n👑 𝗔𝗽𝗽𝗿𝗼𝘃𝗲𝗱 𝗕𝘆: %1\n🔗 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸: https://facebook.com/%2\n━━━━━━━━━━━━━━━━━━\n\n⚙️ 𝗔𝗹𝗹 𝗽𝗿𝗲𝗺𝗶𝘂𝗺 𝗯𝗼𝘁 𝗳𝗲𝗮𝘁𝘂𝗿𝗲𝘀 𝗮𝗿𝗲 𝗻𝗼𝘄 𝘂𝗻𝗹𝗼𝗰𝗸𝗲𝗱!\n🎉 𝗘𝗻𝗷𝗼𝘆 𝘁𝗵𝗲 𝗳𝘂𝗹𝗹 𝗽𝗼𝘄𝗲𝗿 𝗼𝗳 𝗜𝗠𝗥𝗔𝗡𝗕𝗢𝗧 🤖",
		"approveSuccess": "approved successfully %1 thread(s)",
		"cantGetPendingList": "can't get the pending list",
		"returnListPending": "total groups to approve: %1\n\n%2",
		"returnListClean": "No group is currently in the pending list"
	}
};

module.exports.handleReply = async function ({ api, event, handleReply, getText, Users }) {
	if (String(event.senderID) !== String(handleReply.author)) return;
	const { body, threadID, messageID, senderID } = event;
	let count = 0;

	// Get approver name
	let name;
	try {
		const userInfo = await api.getUserInfo(senderID);
		name = userInfo[senderID]?.name || "Admin";
	} catch (e) {
		name = "Admin";
	}

	if ((isNaN(body) && body.startsWith("c")) || body.startsWith("cancel")) {
		const index = body.slice(1).trim().split(/\s+/);
		for (const singleIndex of index) {
			if (isNaN(singleIndex) || singleIndex <= 0 || singleIndex > handleReply.pending.length) {
				return api.sendMessage(getText("invaildNumber", singleIndex), threadID, messageID);
			}
			await api.removeUserFromGroup(api.getCurrentUserID(), handleReply.pending[singleIndex - 1].threadID);
			count += 1;
		}
		return api.sendMessage(getText("cancelSuccess", count), threadID, messageID);
	} else {
		const index = body.trim().split(/\s+/);
		for (const singleIndex of index) {
			if (isNaN(singleIndex) || singleIndex <= 0 || singleIndex > handleReply.pending.length) {
				return api.sendMessage(getText("invaildNumber", singleIndex), threadID, messageID);
			}
			const notiMsg = getText("notiBox", name, senderID);
			await api.sendMessage(notiMsg, handleReply.pending[singleIndex - 1].threadID);
			count += 1;
		}
		return api.sendMessage(getText("approveSuccess", count), threadID, messageID);
	}
};

module.exports.run = async function ({ api, event, getText }) {
	const { threadID, messageID } = event;
	const commandName = this.config.name;
	let msg = "", index = 1;

	try {
		const spam = await api.getThreadList(100, null, ["OTHER"]) || [];
		const pending = await api.getThreadList(100, null, ["PENDING"]) || [];
		const list = [...spam, ...pending].filter(group => group.isSubscribed && group.isGroup);

		for (const single of list) msg += `${index++}/ ${single.name} (${single.threadID})\n`;

		if (list.length !== 0) {
			return api.sendMessage(getText("returnListPending", list.length, msg), threadID, (error, info) => {
				global.client.handleReply.push({
					name: commandName,
					messageID: info.messageID,
					author: event.senderID,
					pending: list
				});
			}, messageID);
		} else {
			return api.sendMessage(getText("returnListClean"), threadID, messageID);
		}
	} catch (e) {
		console.error(e);
		return api.sendMessage(getText("cantGetPendingList"), threadID, messageID);
	}
};
