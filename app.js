gsap.registerPlugin(ScrollTrigger);

// 1. Anniversary Logic
const startDate = new Date("2025-02-13T19:05:00").getTime();
function updateClock() {
    const diff = new Date().getTime() - startDate;
    const data = {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
    };
    for (let key in data) {
        const el = document.getElementById(key);
        const val = String(data[key]).padStart(2, '0');
        if (el && el.innerText !== val) {
            gsap.fromTo(el, { rotateX: -90, opacity: 0 }, { rotateX: 0, opacity: 1, duration: 0.4 });
            el.innerText = val;
        }
    }
}

// 2. Birthday System
function initBday(month, day, textId) {
    const now = new Date();
    let bday = new Date(now.getFullYear(), month - 1, day);
    if (now > bday) bday.setFullYear(now.getFullYear() + 1);
    const left = Math.ceil((bday - now) / (1000 * 60 * 60 * 24));
    const el = document.getElementById(textId);
    if (el) el.innerText = `Next Birthday in ${left} Days`;
}

// 3. Floating Hearts
function createHeart() {
    const container = document.getElementById('hearts-container');
    if (!container) return;
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.innerHTML = '❤️';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.bottom = '-5%';
    heart.style.fontSize = (Math.random() * 18 + 10) + 'px';
    heart.style.filter = `blur(${Math.random() * 1.5}px)`;
    container.appendChild(heart);
    gsap.to(heart, {
        y: -(window.innerHeight + 200),
        x: (Math.random() - 0.5) * 300,
        opacity: 0,
        duration: 5 + Math.random() * 5,
        onComplete: () => heart.remove()
    });
}

// 4. Navbar Logic
window.addEventListener('scroll', () => {
    const nav = document.getElementById('navbar');
    if (nav) window.scrollY > 50 ? nav.classList.add('nav-active') : nav.classList.remove('nav-active');
});

setInterval(updateClock, 1000);
setInterval(createHeart, 450);
updateClock();
initBday(9, 2, "my-bday-text");
initBday(7, 6, "fan-bday-text");