var express = require("express");
var router = express.Router();

let messageController = require("../controllers/messages");
let { CheckLogin } = require("../utils/authHandler");
let { uploadImage } = require('../utils/uploadHandler')


// 1. GET "/:userID"
// lấy toàn bộ message giữa current user và userID
router.get("/:userID", CheckLogin, async (req, res) => {
    try {
        let currentUser = req.user._id; // từ middleware
        let userID = req.params.userID;

        let messages = await messageController.GetMessagesBetweenUsers(
            currentUser,
            userID
        );

        res.send(messages);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});


// 2. POST "/"
// gửi message
router.post("/", CheckLogin, async (req, res) => {
    try {
        let from = req.user._id;
        let { to, type, text } = req.body;

        if (!to || !type || !text) {
            return res.status(400).send({ message: "Missing fields" });
        }

        let newMessage = await messageController.CreateMessage(
            from,
            to,
            type,
            text
        );

        res.send(newMessage);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});


// 3. GET "/"
// lấy message cuối cùng mỗi user
router.get("/", CheckLogin, async (req, res) => {
    try {
        let currentUser = req.user._id;

        let result = await messageController.GetLastMessages(currentUser);

        res.send(result);
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
});

module.exports = router;