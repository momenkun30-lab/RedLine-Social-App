const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

// --- إعدادات المعالجة والجلسات ---
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// إعداد الجلسة لتذكر المستخدم (Session)
app.use(session({
    secret: 'RedLine_Secret_2026_Key', // مفتاح سري لتأمين الجلسات
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // اجعلها true فقط إذا كنت تستخدم https
}));

// --- قاعدة بيانات مؤقتة (سيتم ربطها بـ MongoDB لاحقاً) ---
let usersDB = [];

// --- مسارات التوجيه (Routes) ---

// 1. الشاشة الرأسية (نقطة البداية)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 2. شاشة المحتوى الرئيسي (الفيديوهات والرسائل)
app.get('/home', (req, res) => {
    // التحقق من أن المستخدم قام بتسجيل الدخول فعلياً
    if (req.session.isLoggedIn) {
        res.sendFile(path.join(__dirname, 'public', 'main.html'));
    } else {
        res.redirect('/'); // إذا حاول الدخول مباشرة دون تسجيل يتم طرده للشاشة الرأسية
    }
});

// --- العمليات المنطقية (API Logic) ---

// 3. عملية إنشاء حساب جديد
app.post('/register', (req, res) => {
    const { 
        username, birthplace, nationality, age, 
        residence, securityQuestion, securityAnswer, password 
    } = req.body;

    // التحقق من تكرار الاسم
    if (usersDB.find(u => u.username === username)) {
        return res.status(400).json({ message: "اسم المستخدم هذا مسجل بالفعل!" });
    }

    // إضافة المستخدم الجديد مع بياناته وسؤال الأمان
    const newUser = {
        username,
        profile: { birthplace, nationality, age, residence },
        security: { question: securityQuestion, answer: securityAnswer },
        password: password
    };

    usersDB.push(newUser);
    console.log(`✅ حساب جديد تم إنشاؤه: ${username}`);
    res.status(200).json({ message: "تم إنشاء الحساب بنجاح!" });
});

// 4. عملية تسجيل الدخول
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = usersDB.find(u => u.username === username && u.password === password);

    if (user) {
        req.session.isLoggedIn = true; // حفظ حالة الدخول في الجلسة
        req.session.user = user.username;
        res.json({ success: true, redirect: '/home' });
    } else {
        res.status(401).json({ success: false, message: "بيانات الدخول غير صحيحة!" });
    }
});

// 5. عملية استعادة كلمة السر (سؤال الأمان)
app.post('/forgot-password', (req, res) => {
    const { username } = req.body;
    const user = usersDB.find(u => u.username === username);

    if (user) {
        res.json({ question: user.security.question });
    } else {
        res.status(404).json({ message: "المستخدم غير موجود!" });
    }
});

// 6. التحقق من الإجابة وتغيير كلمة السر
app.post('/reset-password', (req, res) => {
    const { username, answer, newPassword } = req.body;
    const user = usersDB.find(u => u.username === username);

    if (user && user.security.answer === answer) {
        user.password = newPassword;
        res.json({ message: "تم تحديث كلمة السر بنجاح، يمكنك الدخول الآن." });
    } else {
        res.status(400).json({ message: "الإجابة على سؤال الأمان خاطئة!" });
    }
});

// 7. تسجيل الخروج
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// --- تشغيل السيرفر ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Red Line Server is running on: http://localhost:${PORT}`);
});
