var express = require("express");
var router = express.Router();
let { validatedResult, CreateAnUserValidator, ModifyAnUserValidator } = require('../utils/validator')
let userModel = require("../schemas/users");
let userController = require('../controllers/users')
let { CheckLogin, CheckRole } = require('../utils/authHandler')
const XLSX = require("xlsx");
const bcrypt = require("bcryptjs");
const roleModel = require("../schemas/roles");
const mailer = require("../utils/mailHandler");

const TOKEN = "52237873d877c415efffe3a1718d42e3"; //19d33b74149 2475755

router.get("/", CheckLogin,CheckRole("ADMIN", "USER"), async function (req, res, next) {
    let users = await userModel
      .find({ isDeleted: false })
    res.send(users);
  });

router.get("/:id", async function (req, res, next) {
  try {
    let result = await userModel
      .find({ _id: req.params.id, isDeleted: false })
    if (result.length > 0) {
      res.send(result);
    }
    else {
      res.status(404).send({ message: "id not found" });
    }
  } catch (error) {
    res.status(404).send({ message: "id not found" });
  }
});

router.post("/", CreateAnUserValidator, validatedResult, async function (req, res, next) {
  try {
    let newItem = await userController.CreateAnUser(
      req.body.username, req.body.password, req.body.email, req.body.role,
      req.body.fullName, req.body.avatarUrl, req.body.status, req.body.loginCount)
    res.send(newItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.put("/:id", ModifyAnUserValidator, validatedResult, async function (req, res, next) {
  try {
    let id = req.params.id;
    let updatedItem = await userModel.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedItem) return res.status(404).send({ message: "id not found" });

    let populated = await userModel
      .findById(updatedItem._id)
    res.send(populated);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.delete("/:id", async function (req, res, next) {
  try {
    let id = req.params.id;
    let updatedItem = await userModel.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );
    if (!updatedItem) {
      return res.status(404).send({ message: "id not found" });
    }
    res.send(updatedItem);
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

router.post("/import-users", async (req, res) => {
  try {
    // đọc file excel
    const workbook = XLSX.readFile("user.xlsx");
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const users = XLSX.utils.sheet_to_json(sheet);

    // lấy role USER
    const userRole = await roleModel.findOne({ name: "USER" });
    if (!userRole) {
      return res.status(400).send("Role USER not found");
    }

    const results = [];

    for (let u of users) {
    // 🔥 check tồn tại trước
    const existing = await userModel.findOne({ username: u.username });

    if (existing) {
        console.log(`⚠️ Bỏ qua ${u.username} (đã tồn tại)`);
        continue;
    }

    const plainPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const newUser = await userModel.create({
        username: u.username,
        email: u.email,
        password: hashedPassword,
        role: userRole._id,
        isDeleted: false
    });

    await mailer.sendMail(
        u.email,
        `Password: <b>${plainPassword}</b>`
    );

      results.push({
        username: newUser.username,
        email: newUser.email,
        password: plainPassword, // để debug
      });
    }

    res.send({
      message: "Import thành công",
      data: results,
    });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// random password
function generatePassword(length = 16) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

module.exports = router;