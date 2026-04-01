const XLSX = require("xlsx");
const bcrypt = require("bcryptjs");
const roleModel = require("../schemas/roles");
const userModel = require("../schemas/users");
const mailer = require("../utils/mailHandler");
const mongoose = require("mongoose");

mongoose.connect('mongodb://localhost:27017/NNPTUD-C4');
mongoose.connection.on('connected', function () {
  console.log("connected");
})

// random password
function generatePassword(length = 16) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

async function importUsers() {
    try {
        const workbook = XLSX.readFile("../user.xlsx");
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const users = XLSX.utils.sheet_to_json(sheet);

        // 🔥 tìm role user
        const userRole = await roleModel.findOne({ name: "USER" });
        if (!userRole) throw new Error("Role USER not found");

        for (let u of users) {
            const plainPassword = generatePassword();
            const hashedPassword = await bcrypt.hash(plainPassword, 10);

            const newUser = await userModel.create({
                username: u.username,
                email: u.email,
                password: hashedPassword,
                role: userRole._id, // ✅ FIX CHỖ NÀY
                isDeleted: false
            });

            console.log("Created:", newUser.username);

            console.log("Password của bạn là:", plainPassword);
            await mailer.sendMail(
                u.email,
                `Password của bạn là: <b>${plainPassword}</b>`
            );
        }

        console.log("✅ Import thành công!");
    } catch (err) {
        console.error(err);
    }
}

// 👉 chỉ gọi 1 lần ở cuối
importUsers();