gsap.registerPlugin(ScrollTrigger);

// --- CONFIG ---
const GEMINI_API_KEY = "AIzaSyB0GiJ4QJjIwkzw_W43nZIwAE6VmSPtL1M"; // คีย์ AI เดิม
const startDate = new Date("2025-02-13T19:05:00");

// --- CLOUD CONFIG (JSONBin.io) ---
const BIN_ID = "69441e48d0ea881f40326a5f"; // ✅ เลขกล่อง
const API_KEY = "$2a$10$QamMd.vgRZdBKZx1H3wfDOYf55PD32oeSYjOJLygyVAUNnEcTTTKS"; // ✅ กุญแจลับ

// 1. Time Logic (Integer Months)
function updateClock() {
    const now = new Date();
    const diff = now.getTime() - startDate.getTime();

    let totalMonths = (now.getFullYear() - startDate.getFullYear()) * 12 + (now.getMonth() - startDate.getMonth());
    if (now.getDate() < startDate.getDate()) {
        totalMonths--;
    }

    const summaryEl = document.getElementById('time-summary');
    if (summaryEl) {
        const labelClass = "text-xl md:text-4xl block mt-4 font-sans tracking-widest text-blush-dark font-light opacity-80";
        
        if (totalMonths >= 12) {
            const yearsDisplay = (totalMonths / 12).toFixed(1);
            summaryEl.innerHTML = `${yearsDisplay} <span class="${labelClass}">YEARS</span>`;
        } else {
            const monthsDisplay = Math.max(0, totalMonths);
            summaryEl.innerHTML = `${monthsDisplay} <span class="${labelClass}">MONTHS</span>`;
        }
    }

    const timeData = {
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000)
    };
    for (let key in timeData) {
        const el = document.getElementById(key);
        if (el) el.innerText = String(timeData[key]).padStart(2, '0');
    }
}

// 2. Heart Effect
function createHeart() {
    const container = document.getElementById('hearts-container');
    if (!container) return;
    const heart = document.createElement('div');
    heart.className = 'heart';
    heart.innerHTML = '♥';
    heart.style.left = Math.random() * 100 + 'vw';
    heart.style.bottom = '-5%';
    heart.style.fontSize = (Math.random() * 15 + 10) + 'px';
    container.appendChild(heart);
    
    gsap.to(heart, { 
        y: -(window.innerHeight + 100), 
        x: (Math.random() - 0.5) * 200, 
        rotation: Math.random() * 360,
        opacity: 0, 
        duration: 8 + Math.random() * 5, 
        onComplete: () => heart.remove() 
    });
}

