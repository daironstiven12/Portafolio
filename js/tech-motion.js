/* tech-motion.js — marquesina, ruleta 3D, puntos de marca y línea de trayectoria.
   Sin dependencias; respeta prefers-reduced-motion. */
(function () {
    'use strict';

    var SITE = window.SITE || {};
    var LOGOS = window.SITE_LOGOS || {};
    var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
    function reduced() { return reduceMQ.matches; }
    function qs(s, r) { return (r || document).querySelector(s); }
    function qsa(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
    function esc(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }
    function logoOf(key) {
        var s = LOGOS[key];
        return (typeof s === 'string' && s.indexOf('<svg') === 0) ? s : '';
    }

    /* Lista plana de herramientas con logo */
    var items = [];
    (SITE.tools || []).forEach(function (g) {
        (g.items || []).forEach(function (it) {
            if (!it || !it.key || !logoOf(it.key)) return;
            if (items.some(function (x) { return x.key === it.key; })) return;
            items.push({ key: it.key, name: it.name || it.key, desc: it.desc || '', kind: g.kind || 'tool' });
        });
    });

    /* ------------------------- Marquesina ------------------------------ */
    function buildMarquee() {
        var rows = qsa('[data-marquee]');
        if (!rows.length || !items.length) return;
        var anims = [];

        rows.forEach(function (row, idx) {
            var kind = row.getAttribute('data-marquee');
            var list = items.filter(function (i) { return i.kind === kind; });
            if (list.length < 4) list = items.slice();
            if (idx % 2) list = list.slice().reverse();

            function set(hidden) {
                return '<ul class="marquee-set"' + (hidden ? ' aria-hidden="true"' : '') + '>' +
                    list.map(function (i) {
                        return '<li class="mq-item lg-' + esc(i.key) + '"><span class="mq-logo">' +
                            logoOf(i.key) + '</span>' + esc(i.name) + '</li>';
                    }).join('') + '</ul>';
            }
            row.innerHTML = set(false) + set(true) + set(true);
            if (reduced() || !row.animate) { row.parentNode.style.overflowX = 'auto'; return; }

            var dir = idx % 2 ? 1 : -1;
            var w = row.firstElementChild.getBoundingClientRect().width;
            var kf = dir < 0
                ? [{ transform: 'translateX(0)' }, { transform: 'translateX(' + (-w) + 'px)' }]
                : [{ transform: 'translateX(' + (-w) + 'px)' }, { transform: 'translateX(0)' }];
            var a = row.animate(kf, { duration: Math.max(18000, w * 22), iterations: Infinity, easing: 'linear' });
            anims.push(a);
        });
        if (!anims.length) return;

        var box = qs('.marquee');
        var hover = false, rate = 1, target = 1, lastY = window.scrollY, lastT = performance.now();
        box.addEventListener('pointerenter', function () { hover = true; });
        box.addEventListener('pointerleave', function () { hover = false; });

        window.addEventListener('scroll', function () {
            var now = performance.now(), dy = Math.abs(window.scrollY - lastY);
            var v = dy / Math.max(16, now - lastT);
            target = 1 + Math.min(v * 1.4, 5);
            lastY = window.scrollY; lastT = now;
        }, { passive: true });

        (function loop() {
            var goal = hover ? 0.12 : target;
            rate += (goal - rate) * 0.08;
            target += (1 - target) * 0.05;
            anims.forEach(function (a) { a.playbackRate = rate; });
            requestAnimationFrame(loop);
        })();

        document.addEventListener('visibilitychange', function () {
            anims.forEach(function (a) { document.hidden ? a.pause() : a.play(); });
        });
    }

    /* --------------------- Puntos de marca en chips -------------------- */
    function brandChips() {
        var alias = {
            'html': 'html5', 'html5': 'html5', 'css': 'css', 'css3': 'css', 'js': 'javascript',
            'javascript': 'javascript', 'node.js': 'nodedotjs', 'node': 'nodedotjs', 'nodejs': 'nodedotjs',
            'tailwind': 'tailwindcss', 'tailwind css': 'tailwindcss', 'postgres': 'postgresql',
            'nest': 'nestjs', 'nest.js': 'nestjs', 'gemini': 'googlegemini', 'ts': 'typescript',
            'vs code': 'vscode', 'react native': 'react'
        };
        var map = {};
        items.forEach(function (i) {
            map[i.key] = i.key;
            map[i.name.toLowerCase()] = i.key;
        });
        Object.keys(alias).forEach(function (k) { if (map[alias[k]] || logoOf(alias[k])) map[k] = alias[k]; });
        qsa('.chip').forEach(function (c) {
            var key = map[c.textContent.trim().toLowerCase()];
            if (key) c.classList.add('lg-' + key);
        });
    }

    /* ----------------------------- Ruleta ------------------------------ */
    function buildWheel() {
        var host = qs('[data-tool-wheel]');
        var toggle = qs('[data-tool-view]');
        var tabs = qs('[data-tool-tabs]');
        var rows = qs('[data-render="tools"]');
        if (!host || !toggle || !rows || items.length < 5) { if (toggle) toggle.hidden = true; return; }

        var n = items.length, step = 360 / n;
        host.innerHTML =
            '<div class="wheel-stage" tabindex="0" role="group" aria-roledescription="ruleta" ' +
            'aria-label="Ruleta de tecnologías. Usa las flechas izquierda y derecha.">' +
            '<div class="wheel-ring"></div></div>' +
            '<div class="wheel-info" aria-live="polite"><div class="wheel-info-name"></div>' +
            '<p class="wheel-info-desc"></p></div>' +
            '<div class="wheel-actions">' +
            '<button type="button" class="wheel-btn" data-w="prev" aria-label="Anterior"><i class="ri-arrow-left-s-line" aria-hidden="true"></i></button>' +
            '<button type="button" class="wheel-btn wheel-btn--spin" data-w="spin"><i class="ri-shuffle-line" aria-hidden="true"></i> Girar ruleta</button>' +
            '<button type="button" class="wheel-btn" data-w="next" aria-label="Siguiente"><i class="ri-arrow-right-s-line" aria-hidden="true"></i></button>' +
            '</div>';

        var stage = qs('.wheel-stage', host), ring = qs('.wheel-ring', host);
        var nameEl = qs('.wheel-info-name', host), descEl = qs('.wheel-info-desc', host);
        var els = items.map(function (it, i) {
            var d = document.createElement('div');
            d.className = 'wheel-item lg-' + it.key;
            d.innerHTML = '<span class="wheel-logo" aria-hidden="true">' + logoOf(it.key) +
                '</span><span class="wheel-name">' + esc(it.name) + '</span>';
            d.addEventListener('click', function () { if (!moved) goTo(i); });
            ring.appendChild(d);
            return d;
        });

        var R = 300, rot = 0, vel = 0, auto = !reduced(), dragging = false, moved = false;
        var lastX = 0, active = -1, visible = false, tween = null, resume = 0;

        function size() {
            var w = Math.max(84, els[0].offsetWidth) + 14;
            R = Math.max(220, w / (2 * Math.tan(Math.PI / n)));
        }
        function norm(a) { a = a % 360; return a < 0 ? a + 360 : a; }

        function render() {
            var best = 0, bd = 999;
            for (var i = 0; i < n; i++) {
                var a = norm(i * step + rot);
                var d = Math.min(a, 360 - a);
                var f = Math.max(0, Math.cos(a * Math.PI / 180));
                els[i].style.transform = 'rotateY(' + (i * step) + 'deg) translateZ(' + R + 'px)';
                els[i].style.setProperty('--f', f.toFixed(3));
                if (d < bd) { bd = d; best = i; }
            }
            ring.style.transform = 'translateZ(' + (-R) + 'px) rotateY(' + (-rot) + 'deg)';
            if (best !== active) {
                if (active > -1) els[active].classList.remove('is-front');
                active = best;
                els[best].classList.add('is-front');
                nameEl.textContent = items[best].name;
                descEl.textContent = items[best].desc;
            }
        }

        function goTo(i, instant) {
            var target = i * step, cur = norm(rot), diff = ((target - cur + 540) % 360) - 180;
            animateTo(rot + diff, instant ? 0 : 700);
        }
        function animateTo(to, dur, ease) {
            cancelAnimationFrame(tween && tween.id);
            vel = 0;
            var from = rot, t0 = performance.now();
            if (!dur || reduced()) { rot = to; render(); return; }
            tween = { id: 0 };
            (function tick(now) {
                var p = Math.min(1, (now - t0) / dur);
                var e = ease ? ease(p) : 1 - Math.pow(1 - p, 3);
                rot = from + (to - from) * e; render();
                if (p < 1) tween.id = requestAnimationFrame(tick); else tween = null;
            })(t0);
            auto = false; clearTimeout(resume);
            resume = setTimeout(function () { auto = !reduced(); }, dur + 2500);
        }
        function snap() { animateTo(Math.round(rot / step) * step, 450); }

        function spin() {
            var turns = 2 + Math.floor(Math.random() * 2);
            var idx = Math.floor(Math.random() * n);
            var to = rot + turns * 360 + ((idx * step - norm(rot) + 360) % 360);
            animateTo(to, reduced() ? 0 : 3200, function (p) { return 1 - Math.pow(1 - p, 4); });
        }

        qs('[data-w="prev"]', host).addEventListener('click', function () { animateTo(Math.round(rot / step) * step - step, 450); });
        qs('[data-w="next"]', host).addEventListener('click', function () { animateTo(Math.round(rot / step) * step + step, 450); });
        qs('[data-w="spin"]', host).addEventListener('click', spin);
        stage.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowLeft') { e.preventDefault(); animateTo(Math.round(rot / step) * step - step, 400); }
            else if (e.key === 'ArrowRight') { e.preventDefault(); animateTo(Math.round(rot / step) * step + step, 400); }
        });

        stage.addEventListener('pointerdown', function (e) {
            dragging = true; moved = false; lastX = e.clientX; vel = 0;
            cancelAnimationFrame(tween && tween.id); tween = null; auto = false;
            stage.classList.add('is-drag');
            try { stage.setPointerCapture(e.pointerId); } catch (x) { /* noop */ }
        });
        stage.addEventListener('pointermove', function (e) {
            if (!dragging) return;
            var dx = e.clientX - lastX; lastX = e.clientX;
            if (Math.abs(dx) > 1) moved = true;
            rot -= dx * 0.35; vel = -dx * 0.35; render();
        });
        function end() {
            if (!dragging) return;
            dragging = false; stage.classList.remove('is-drag');
            setTimeout(function () { moved = false; }, 0);
            clearTimeout(resume);
            resume = setTimeout(function () { auto = !reduced(); }, 2500);
        }
        stage.addEventListener('pointerup', end);
        stage.addEventListener('pointercancel', end);

        (function loop() {
            if (visible && !document.hidden && !tween && !dragging) {
                if (Math.abs(vel) > 0.02) { rot += vel; vel *= 0.94; render(); if (Math.abs(vel) < 0.05) { vel = 0; snap(); } }
                else if (auto) { rot += 0.12; render(); }
            }
            requestAnimationFrame(loop);
        })();

        /* Cambio de vista */
        var btns = qsa('.view-btn', toggle), pill = qs('.view-pill', toggle);
        function placePill() {
            var on = btns.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; })[0];
            if (!on || !pill) return;
            pill.style.width = on.offsetWidth + 'px';
            pill.style.transform = 'translateX(' + (on.offsetLeft - 4) + 'px)';
        }
        function setView(v) {
            var wheel = v === 'wheel';
            btns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-view') === v)); });
            if (tabs) tabs.hidden = wheel;
            rows.hidden = wheel;
            host.hidden = !wheel;
            placePill();
            if (wheel) { size(); render(); }
            else { document.dispatchEvent(new CustomEvent('tools:relayout')); }
            if (window.ScrollTrigger) setTimeout(function () { window.ScrollTrigger.refresh(); }, 50);
        }
        btns.forEach(function (b) { b.addEventListener('click', function () { setView(b.getAttribute('data-view')); }); });

        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }, { rootMargin: '80px' }).observe(stage);
        } else { visible = true; }
        window.addEventListener('resize', function () { size(); render(); placePill(); });
        size(); render(); placePill();
        window.addEventListener('load', placePill);
    }

    /* ------------------ Línea de trayectoria que se dibuja ------------- */
    function timelineDraw() {
        var bodies = qsa('.tl-body');
        if (!bodies.length || reduced()) return;
        var ticking = false;
        function update() {
            var vh = window.innerHeight;
            bodies.forEach(function (b) {
                var r = b.getBoundingClientRect();
                var p = Math.max(0, Math.min(1, (vh * 0.78 - r.top) / Math.max(1, r.height)));
                b.style.setProperty('--draw', p.toFixed(3));
                b.classList.toggle('is-lit', p > 0.02);
            });
            ticking = false;
        }
        window.addEventListener('scroll', function () {
            if (!ticking) { ticking = true; requestAnimationFrame(update); }
        }, { passive: true });
        window.addEventListener('resize', update);
        update();
    }

    function init() {
        try { buildMarquee(); } catch (e) { /* noop */ }
        try { brandChips(); } catch (e) { /* noop */ }
        try { buildWheel(); } catch (e) { /* noop */ }
        try { timelineDraw(); } catch (e) { /* noop */ }
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();