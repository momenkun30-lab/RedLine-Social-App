// تأثير الكتابة
const heroText = "اصنع لنفسك تاريخاً تُذكر به";
let i = 0;
function typeWriter() {
    if (i < heroText.length) {
        document.getElementById("hero-text").innerHTML += heroText.charAt(i);
        i++;
        setTimeout(typeWriter, 100);
    } else {
        document.getElementById("footer-buttons").classList.add("visible");
    }
}

// التحكم في النوافذ
function openModal(id) { document.getElementById(id).style.display = "flex"; }
function closeModal(id) { document.getElementById(id).style.display = "none"; }
function showSecurityStep() { closeModal('registerModal'); openModal('securityModal'); }

// تسجيل الحساب
async function finishReg() {
    const data = {
        username: document.getElementById('reg-user').value,
        securityQuestion: document.getElementById('s-question').value,
        securityAnswer: document.getElementById('s-answer').value,
        password: document.getElementById('reg-pass').value
    };

    const response = await fetch('/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });

    if(response.ok) { alert("تم الانضمام للخط الأحمر"); location.reload(); }
}

// تسجيل الدخول
async function attemptLogin() {
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;

    const res = await fetch('/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username: user, password: pass})
    });

    const result = await res.json();
    if(result.success) { window.location.href = "/home"; } 
    else { alert("خطأ في البيانات"); }
}

window.onload = typeWriter;
