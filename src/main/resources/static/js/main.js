/*
 * Purpose: Front-end behaviors and interactions.
 * Module responsibilities: Theme toggle, animations, data rendering, interactions.
 */

// Theme toggle
const themeBtn = document.getElementById("theme-toggle"),
    bodyEl   = document.body;
if (themeBtn) {
    themeBtn.textContent = bodyEl.classList.contains("light") ? "🌙" : "☀️";
    themeBtn.addEventListener("click", () => {
        bodyEl.classList.toggle("light");
        themeBtn.textContent = bodyEl.classList.contains("light") ? "🌙" : "☀️";
    });
}

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

// About section expand/collapse (if present).
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('toggle-btn');
    const content = document.getElementById('about-content');
    if (!toggleBtn || !content) return;

    toggleBtn.addEventListener('click', () => {
        content.classList.toggle('collapsed');
        content.classList.toggle('expanded');

        toggleBtn.textContent = content.classList.contains('expanded')
            ? 'Show Less'
            : 'Read More';
    });
});

// Email copy interaction for the contact icon.
document.addEventListener('DOMContentLoaded', () => {
    const emailWrapper = document.getElementById('email-copy');

    emailWrapper.addEventListener('click', () => {
        const email = emailWrapper.getAttribute('data-email');

        // Use Clipboard API
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

// Beyond section lightweight expandable cards.
document.addEventListener('DOMContentLoaded', () => {
    const beyondContainer = document.getElementById('beyond-cards');
    if (!beyondContainer) return;
    const beyondSection = document.getElementById('beyond');

    const cards = Array.from(beyondContainer.querySelectorAll('.beyond-card'));
    if (!cards.length) return;

    const closeCard = (card) => {
        card.setAttribute('aria-expanded', 'false');
        const detailId = card.getAttribute('aria-controls');
        if (!detailId) return;
        const detailEl = document.getElementById(detailId);
        if (detailEl) detailEl.hidden = true;
        if (beyondSection) {
            const hasOpenCard = cards.some((entry) => entry.getAttribute('aria-expanded') === 'true');
            if (!hasOpenCard) beyondSection.classList.remove('is-expanded');
        }
    };

    const openCard = (card) => {
        cards.forEach((other) => {
            if (other !== card) closeCard(other);
        });
        card.setAttribute('aria-expanded', 'true');
        const detailId = card.getAttribute('aria-controls');
        if (!detailId) return;
        const detailEl = document.getElementById(detailId);
        if (detailEl) detailEl.hidden = false;
        if (beyondSection) beyondSection.classList.add('is-expanded');
    };

    const toggleCard = (card) => {
        if (card.getAttribute('aria-expanded') === 'true') {
            closeCard(card);
            return;
        }
        openCard(card);
    };

    cards.forEach((card) => {
        card.addEventListener('click', () => {
            toggleCard(card);
        });
        card.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                toggleCard(card);
            }
        });
    });
});

// Projects data rendering with expandable details.
document.addEventListener('DOMContentLoaded', () => {
    const workContainer = document.getElementById('work-projects');
    if (!workContainer) return;

    const source = workContainer.dataset.source || '/data/projects.json';

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
        if (!href || href === '#') {
            return `<span class="icon-link project-external-link is-placeholder" aria-label="${escapeHtml(label)} placeholder" title="GitHub link coming soon">${githubIcon}</span>`;
        }
        return `<a class="icon-link project-external-link" href="${escapeHtml(href)}" aria-label="${escapeHtml(label)}" target="_blank" rel="noopener">${githubIcon}</a>`;
    };

    const buildList = (items, className) => {
        if (!Array.isArray(items) || !items.length) return '';
        return `<ul class="${className}">${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
    };

    const resolveDemoVideo = (project) => {
        if (!project || typeof project !== 'object') return '';
        if (project.media && typeof project.media.demoVideo === 'string' && project.media.demoVideo.trim()) {
            return project.media.demoVideo.trim();
        }
        if (typeof project.demoVideo === 'string' && project.demoVideo.trim()) {
            return project.demoVideo.trim();
        }
        if (project.details && typeof project.details.demoVideo === 'string' && project.details.demoVideo.trim()) {
            return project.details.demoVideo.trim();
        }
        return '';
    };

    const buildCardMediaPreview = (project) => {
        const demoVideoSrc = resolveDemoVideo(project);
        if (!demoVideoSrc) {
            return `
                <div class="work-media-placeholder" aria-hidden="true">
                    <span>Demo preview coming soon</span>
                </div>
            `;
        }
        return `
            <button class="work-media-preview-btn" type="button" aria-label="${escapeHtml(project.title)} demo preview">
                <video class="work-media-preview-video" autoplay muted loop playsinline preload="metadata">
                    <source src="${escapeHtml(demoVideoSrc)}" type="video/mp4"/>
                </video>
            </button>
        `;
    };

    const buildDiagrams = (diagrams, title) => {
        if (!Array.isArray(diagrams) || !diagrams.length) return '';
        return `
            <div class="work-diagrams" aria-label="${escapeHtml(title)} diagrams">
                ${diagrams.map((diagram) => {
                    if (!diagram || !diagram.path) return '';
                    const label = diagram.label || 'Diagram';
                    return `
                        <figure class="work-diagram-item">
                            <figcaption>${escapeHtml(label)}</figcaption>
                            <img src="${escapeHtml(diagram.path)}" alt="${escapeHtml(title)} ${escapeHtml(label)}" loading="lazy"/>
                        </figure>
                    `;
                }).join('')}
            </div>
        `;
    };

    const findDiagramPath = (details, keyword) => {
        const diagrams = details && Array.isArray(details.diagrams) ? details.diagrams : [];
        const lowerKeyword = String(keyword || '').toLowerCase();
        const target = diagrams.find((diagram) => {
            const label = String(diagram && diagram.label || '').toLowerCase();
            const path = String(diagram && diagram.path || '').toLowerCase();
            return label.includes(lowerKeyword) || path.includes(lowerKeyword);
        });
        return target && target.path ? target.path : '';
    };

    const inferListClass = (title, section) => {
        if (section && section.listClass) return section.listClass;
        const lowerTitle = String(title || '').toLowerCase();
        if (lowerTitle.includes('workflow')) return 'work-flow-list';
        if (lowerTitle.includes('decision')) return 'work-decision-list';
        return 'work-feature-list';
    };

    const buildCustomSection = (projectTitle, section) => {
        if (!section || !section.title) return '';
        const title = section.title;
        const text = section.text ? `<p>${escapeHtml(section.text)}</p>` : '';
        const listClass = inferListClass(title, section);
        const list = Array.isArray(section.list) && section.list.length
            ? buildList(section.list, listClass)
            : '';
        const diagramPath = section.diagramPath ? String(section.diagramPath).trim() : '';
        const diagramClass = section.diagramClass ? ` ${escapeHtml(section.diagramClass)}` : '';
        const diagramAlt = section.diagramAlt || `${projectTitle} ${title} diagram`;
        const diagram = diagramPath
            ? `<div class="work-diagram-frame"><img class="work-section-diagram${diagramClass} work-previewable" src="${escapeHtml(diagramPath)}" alt="${escapeHtml(diagramAlt)}" loading="lazy"/></div>`
            : '';
        return `<h4>${escapeHtml(title)}</h4>${diagram}${text}${list}`;
    };

    const buildDetails = (project, detailId) => {
        const details = project && project.details ? project.details : {};
        const customSections = Array.isArray(details.sections) ? details.sections : [];
        if (customSections.length) {
            return `
                <div id="${escapeHtml(detailId)}" class="work-details" hidden>
                    ${customSections.map((section) => buildCustomSection(project.title, section)).join('')}
                </div>
            `;
        }
        const hasDetailsContent = details.whyBuilt || details.architecture || details.database ||
            (Array.isArray(details.coreWorkflow) && details.coreWorkflow.length) ||
            (Array.isArray(details.keyFeatures) && details.keyFeatures.length) ||
            (Array.isArray(details.engineeringDecisions) && details.engineeringDecisions.length) ||
            (Array.isArray(details.diagrams) && details.diagrams.length);
        if (!hasDetailsContent) return '';

        const workflowDiagramPath = findDiagramPath(details, 'flow');
        const architectureDiagramPath = findDiagramPath(details, 'architecture');
        const databaseDiagramPath = findDiagramPath(details, 'database');

        return `
            <div id="${escapeHtml(detailId)}" class="work-details" hidden>
                ${details.whyBuilt ? `<h4>Why I Built It</h4><p>${escapeHtml(details.whyBuilt)}</p>` : ''}
                ${
                    workflowDiagramPath
                        ? `<h4>Workflow</h4><div class="work-diagram-frame"><img class="work-section-diagram diagram-workflow work-previewable" src="${escapeHtml(workflowDiagramPath)}" alt="${escapeHtml(project.title)} Workflow diagram" loading="lazy"/></div>`
                        : (Array.isArray(details.coreWorkflow) && details.coreWorkflow.length ? `<h4>Workflow</h4>${buildList(details.coreWorkflow, 'work-flow-list')}` : '')
                }
                ${Array.isArray(details.keyFeatures) && details.keyFeatures.length ? `<h4>Key Features</h4>${buildList(details.keyFeatures, 'work-feature-list')}` : ''}
                ${
                    details.architecture || architectureDiagramPath
                        ? `<h4>Architecture Design</h4>${architectureDiagramPath ? `<div class="work-diagram-frame"><img class="work-section-diagram diagram-architecture work-previewable" src="${escapeHtml(architectureDiagramPath)}" alt="${escapeHtml(project.title)} Architecture diagram" loading="lazy"/></div>` : ''}${details.architecture ? `<p>${escapeHtml(details.architecture)}</p>` : ''}`
                        : ''
                }
                ${
                    details.database || databaseDiagramPath
                        ? `<h4>Database Design</h4>${databaseDiagramPath ? `<div class="work-diagram-frame"><img class="work-section-diagram diagram-database work-previewable" src="${escapeHtml(databaseDiagramPath)}" alt="${escapeHtml(project.title)} Database ER diagram" loading="lazy"/></div>` : ''}${details.database ? `<p>${escapeHtml(details.database)}</p>` : ''}`
                        : ''
                }
                ${Array.isArray(details.engineeringDecisions) && details.engineeringDecisions.length ? `<h4>Engineering Decisions</h4>${buildList(details.engineeringDecisions, 'work-decision-list')}` : ''}
            </div>
        `;
    };

    const sanitizeSvgStyle = (styleValue) => {
        if (!styleValue) return '';
        return styleValue
            .replace(/background-color\s*:[^;]+;?/gi, '')
            .replace(/\s{2,}/g, ' ')
            .trim();
    };

    const normalizeSvgImage = async (imageEl) => {
        if (!imageEl) return;
        if (imageEl.dataset.svgNormalized === 'true') return;
        if (imageEl.dataset.svgNormalizing === 'true') {
            return new Promise((resolve) => {
                const timer = setInterval(() => {
                    if (imageEl.dataset.svgNormalizing !== 'true') {
                        clearInterval(timer);
                        resolve();
                    }
                }, 60);
            });
        }
        const src = imageEl.getAttribute('src') || '';
        if (!src.toLowerCase().endsWith('.svg')) return;

        imageEl.dataset.svgNormalizing = 'true';
        try {
            const response = await fetch(src);
            if (!response.ok) throw new Error('Failed to fetch svg');
            const svgText = await response.text();
            const parser = new DOMParser();
            const svgDoc = parser.parseFromString(svgText, 'image/svg+xml');
            const svgRoot = svgDoc.documentElement;
            if (!svgRoot || svgRoot.nodeName.toLowerCase() !== 'svg') throw new Error('Invalid svg');

            // Reset exported pan/zoom transform to avoid huge virtual canvas
            // that makes real diagram content appear as tiny dots.
            const viewportGroup = svgRoot.querySelector('.svg-pan-zoom_viewport');
            if (viewportGroup) {
                viewportGroup.removeAttribute('transform');
                const viewportStyle = viewportGroup.getAttribute('style') || '';
                const cleanedViewportStyle = viewportStyle
                    .replace(/transform\s*:[^;]+;?/gi, '')
                    .replace(/\s{2,}/g, ' ')
                    .trim();
                if (cleanedViewportStyle) {
                    viewportGroup.setAttribute('style', cleanedViewportStyle);
                } else {
                    viewportGroup.removeAttribute('style');
                }
            }

            const measurementHost = document.createElement('div');
            measurementHost.style.position = 'fixed';
            measurementHost.style.left = '-10000px';
            measurementHost.style.top = '0';
            measurementHost.style.visibility = 'hidden';
            measurementHost.style.pointerEvents = 'none';

            const measuredSvg = document.importNode(svgRoot, true);
            measuredSvg.setAttribute('width', '2000');
            measuredSvg.setAttribute('height', '2000');
            measurementHost.appendChild(measuredSvg);
            document.body.appendChild(measurementHost);

            let bbox = null;
            const bboxTarget = measuredSvg.querySelector('.svg-pan-zoom_viewport') || measuredSvg.querySelector('g') || measuredSvg;
            if (bboxTarget && typeof bboxTarget.getBBox === 'function') {
                bbox = bboxTarget.getBBox();
            }
            document.body.removeChild(measurementHost);

            if (bbox && bbox.width > 0 && bbox.height > 0) {
                svgRoot.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
            }
            svgRoot.setAttribute('preserveAspectRatio', 'xMidYMid meet');
            svgRoot.removeAttribute('width');
            svgRoot.removeAttribute('height');
            const cleanedStyle = sanitizeSvgStyle(svgRoot.getAttribute('style') || '');
            if (cleanedStyle) {
                svgRoot.setAttribute('style', cleanedStyle);
            } else {
                svgRoot.removeAttribute('style');
            }

            const serialized = new XMLSerializer().serializeToString(svgRoot);
            const blob = new Blob([serialized], { type: 'image/svg+xml' });
            const objectUrl = URL.createObjectURL(blob);
            imageEl.setAttribute('src', objectUrl);
            imageEl.dataset.previewSrc = objectUrl;
            imageEl.dataset.svgNormalized = 'true';
        } catch (_) {
            imageEl.dataset.svgNormalized = 'false';
        } finally {
            imageEl.dataset.svgNormalizing = 'false';
        }
    };

    const normalizeSvgDiagrams = (container) => {
        const svgImages = container.querySelectorAll('.work-section-diagram');
        svgImages.forEach((img) => {
            normalizeSvgImage(img);
        });
    };

    const ensureImagePreviewOverlay = () => {
        let overlay = document.querySelector('.image-preview-overlay');
        if (overlay) return overlay;

        overlay = document.createElement('div');
        overlay.className = 'image-preview-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        overlay.innerHTML = `
            <button class="image-preview-close" type="button" aria-label="Close preview">×</button>
            <div class="image-preview-viewport">
                <img class="image-preview-content" alt="Expanded project diagram preview"/>
            </div>
        `;
        document.body.appendChild(overlay);

        const closeOverlay = () => {
            overlay.classList.remove('is-open');
            overlay.setAttribute('aria-hidden', 'true');
        };

        overlay.addEventListener('click', (event) => {
            if (event.target === overlay || event.target.classList.contains('image-preview-close')) {
                closeOverlay();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && overlay.classList.contains('is-open')) {
                closeOverlay();
            }
        });

        return overlay;
    };

    const ensureVideoPreviewOverlay = () => {
        let overlay = document.querySelector('.video-preview-overlay');
        if (overlay) return overlay;

        overlay = document.createElement('div');
        overlay.className = 'video-preview-overlay';
        overlay.setAttribute('aria-hidden', 'true');
        overlay.innerHTML = `
            <button class="video-preview-close" type="button" aria-label="Close video preview">×</button>
            <div class="video-preview-viewport">
                <video class="video-preview-content" controls playsinline preload="metadata">
                    <source src="" type="video/mp4"/>
                </video>
            </div>
        `;
        document.body.appendChild(overlay);

        const modalVideo = overlay.querySelector('.video-preview-content');
        const modalSource = modalVideo ? modalVideo.querySelector('source') : null;
        const closeOverlay = () => {
            overlay.classList.remove('is-open');
            overlay.setAttribute('aria-hidden', 'true');
            if (modalVideo) {
                modalVideo.pause();
                modalVideo.currentTime = 0;
            }
            if (modalSource) {
                modalSource.setAttribute('src', '');
                if (modalVideo) modalVideo.load();
            }
        };

        overlay.addEventListener('click', (event) => {
            if (event.target === overlay || event.target.classList.contains('video-preview-close')) {
                closeOverlay();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && overlay.classList.contains('is-open')) {
                closeOverlay();
            }
        });

        return overlay;
    };

    const bindImagePreview = (container) => {
        const overlay = ensureImagePreviewOverlay();
        const previewImg = overlay.querySelector('.image-preview-content');
        const previewableImages = container.querySelectorAll('.work-previewable');

        previewableImages.forEach((imageEl) => {
            imageEl.addEventListener('click', async (event) => {
                event.stopPropagation();
                await normalizeSvgImage(imageEl);
                const src = imageEl.dataset.previewSrc || imageEl.getAttribute('src');
                const alt = imageEl.getAttribute('alt') || 'Project diagram preview';
                if (!src || !previewImg) return;
                previewImg.setAttribute('src', src);
                previewImg.setAttribute('alt', alt);
                overlay.classList.add('is-open');
                overlay.setAttribute('aria-hidden', 'false');
            });
        });
    };

    const bindVideoPreview = (container) => {
        const overlay = ensureVideoPreviewOverlay();
        const modalVideo = overlay.querySelector('.video-preview-content');
        const modalSource = modalVideo ? modalVideo.querySelector('source') : null;
        const previewButtons = container.querySelectorAll('.work-media-preview-btn');

        previewButtons.forEach((buttonEl) => {
            buttonEl.addEventListener('click', (event) => {
                event.stopPropagation();
                const previewVideo = buttonEl.querySelector('.work-media-preview-video');
                const sourceEl = previewVideo ? previewVideo.querySelector('source') : null;
                const src = sourceEl ? sourceEl.getAttribute('src') : '';
                if (!src || !modalVideo || !modalSource) return;
                modalSource.setAttribute('src', src);
                modalVideo.load();
                modalVideo.currentTime = 0;
                overlay.classList.add('is-open');
                overlay.setAttribute('aria-hidden', 'false');
            });
        });
    };

    fetch(source, { cache: 'no-store' })
        .then((response) => response.json())
        .then((projects) => {
            if (!Array.isArray(projects)) return;
            const visibleProjects = projects.filter(Boolean);
            if (!visibleProjects.length) return;

            const projectOrder = ['javainsight', 'job-application-tracker'];
            visibleProjects.sort((a, b) => {
                const ai = projectOrder.indexOf(String(a && a.id || '').toLowerCase());
                const bi = projectOrder.indexOf(String(b && b.id || '').toLowerCase());
                const av = ai === -1 ? Number.MAX_SAFE_INTEGER : ai;
                const bv = bi === -1 ? Number.MAX_SAFE_INTEGER : bi;
                return av - bv;
            });

            const count = visibleProjects.length;
            workContainer.style.setProperty('--project-columns', String(Math.min(3, count)));
            workContainer.style.setProperty('--project-columns-md', String(Math.min(2, count)));

            workContainer.innerHTML = visibleProjects.map((project) => {
                const tags = buildTagList(project.stack || project.tags, 'work-tag');
                const links = buildGithubLink(project.links, `${project.title} GitHub`);
                const summary = project.summaryLine || project.tagline || '';
                const rawDetailKey = String(project.id || project.title || 'project');
                const detailId = `work-details-${rawDetailKey.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
                const detailsHtml = buildDetails(project, detailId);
                return `
                    <article class="work-card" tabindex="0" role="button" aria-expanded="false" aria-controls="${escapeHtml(detailId)}">
                        <div class="work-header">
                            <h3 class="work-title">${escapeHtml(project.title)}</h3>
                            <div class="work-top-row">
                                <div class="work-top-media">
                                    ${buildCardMediaPreview(project)}
                                </div>
                                <div class="work-top-meta">
                                    <p class="work-desc">${escapeHtml(summary)}</p>
                                    <div class="work-tags">${tags}</div>
                                    <div class="work-actions">${links}</div>
                                </div>
                            </div>
                        </div>
                        ${detailsHtml}
                    </article>
                `;
            }).join('');

            const cards = Array.from(workContainer.querySelectorAll('.work-card'));
            const closeCard = (card) => {
                card.classList.remove('is-expanded');
                card.setAttribute('aria-expanded', 'false');
                const detailId = card.getAttribute('aria-controls');
                if (!detailId) return;
                const detailEl = document.getElementById(detailId);
                if (detailEl) detailEl.hidden = true;
            };
            const openCard = (card) => {
                cards.forEach((other) => {
                    if (other !== card) closeCard(other);
                });
                card.classList.add('is-expanded');
                card.setAttribute('aria-expanded', 'true');
                const detailId = card.getAttribute('aria-controls');
                if (!detailId) return;
                const detailEl = document.getElementById(detailId);
                if (detailEl) detailEl.hidden = false;
            };
            const toggleCard = (card) => {
                if (card.classList.contains('is-expanded')) {
                    closeCard(card);
                } else {
                    openCard(card);
                }
            };

            cards.forEach((card) => {
                card.addEventListener('click', (event) => {
                    const externalLink = event.target.closest('.project-external-link');
                    if (externalLink) return;
                    toggleCard(card);
                });
                card.addEventListener('keydown', (event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        toggleCard(card);
                    }
                });
            });
            normalizeSvgDiagrams(workContainer);
            bindImagePreview(workContainer);
            bindVideoPreview(workContainer);
        })
        .catch(() => {
            workContainer.innerHTML = '<p class="work-desc">Projects are temporarily unavailable. Please refresh the page.</p>';
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
