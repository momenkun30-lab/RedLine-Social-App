// تشغيل الفيديوهات تلقائياً عند التمرير
const videoOptions = { threshold: 0.6 };
const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.play();
        } else {
            entry.target.pause();
        }
    });
}, videoOptions);

document.querySelectorAll('.feed-video').forEach(video => {
    videoObserver.observe(video);
});

// وظيفة إرسال رسالة
function sendMessage() {
    const input = document.getElementById('msgInput');
    if (input.value.trim() !== "") {
        alert("تم إرسال رسالتك عبر الخط الأحمر: " + input.value);
        input.value = "";
    }
}

// وظيفة الخروج
function logout() {
    if (confirm("هل تريد مغادرة الخط الأحمر والعودة للشاشة الرأسية؟")) {
        window.location.href = "/";
    }
}
