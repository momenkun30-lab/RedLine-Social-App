const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();

// --- إعدادات المعالجة والجلسات ---
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// تعديل: جعل السيرفر يقرأ الملفات من المجلد الرئيسي مباشرة
app.use(express.static(__dirname));

// إعداد الجلسة لتذكر المستخدم
app.use(session({
    secret: 'RedLine_Secret_2026_Key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

// --- قاعدة بيانات مؤقتة ---
let usersDB = [];

// --- مسارات التوجيه (تعديل المسارات لحذف مجلد public) ---

// 1. عرض الشاشة الرأسية
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 2. عرض شاشة المحتوى الرئيسي (بعد الدخول)
app.get('/home', (req, res) => {
    if (req.session.isLoggedIn) {
        res.sendFile(path.join(__dirname, 'main.html'));
    } else {
        res.redirect('/'); 
    }
});

// --- العمليات البرمجية (APIs) ---

// إنشاء حساب جديد
app.post('/register', (req, res) => {
    const { 
        username, birthplace, nationality, age, 
        residence, securityQuestion, securityAnswer, password 
    } = req.body;

    if (usersDB.find(u => u.username === username)) {
        return res.status(400).json({ message: "اسم المستخدم هذا مسجل بالفعل!" });
    }

    const newUser = {
        username,
        profile: { birthplace, nationality, age, residence },
        security: { question: securityQuestion, answer: securityAnswer },
        password: password
    };

    usersDB.push(newUser);
    res.status(200).json({ message: "تم إنشاء الحساب بنجاح!" });
});

// تسجيل الدخول
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = usersDB.find(u => u.username === username && u.password === password);

    if (user) {
        req.session.isLoggedIn = true;
        req.session.user = user.username;
        res.json({ success: true, redirect: '/home' });
    } else {
        res.status(401).json({ success: false, message: "بيانات الدخول غير صحيحة!" });
    }
});

// استعادة كلمة السر
app.post('/forgot-password', (req, res) => {
    const { username } = req.body;
    const user = usersDB.find(u => u.username === username);
    if (user) {
        res.json({ question: user.security.question });
    } else {
        res.status(404).json({ message: "المستخدم غير موجود!" });
    }
});

// تسجيل الخروج
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// --- تشغيل السيرفر ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Red Line Server is running on port ${PORT}`);
});
