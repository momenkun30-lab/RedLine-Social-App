const translations = {
    ar: { hero: "اصنع لنفسك تاريخاً تُذكر به", login: "تسجيل الدخول", reg: "إنشاء حساب", dir: "rtl" },
    en: { hero: "Make a history for yourself to be remembered by", login: "Login", reg: "Sign Up", dir: "ltr" },
    fr: { hero: "Créez votre propre histoire", login: "Connexion", reg: "S'inscrire", dir: "ltr" },
    de: { hero: "Schreiben Sie Ihre eigene Geschichte", login: "Anmelden", reg: "Registrieren", dir: "ltr" },
    hi: { hero: "अपना एक इतिहास बनाएं", login: "लॉग इन", reg: "साइन अप", dir: "ltr" },
    zh: { hero: "创造属于你的历史", login: "登录", reg: "注册", dir: "ltr" },
    ja: { hero: "自分の歴史を作れ", login: "ログイン", reg: "サインアップ", dir: "ltr" }
};

let typingInProgress = false;

// تأثير الكتابة
async function typeEffect(text) {
    if(typingInProgress) return;
    typingInProgress = true;
    const el = document.getElementById('hero-text');
    const footer = document.getElementById('footer-buttons');
    footer.classList.remove('visible');
    
    el.innerText = "";
    for (let i = 0; i <= text.length; i++) {
        el.innerText = text.substring(0, i);
        await new Promise(r => setTimeout(r, 100));
    }
    await new Promise(r => setTimeout(r, 2000));
    for (let i = text.length; i >= 0; i--) {
        el.innerText = text.substring(0, i);
        await new Promise(r => setTimeout(r, 50));
    }
    footer.classList.add('visible');
    typingInProgress = false;
}

// تغيير اللغة
function changeLanguage() {
    const lang = document.getElementById('languagePicker').value;
    const data = translations[lang];
    document.documentElement.dir = data.dir;
    document.getElementById('loginBtn').innerText = data.login;
    document.getElementById('regBtn').innerText = data.reg;
    typeEffect(data.hero);
}

// التحكم في النوافذ
function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }
function showSecurityStep() { closeModal('registerModal'); openModal('securityModal'); }

// إرسال بيانات التسجيل للسيرفر
async function finishReg() {
    const data = {
        username: document.getElementById('reg-user').value,
        birthplace: document.getElementById('reg-birth').value,
        nationality: document.getElementById('reg-nat').value,
        age: document.getElementById('reg-age').value,
        residence: document.getElementById('reg-loc').value,
        securityQuestion: document.getElementById('s-question').value,
        securityAnswer: document.getElementById('s-answer').value,
        password: document.getElementById('reg-pass').value
    };

    const response = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    if (response.ok) {
        alert("تم إنشاء حسابك بنجاح في الخط الأحمر!");
        closeModal('securityModal');
    } else {
        const err = await response.json();
        alert(err.message);
    }
}

// تسجيل الدخول والتحويل لصفحة الفيديوهات
async function attemptLogin() {
    const username = document.getElementById('login-user').value;
    const password = document.getElementById('login-pass').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    if (result.success) {
        window.location.href = result.redirect; // ينقلك لصفحة main.html
    } else {
        alert(result.message);
    }
}

// محرك النجوم (Animation)
const canvas = document.getElementById('starsCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;
let stars = Array(150).fill().map(() => ({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, size: Math.random()*1.5, spd: Math.random()*0.05 }));

function animate() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = "white";
    stars.forEach(s => {
        s.y -= s.spd; if(s.y < 0) s.y = canvas.height;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.size, 0, Math.PI*2); ctx.fill();
    });
    requestAnimationFrame(animate);
}

window.onload = () => { animate(); typeEffect(translations.ar.hero); };
