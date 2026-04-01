let messageModel = require("../schemas/messages");

module.exports = {

    // lấy toàn bộ message giữa 2 user
    GetMessagesBetweenUsers: async function (currentUserId, userId) {
        return await messageModel.find({
            $or: [
                { from: currentUserId, to: userId },
                { from: userId, to: currentUserId }
            ]
        })
        .populate("from to", "username email")
        .sort({ createdAt: 1 });
    },

    // tạo message
    CreateMessage: async function (from, to, type, text) {
        let newMessage = new messageModel({
            from,
            to,
            messageContent: {
                type,
                text
            }
        });

        await newMessage.save();
        return newMessage;
    },

    // lấy message cuối mỗi cuộc hội thoại
    GetLastMessages: async function (currentUserId) {
        return await messageModel.aggregate([
            {
                $match: {
                    $or: [
                        { from: currentUserId },
                        { to: currentUserId }
                    ]
                }
            },
            {
                $addFields: {
                    otherUser: {
                        $cond: [
                            { $eq: ["$from", currentUserId] },
                            "$to",
                            "$from"
                        ]
                    }
                }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $group: {
                    _id: "$otherUser",
                    lastMessage: { $first: "$$ROOT" }
                }
            }
        ]);
    }
};