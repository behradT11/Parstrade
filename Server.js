const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;

// میان‌افزارها (Middleware)
app.use(cors()); // اجازه دسترسی فرانت به بک
app.use(bodyParser.json());

// دیتابیس موقت (در حافظه رم)
const otpStore = {};

// تنظیمات ارسال ایمیل (اختیاری - اگر تنظیم نکنید کد فقط در کنسول چاپ می‌شود)
// برای فعال سازی واقعی باید از Gmail App Password استفاده کنید
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'your-email@gmail.com', // ایمیل خود را اینجا بگذارید
        pass: 'your-app-password'     // رمز عبور اپلیکیشن گوگل
    }
});

// روت 1: درخواست کد OTP
app.post('/send-otp', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'ایمیل الزامی است' });
    }

    // تولید کد 4 رقمی رندوم
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    // ذخیره در دیتابیس موقت (با انقضای 2 دقیقه)
    otpStore[email] = {
        code: otp,
        expires: Date.now() + 120000 // 2 دقیقه
    };

    console.log(`--------------------------------`);
    console.log(`✅ OTP CODE FOR [${email}]: ${otp}`);
    console.log(`--------------------------------`);

    // تلاش برای ارسال ایمیل (اگر کانفیگ نشده باشد ارور نمی‌دهد تا برنامه متوقف نشود)
    try {
        /* فعال‌سازی این بخش نیاز به کانفیگ واقعی ایمیل دارد */
        /*
        await transporter.sendMail({
            from: '"Pars Trade" <noreply@parstrade.com>',
            to: email,
            subject: 'کد ورود به پارس ترید',
            text: `کد ورود شما: ${otp}`
        });
        */
        res.json({ message: 'کد ارسال شد' });
    } catch (error) {
        console.log("Email Error (Ignore if local):", error.message);
        // حتی اگر ایمیل نرود، چون در کنسول چاپ شده، به کاربر میگوییم موفقیت آمیز بود
        res.json({ message: 'کد ساخته شد (Check Console)' });
    }
});

// روت 2: تایید کد OTP
app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    if (!otpStore[email]) {
        return res.status(400).json({ message: 'کدی برای این ایمیل یافت نشد یا منقضی شده است' });
    }

    const data = otpStore[email];

    if (Date.now() > data.expires) {
        delete otpStore[email];
        return res.status(400).json({ message: 'کد منقضی شده است' });
    }

    if (data.code === otp) {
        // کد درست است
        delete otpStore[email]; // پاک کردن کد پس از استفاده (یکبار مصرف)
        return res.json({ 
            message: 'ورود موفقیت آمیز', 
            token: 'fake-jwt-token-123456' // اینجا توکن واقعی باید فرستاده شود
        });
    } else {
        return res.status(400).json({ message: 'کد اشتباه است' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`waiting for requests...`);
});

