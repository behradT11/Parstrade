// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors()); // برای اجازه دادن به فرانت‌اند

// دیتابیس فرضی اخبار (چون API واقعی نیاز به پول دارد، این را شبیه‌سازی می‌کنیم اما منطقی)
const newsData = [
    { title: "CPI Data Release", impact: "HIGH IMPACT", color: "text-red-500" },
    { title: "Fed Chair Powell Speaks", impact: "HIGH IMPACT", color: "text-red-500" },
    { title: "Unemployment Claims", impact: "MEDIUM IMPACT", color: "text-orange-400" },
    { title: "Market Sentiment: Bullish", impact: "LOW IMPACT", color: "text-green-400" }
];

app.get('/api/market-data', (req, res) => {
    const now = new Date();
    
    // 1. محاسبه زمان GMT
    const hours = now.getUTCHours();
    const minutes = now.getUTCMinutes();
    const seconds = now.getUTCSeconds();
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    // 2. منطق تشخیص سشن (ساده شده)
    let session = "Sydney / Tokyo";
    if (hours >= 8 && hours < 13) session = "London (Open)";
    else if (hours >= 13 && hours < 17) session = "London / New York"; // همپوشانی
    else if (hours >= 17 && hours < 22) session = "New York (Open)";
    else session = "Asian Session";

    // 3. محاسبه تایمر کندل یک ساعته (H1)
    // چقدر مانده تا ساعت بعدی؟
    const minutesLeft = 59 - minutes;
    const secondsLeft = 59 - seconds;
    const formattedTimer = `${minutesLeft.toString().padStart(2, '0')}:${secondsLeft.toString().padStart(2, '0')}`;

    // 4. خبر تصادفی (برای نمایش کارکرد)
    // در واقعیت اینجا باید به یک API وصل شوید
    const randomNews = newsData[Math.floor((Math.random() * newsData.length))]; // فقط برای دمو هر بار یکی را نشان میدهد، میتوانید ثابت کنید

    res.json({
        gmtTime: formattedTime,
        session: session,
        timer: formattedTimer,
        news: newsData[0] // فعلا اولی را ثابت نشان میدهد
    });
});

app.listen(port, () => {
    console.log(`Pars Trade Backend running at http://localhost:${port}`);
});
