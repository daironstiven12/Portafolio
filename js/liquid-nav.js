/* ==========================================================================
   liquid-nav.js — Barra de navegación «Liquid Glass»
   --------------------------------------------------------------------------
   Solo añade comportamiento visual; no toca la lógica de main.js:
   · Píldora deslizante que sigue al enlace activo (.is-active, que ya marca
     main.js) y se adelanta al enlace sobre el que está el puntero.
   · Brillo que sigue al puntero dentro de la barra.
   Sin dependencias y sin estilos en línea de CSP: solo propiedades de
   elemento (style.setProperty), compatibles con style-src 'self'.
   ========================================================================== */
(function () {
    'use strict';

    var inner = document.querySelector('.header-inner');
    var nav = document.getElementById('nav');
    if (!inner || !nav) return;

    var links = Array.prototype.slice.call(nav.querySelectorAll('.nav-link'));
    var desktop = window.matchMedia('(min-width: 1081px)');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var hovered = null;

    /* --- Píldora deslizante --- */
    var pill = document.createElement('span');
    pill.className = 'nav-pill';
    pill.setAttribute('aria-hidden', 'true');
    nav.appendChild(pill);

    function target() {
        return hovered || nav.querySelector('.nav-link.is-active');
    }

    function place() {
        var el = target();
        if (!desktop.matches || !el) {
            pill.classList.remove('is-ready');
            return;
        }
        var n = nav.getBoundingClientRect();
        var r = el.getBoundingClientRect();
        pill.style.width = r.width + 'px';
        pill.style.height = r.height + 'px';
        pill.style.transform = 'translate(' + (r.left - n.left) + 'px,' + (r.top - n.top) + 'px)';
        pill.classList.add('is-ready');
    }

    links.forEach(function (a) {
        a.addEventListener('pointerenter', function () { hovered = a; place(); });
        a.addEventListener('focus', function () { hovered = a; place(); });
        a.addEventListener('blur', function () { hovered = null; place(); });
    });
    nav.addEventListener('pointerleave', function () { hovered = null; place(); });

    /* main.js cambia .is-active al hacer scroll: se observa, no se duplica */
    var mo = new MutationObserver(place);
    links.forEach(function (a) {
        mo.observe(a, { attributes: true, attributeFilter: ['class'] });
    });

    window.addEventListener('resize', place);
    if (desktop.addEventListener) desktop.addEventListener('change', place);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    window.addEventListener('load', place);
    place();

    /* --- Brillo que sigue al puntero --- */
    if (reduce.matches) return;

    var glare = document.createElement('span');
    glare.className = 'liquid-glare';
    glare.setAttribute('aria-hidden', 'true');
    inner.insertBefore(glare, inner.firstChild);

    inner.addEventListener('pointermove', function (e) {
        var b = inner.getBoundingClientRect();
        inner.style.setProperty('--gx', (e.clientX - b.left) + 'px');
        inner.style.setProperty('--gy', (e.clientY - b.top) + 'px');
    });
})();