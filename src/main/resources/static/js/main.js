/*
 * Purpose: Front-end behaviors and interactions.
 * Module responsibilities: Theme toggle, animations, data rendering, interactions.
 */

// —— 主题切换 ——
const themeBtn = document.getElementById("theme-toggle"),
    bodyEl   = document.body;
themeBtn.addEventListener("click", () => {
    bodyEl.classList.toggle("light");
    themeBtn.textContent = bodyEl.classList.contains("light") ? "🌙" : "☀️";
});

// —— 背景点动画 ——
// Canvas-based background dots animation.
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
// About section expand/collapse (if present).
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggle-btn');
    const content = document.getElementById('about-content');
    if (!toggleBtn || !content) return;

    toggleBtn.addEventListener('click', () => {
        content.classList.toggle('collapsed');
        content.classList.toggle('expanded');

        toggleBtn.textContent = content.classList.contains('expanded')
            ? '▲ Show Less'
            : '▼ Read More';
    });
});

// Email copy interaction for the contact icon.
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

// Splash overlay behavior
// Handles dismissal timing and input shortcuts.
document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.querySelector('.splash-overlay');
    if (!overlay) return;

    const skipBtn = overlay.querySelector('.splash-skip');
    const prefersReduced =
        window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    let closed = false;
    let autoTimer = null;
    let fallbackTimer = null;

    const focusFirstFocusable = () => {
        const selector = 'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
        const candidates = Array.from(document.querySelectorAll(selector))
            .filter((el) => !overlay.contains(el) && el.offsetParent !== null);
        if (candidates.length) {
            candidates[0].focus({ preventScroll: true });
        }
    };

    const cleanup = () => {
        document.body.style.overflow = previousOverflow;
        if (autoTimer) clearTimeout(autoTimer);
        if (fallbackTimer) clearTimeout(fallbackTimer);
        if (skipBtn) skipBtn.removeEventListener('click', onSkip);
        overlay.removeEventListener('click', onOverlayClick);
        window.removeEventListener('wheel', onUserScroll);
        window.removeEventListener('touchmove', onUserScroll);
        window.removeEventListener('keydown', onKeydown);
    };

    const finalizeClose = () => {
        overlay.classList.add('is-hidden');
        overlay.setAttribute('aria-hidden', 'true');
        cleanup();
        focusFirstFocusable();
    };

    const hideOverlay = (immediate) => {
        if (closed) return;
        closed = true;
        if (immediate) {
            finalizeClose();
            return;
        }
        overlay.classList.add('is-hiding');
        overlay.addEventListener('transitionend', finalizeClose, { once: true });
        fallbackTimer = setTimeout(finalizeClose, 700);
    };

    const onSkip = () => hideOverlay(true);
    const onOverlayClick = (event) => {
        if (event.target === overlay) hideOverlay(true);
    };
    const onUserScroll = () => hideOverlay(true);
    const onKeydown = (event) => {
        if (event.key === 'Escape') hideOverlay(true);
    };

    if (skipBtn) skipBtn.addEventListener('click', onSkip);
    overlay.addEventListener('click', onOverlayClick);
    window.addEventListener('wheel', onUserScroll, { passive: true });
    window.addEventListener('touchmove', onUserScroll, { passive: true });
    window.addEventListener('keydown', onKeydown);

    if (prefersReduced) {
        autoTimer = setTimeout(() => hideOverlay(false), 200);
    } else {
        autoTimer = setTimeout(() => hideOverlay(false), 2000);
    }
});

// Cursor-follow glow (desktop only)
document.addEventListener('DOMContentLoaded', () => {
    const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReduced =
        window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!supportsHover || prefersReduced) return;

    let rafId = null;
    let lastX = 0;
    let lastY = 0;

    const updateGlow = () => {
        bodyEl.style.setProperty('--cursor-x', `${lastX}px`);
        bodyEl.style.setProperty('--cursor-y', `${lastY}px`);
        rafId = null;
    };

    const onMove = (event) => {
        lastX = event.clientX;
        lastY = event.clientY;
        if (!rafId) rafId = requestAnimationFrame(updateGlow);
        if (!bodyEl.classList.contains('cursor-glow')) {
            bodyEl.classList.add('cursor-glow');
        }
    };

    const onLeave = () => {
        bodyEl.classList.remove('cursor-glow');
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave);
});

