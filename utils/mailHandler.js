const nodemailer = require("nodemailer");


const transporter = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    secure: false, // Use true for port 465, false for port 587
    auth: {
        user: "19d33b741492475755",
        pass: "52237873d877c415efffe3a1718d42e3",
    },
});

module.exports = {
    // sendMail: async (to,url) => {
    //     const info = await transporter.sendMail({
    //         from: 'admin@haha.com',
    //         to: to,
    //         subject: "RESET PASSWORD REQUEST",
    //         text: "lick vo day de doi pass", // Plain-text version of the message
    //         html: "lick vo <a href="+url+">day</a> de doi pass", // HTML version of the message
    //     });

    //     console.log("Message sent:", info.messageId);
    // }

    sendMail: async (to, content) => {
    const info = await transporter.sendMail({
        from: 'admin@haha.com',
        to: to,
        subject: "ACCOUNT CREATED",
        text: "Your password",
        html: `<h3>Your account has been created</h3>
               <p>${content}</p>`,
    });

    console.log("Message sent:", info.messageId);
}
}