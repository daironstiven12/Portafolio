/* ==========================================================================
   effects.js — Efectos de interfaz (foco de luz + carrusel 3D de certificados)
   --------------------------------------------------------------------------
   No depende de main.js: observa el DOM que éste genera y lo mejora.
   Solo usa style.setProperty (compatible con la CSP style-src 'self').
   ========================================================================== */
(function () {
    'use strict';

    /* ---------- 1. Foco de luz que sigue al puntero ---------- */
    var SPOT = '.project-card, .cert-card, .tool-btn, .spec';
    document.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        var el = e.target.closest && e.target.closest(SPOT);
        if (!el) return;
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
        el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    }, { passive: true });

    /* ---------- 2. Carrusel 3D de certificados ---------- */
    var grid = document.querySelector('.cert-grid');
    if (!grid) return;

    var ring, slots = [], cur = 0, step = 0, rot = 0;
    var building = false;

    function cardWidth() {
        return Math.min(260, Math.max(200, window.innerWidth * 0.68));
    }

    function apply() {
        var n = slots.length;
        if (!ring || n < 3) return;
        rot = -cur * step;
        ring.style.setProperty('transform', 'rotateY(' + rot + 'deg)');
        var idx = ((cur % n) + n) % n;
        slots.forEach(function (s, i) { s.classList.toggle('is-front', i === idx); });
        var c = grid.parentNode.querySelector('.cert-count');
        if (c) c.textContent = (idx + 1) + ' / ' + n;
    }

    function go(d) { cur += d; apply(); }

    function build() {
        if (building) return;
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.cert-card'));
        if (cards.length < 3) return;            /* con 1-2 se queda la rejilla */
        building = true;
        var n = cards.length, cw = cardWidth();
        step = 360 / n;
        var radius = Math.round((cw / 2 + 24) / Math.tan(Math.PI / n));
        radius = Math.max(radius, cw * 0.9);

        grid.classList.add('is-carousel');
        grid.style.setProperty('--cw', cw + 'px');
        grid.style.setProperty('--r', radius + 'px');

        ring = document.createElement('div');
        ring.className = 'cert-ring';
        slots = cards.map(function (card, i) {
            var s = document.createElement('div');
            s.className = 'cert-slot';
            s.style.setProperty('--a', (i * step) + 'deg');
            s.appendChild(card);
            ring.appendChild(s);
            return s;
        });
        grid.textContent = '';
        grid.appendChild(ring);
        ring.style.setProperty('--cw', cw + 'px');
        ring.style.setProperty('--r', radius + 'px');
        slots.forEach(function (s) {
            s.style.setProperty('--cw', cw + 'px');
            s.style.setProperty('--r', radius + 'px');
        });

        if (!grid.parentNode.querySelector('.cert-nav')) {
            var nav = document.createElement('div');
            nav.className = 'cert-nav';
            nav.innerHTML =
                '<button type="button" data-d="-1" aria-label="Certificado anterior"><i class="ri-arrow-left-s-line" aria-hidden="true"></i></button>' +
                '<span class="cert-count" aria-live="polite"></span>' +
                '<button type="button" data-d="1" aria-label="Certificado siguiente"><i class="ri-arrow-right-s-line" aria-hidden="true"></i></button>';
            grid.appendChild(nav);
            nav.addEventListener('click', function (e) {
                var b = e.target.closest('button[data-d]');
                if (b) go(parseInt(b.dataset.d, 10));
            });
        }
        cur = 0;
        apply();
        building = false;
    }

    /* Clic en una tarjeta lateral: gira hasta ella en lugar de abrirla */
    grid.addEventListener('click', function (e) {
        if (!ring) return;
        var slot = e.target.closest('.cert-slot');
        if (!slot || slot.classList.contains('is-front')) return;
        e.stopImmediatePropagation();
        e.preventDefault();
        var n = slots.length, i = slots.indexOf(slot);
        var idx = ((cur % n) + n) % n;
        var d = i - idx;
        if (d > n / 2) d -= n;
        if (d < -n / 2) d += n;
        go(d);
    }, true);

    /* Arrastre / deslizamiento */
    var sx = null, moved = false;
    grid.addEventListener('pointerdown', function (e) {
        if (!ring || e.target.closest('.cert-nav')) return;
        sx = e.clientX; moved = false;
    });
    window.addEventListener('pointermove', function (e) {
        if (sx === null) return;
        var dx = e.clientX - sx;
        if (Math.abs(dx) > 6) { moved = true; grid.classList.add('is-dragging'); }
        if (moved) ring.style.setProperty('transform', 'rotateY(' + (rot + dx * 0.35) + 'deg)');
    });
    window.addEventListener('pointerup', function (e) {
        if (sx === null) return;
        var dx = e.clientX - sx; sx = null;
        grid.classList.remove('is-dragging');
        if (moved) {
            var d = Math.round(-dx * 0.35 / step);
            if (d === 0 && Math.abs(dx) > 40) d = dx < 0 ? 1 : -1;
            go(d);
            grid.addEventListener('click', function stop(ev) {
                ev.stopImmediatePropagation(); ev.preventDefault();
            }, { capture: true, once: true });
        }
    });

    document.addEventListener('keydown', function (e) {
        if (!ring || !grid.contains(document.activeElement)) return;
        if (e.key === 'ArrowLeft') go(-1);
        if (e.key === 'ArrowRight') go(1);
    });

    /* Reconstruye si main.js (re)genera las tarjetas */
    new MutationObserver(function () {
        if (!building && !grid.classList.contains('is-carousel') &&
            grid.querySelectorAll('.cert-card').length) build();
        else if (!building && grid.classList.contains('is-carousel') && !grid.querySelector('.cert-ring')) {
            grid.classList.remove('is-carousel'); ring = null; build();
        }
    }).observe(grid, { childList: true });

    var rt;
    window.addEventListener('resize', function () {
        clearTimeout(rt);
        rt = setTimeout(function () {
            if (!ring) return;
            var cards = slots.map(function (s) { return s.querySelector('.cert-card'); });
            grid.classList.remove('is-carousel');
            grid.textContent = '';
            cards.forEach(function (c) { grid.appendChild(c); });
            ring = null;
        }, 200);
    });

    build();
})();