// Projects data rendering
// Fetches project data and injects cards.
document.addEventListener('DOMContentLoaded', () => {
    const featuredContainer = document.getElementById('featured-projects');
    const workContainer = document.getElementById('work-projects');
    if (!featuredContainer && !workContainer) return;

    const source =
        (featuredContainer && featuredContainer.dataset.source) ||
        (workContainer && workContainer.dataset.source) ||
        '/data/projects.json';

    const escapeHtml = (value) => {
        if (value === null || value === undefined) return '';
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    };

    const buildTagList = (items, className) => {
        if (!Array.isArray(items)) return '';
        const cls = className ? ` class="${className}"` : '';
        return items.map((tag) => `<span${cls}>${escapeHtml(tag)}</span>`).join('');
    };

    const githubIcon = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.32 6.84 9.67.5.1.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.37-3.37-1.37-.46-1.2-1.12-1.52-1.12-1.52-.91-.64.07-.63.07-.63 1.01.07 1.54 1.06 1.54 1.06.9 1.58 2.36 1.13 2.94.86.09-.67.35-1.13.64-1.39-2.22-.26-4.56-1.14-4.56-5.08 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.2 9.2 0 0 1 12 7.07c.83 0 1.67.11 2.45.33 1.9-1.33 2.74-1.05 2.74-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.95-2.35 4.81-4.58 5.06.36.32.69.94.69 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.59.69.48A10.02 10.02 0 0 0 22 12.26C22 6.58 17.52 2 12 2z"/>
        </svg>
    `;

    const buildGithubLink = (links, label) => {
        const safe = links || {};
        const href = safe.github || '#';
        return `<a class="icon-link" href="${escapeHtml(href)}" aria-label="${escapeHtml(label)}">${githubIcon}</a>`;
    };

    fetch(source)
        .then((response) => response.json())
        .then((projects) => {
            if (!Array.isArray(projects)) return;

            const featured = projects.filter((project) => project.featured);
            const work = projects.filter((project) => !project.featured);

            if (featuredContainer && featured.length) {
                featuredContainer.innerHTML = featured.map((project) => {
                    const tags = buildTagList(project.tags || project.stack);
                    const links = buildGithubLink(project.links, `${project.title} GitHub`);
                    const href = project.links && project.links.github || '#';
                    return `
                        <article class="project-card">
                            <a class="card-link" href="${escapeHtml(href)}" aria-label="${escapeHtml(project.title)} project page"></a>
                            <a class="project-media project-link" href="${escapeHtml(href)}" aria-label="${escapeHtml(project.title)} preview"></a>
                            <div class="project-body">
                                <h3><a class="project-title-link" href="${escapeHtml(href)}">${escapeHtml(project.title)}</a></h3>
                                <p>${escapeHtml(project.tagline)}</p>
                                <div class="project-tags">${tags}</div>
                                <div class="project-links">${links}</div>
                            </div>
                        </article>
                    `;
                }).join('');
            }

            if (workContainer && work.length) {
                workContainer.innerHTML = work.map((project) => {
                    const tags = buildTagList(project.stack || project.tags, 'work-tag');
                    const links = buildGithubLink(project.links, `${project.title} GitHub`);
                    const href = project.links && project.links.github || '#';
                    return `
                        <article class="work-card">
                            <a class="card-link" href="${escapeHtml(href)}" aria-label="${escapeHtml(project.title)} project page"></a>
                            <a class="work-media project-link" href="${escapeHtml(href)}" aria-label="${escapeHtml(project.title)} details"></a>
                            <div class="work-header">
                                <h3 class="work-title"><a class="project-title-link" href="${escapeHtml(href)}">${escapeHtml(project.title)}</a></h3>
                                <p class="work-desc">${escapeHtml(project.tagline)}</p>
                            </div>
                            <div class="work-tags">${tags}</div>
                            <div class="work-actions">${links}</div>
                        </article>
                    `;
                }).join('');
            }
        })
        .catch(() => {
            // Keep existing static content if data fails to load
        });
});

// Contact button copy to clipboard
// Uses Clipboard API with temporary label swap.
document.addEventListener('DOMContentLoaded', () => {
    const contactBtn = document.querySelector('.contact-copy');
    if (!contactBtn) return;
    contactBtn.addEventListener('click', () => {
        const email = contactBtn.getAttribute('data-email');
        if (!email) return;
        navigator.clipboard.writeText(email).then(() => {
            contactBtn.textContent = 'Email copied';
            setTimeout(() => {
                contactBtn.textContent = 'Say Hello';
            }, 2000);
        }).catch(() => {
            // no-op
        });
    });
});

