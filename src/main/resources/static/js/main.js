// —— 主题切换 ——
const themeBtn = document.getElementById("theme-toggle"),
    bodyEl   = document.body;
themeBtn.addEventListener("click", () => {
    bodyEl.classList.toggle("light");
    themeBtn.textContent = bodyEl.classList.contains("light") ? "🌙" : "☀️";
});

// —— 背景点动画 ——
(function(){
    const canvas = document.getElementById('bg-canvas'),
        ctx    = canvas.getContext('2d');
    let w,h,dots;

    function init() {
        w = canvas.width  = window.innerWidth;
        h = canvas.height = window.innerHeight;
        dots = [];
        const count = Math.floor((w*h)/20000);
        for (let i = 0; i < count; i++) {
            dots.push({
                x: Math.random()*w,
                y: Math.random()*h,
                r: 1 + Math.random()*1.5,
                vy: 0.2 + Math.random()*0.5,
                vx: -0.3 + Math.random()*0.6
            });
        }
    }

    function draw() {
        ctx.clearRect(0,0,w,h);
        ctx.fillStyle = getComputedStyle(document.body)
            .getPropertyValue('--dot-color').trim();

        for (const d of dots) {
            ctx.beginPath();
            ctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
            ctx.fill();
            d.x += d.vx; d.y += d.vy;
            if (d.y > h) d.y = 0;
            if (d.x < 0) d.x = w;
            if (d.x > w) d.x = 0;
        }
        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', init);
    init();
    draw();
})();

//about me read more button
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggle-btn');
    const content = document.getElementById('about-content');

    toggleBtn.addEventListener('click', () => {
        content.classList.toggle('collapsed');
        content.classList.toggle('expanded');

        toggleBtn.textContent = content.classList.contains('expanded')
            ? '▲ Show Less'
            : '▼ Read More';
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const emailWrapper = document.getElementById('email-copy');

    emailWrapper.addEventListener('click', () => {
        const email = emailWrapper.getAttribute('data-email');

        // 使用 Clipboard API
        navigator.clipboard.writeText(email).then(() => {
            emailWrapper.setAttribute('aria-label', 'Copied!');
            emailWrapper.classList.add('copied');

            setTimeout(() => {
                emailWrapper.setAttribute('aria-label', 'Click to copy email');
                emailWrapper.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy email:', err);
        });
    });
});

