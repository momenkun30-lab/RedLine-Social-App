const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

// --- 1. إعدادات السيرفر الأساسية ---
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// إعداد الجلسات (Sessions) لبقاء المستخدم مسجلاً دخوله
app.use(session({
    secret: 'red-line-secret-key-2026',
    resave: false,
    saveUninitialized: true
}));

// --- 2. قاعدة بيانات تجريبية (سيتم استبدالها بـ MongoDB لاحقاً) ---
// هنا نقوم بتخزين المستخدمين مؤقتاً في ذاكرة السيرفر
let users = []; 

// --- 3. مسارات التنقل (Routing) ---

// عرض الشاشة الرأسية السينمائية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// عرض شاشة الفيديوهات والرسائل (بعد الدخول)
app.get('/home', (req, res) => {
    if (req.session.loggedIn) {
        res.sendFile(path.join(__dirname, 'public', 'main.html'));
    } else {
        res.redirect('/'); // إذا لم يسجل دخوله يعود للشاشة الرأسية
    }
});

// --- 4. منطق إنشاء الحساب (البيانات + سؤال الأمان) ---
app.post('/register', (req, res) => {
    const { username, birthplace, nationality, age, residence, securityQuestion, securityAnswer, password } = req.body;

    // التأكد من عدم تكرار اسم المستخدم
    const userExists = users.find(u => u.username === username);
    if (userExists) {
        return res.status(400).json({ message: "اسم المستخدم موجود مسبقاً" });
    }

    // حفظ المستخدم الجديد مع بيانات الأمان
    const newUser = {
        username,
        details: { birthplace, nationality, age, residence },
        security: { question: securityQuestion, answer: securityAnswer },
        password: password // في المواقع الحقيقية نقوم بتشفيرها هنا
    };

    users.push(newUser);
    console.log("مستخدم جديد انضم للخط الأحمر:", username);
    res.status(200).json({ message: "تم إنشاء الحساب بنجاح" });
});

// --- 5. منطق تسجيل الدخول ---
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);

    if (user) {
        req.session.loggedIn = true;
        req.session.username = username;
        res.json({ success: true, redirect: '/home' });
    } else {
        res.status(401).json({ success: false, message: "بيانات الدخول خاطئة" });
    }
});

// --- 6. منطق استعادة كلمة السر (سؤال الأمان) ---
app.post('/forgot-password', (req, res) => {
    const { username } = req.body;
    const user = users.find(u => u.username === username);

    if (user) {
        // نرسل سؤال الأمان للمستخدم ليقوم بالإجابة عليه
        res.json({ question: user.security.question });
    } else {
        res.status(404).json({ message: "المستخدم غير موجود" });
    }
});

app.post('/verify-security', (req, res) => {
    const { username, answer, newPassword } = req.body;
    const user = users.find(u => u.username === username);

    if (user && user.security.answer === answer) {
        user.password = newPassword; // تغيير كلمة السر
        res.json({ message: "تم تغيير كلمة السر بنجاح" });
    } else {
        res.status(400).json({ message: "الإجابة خاطئة" });
    }
});

// تشغيل السيرفر على المنفذ الذي يحدده Render أو 3000 محلياً
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`-----------------------------------`);
    console.log(`RED LINE SERVER IS RUNNING ON PORT ${PORT}`);
    console.log(`-----------------------------------`);
});