// 3. Cloud Note System ☁️
async function loadNote() {
    const display = document.getElementById('note-display');
    const dateInput = document.getElementById('note-date');
    if (!dateInput) return;

    // Loading State
    display.innerHTML = '<div class="flex flex-col items-center justify-center py-10 opacity-50"><div class="w-6 h-6 border-2 border-cocoa border-t-transparent rounded-full animate-spin mb-2"></div><span class="text-xs font-serif italic">Syncing Diary...</span></div>';

    try {
        const res = await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}/latest`, {
            headers: { 'X-Master-Key': API_KEY }
        });
        
        if (!res.ok) throw new Error("Load Failed");

        const data = await res.json();
        const allNotes = data.record || {}; 
        
        const selectedDate = dateInput.value;
        const notes = allNotes[selectedDate] || [];

        // Render Notes
        display.innerHTML = notes.length ? notes.map(n => `
            <div class="note-item animate-fade-in">
                <p class="text-sm mb-1 font-serif italic">"${n.text}"</p>
                <div class="flex justify-between text-[9px] font-sans uppercase tracking-wider opacity-70">
                    <span>— ${n.author}</span><span>${n.time}</span>
                </div>
            </div>
        `).join('') : '<p class="text-xs opacity-50 italic py-6 text-center font-serif">Page is blank...</p>';

        window.currentCloudData = allNotes; // Cache data

    } catch (e) {
        console.error(e);
        display.innerHTML = '<p class="text-xs text-red-400 italic py-6 text-center font-serif">Sync Error! (Check Connection)</p>';
    }
}

async function saveNote() {
    const text = document.getElementById('note-input').value.trim();
    const author = document.getElementById('note-author').value.trim() || "Us";
    
    if (!text) return alert("Please write something...");

    const saveBtn = document.querySelector('button[onclick="saveNote()"]');
    const originalBtnText = saveBtn.innerText;
    saveBtn.innerText = "Saving...";
    saveBtn.disabled = true;
    saveBtn.classList.add("opacity-50", "cursor-not-allowed");

    try {
        const now = new Date();
        const todayKey = now.toISOString().split('T')[0];
        const time = now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
        
        // ใช้ข้อมูลล่าสุดที่โหลดมา หรือสร้างใหม่
        let allNotes = window.currentCloudData || {};
        if (!allNotes[todayKey]) allNotes[todayKey] = [];
        
        // เพิ่มโน้ตใหม่
        allNotes[todayKey].unshift({ text, author, time });

        // ยิงขึ้น Cloud
        await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": API_KEY
            },
            body: JSON.stringify(allNotes)
        });

        // สำเร็จ: เคลียร์ค่าและโหลดใหม่
        document.getElementById('note-input').value = "";
        loadNote(); 

    } catch (e) {
        alert("Save Failed! Please check internet connection.");
        console.error(e);
    } finally {
        saveBtn.innerText = originalBtnText;
        saveBtn.disabled = false;
        saveBtn.classList.remove("opacity-50", "cursor-not-allowed");
    }
}

// 4. Chat AI
const MODEL_LIST = [
    "gemma-3-4b-it", "gemma-3-1b-it", "gemini-2.0-flash-lite-preview-02-05"
];

async function sendMessage() {
    const input = document.getElementById('chat-input');
    const box = document.getElementById('chat-box');
    const msg = input.value.trim();
    
    if (!msg) return;

    box.innerHTML += `<div class="user-msg">${msg}</div>`;
    input.value = "";
    box.scrollTop = box.scrollHeight;

    const loadingId = "loading-" + Date.now();
    box.innerHTML += `<div id="${loadingId}" class="ai-msg opacity-50 text-[10px]">P'Nu is typing...</div>`;
    box.scrollTop = box.scrollHeight;

    let aiResponseText = "";
    let success = false;

    for (const modelName of MODEL_LIST) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `Roleplay: คุณคือ "พี่นุ" แฟนหนุ่ม
                            โจทย์: ตอบแชทแฟนสาว (น้องครีม) ที่พิมพ์มาว่า "${msg}"
                            เงื่อนไข: ตอบสั้นๆ หวานๆ หรือกวนๆ แบบแฟนคุยกัน (ภาษาไทย) ห้ามทวนคำถาม`
                        }]
                    }]
                })
            });

            if (!response.ok) continue;
            const data = await response.json();
            if (data.candidates && data.candidates[0].content) {
                let text = data.candidates[0].content.parts[0].text;
                text = text.replace(/^(โอเค|ตกลง|ได้เลย)!?\s*/i, "").trim(); 
                aiResponseText = text;
                success = true;
                break;
            }
        } catch (e) {}
    }

    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) loadingEl.remove();

    if (success) {
        box.innerHTML += `<div class="ai-msg">${aiResponseText}</div>`;
    } else {
        box.innerHTML += `<div class="ai-msg">รักนะครับ (ระบบกำลังจูนสมองนิดหน่อย) ❤️</div>`;
    }
    box.scrollTop = box.scrollHeight;
}

// Init
const initBday = (m, d, id) => {
    let now = new Date(); let b = new Date(now.getFullYear(), m - 1, d);
    if (now > b) b.setFullYear(now.getFullYear() + 1);
    const el = document.getElementById(id);
    if(el) el.innerText = `Next Birthday in ${Math.ceil((b - now) / 86400000)} Days`;
};

// Start System
document.addEventListener('DOMContentLoaded', () => {
    // Setup Calendar
    flatpickr("#note-date", {
        defaultDate: "today", dateFormat: "Y-m-d", disableMobile: true, monthSelectorType: "static",
        onChange: () => loadNote()
    });
    
    // Load Initial Cloud Data
    loadNote();

    // Start Loops
    setInterval(updateClock, 1000);
    setInterval(createHeart, 800);
    updateClock();
    initBday(9, 2, "my-bday-text");
    initBday(7, 6, "fan-bday-text");
});