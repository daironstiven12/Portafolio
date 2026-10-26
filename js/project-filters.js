/* ==========================================================================
   project-filters.js — Filtros de la sección Proyectos
   --------------------------------------------------------------------------
   · Genera los botones desde las categorías REALES (campo opcional `filter`
     de cada proyecto en js/data.js), nunca desde una lista fija.
   · Con una sola categoría (o sin ninguna) no se muestran los filtros.
   · Píldora deslizante al estilo de js/liquid-nav.js y entrada/salida de
     tarjetas con GSAP.
   · Sin estilos en línea: la visibilidad se gestiona con la clase
     .is-filtered (css/components.css) y las propiedades animadas con GSAP.
   ========================================================================== */
(function () {
    'use strict';

    var host = document.querySelector('[data-project-filters]');
    var grid = document.querySelector('[data-render="projects"]');
    if (!host || !grid) return;

    var SITE = window.SITE || {};
    var projects = Array.isArray(SITE.projects) ? SITE.projects : [];
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    function val(v) {
        return typeof v === 'string' ? v.trim() : (v == null ? '' : String(v).trim());
    }

    function esc(v) {
        return val(v)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /* --- Categorías reales, en orden de aparición --- */
    var cats = [];
    projects.forEach(function (p) {
        var v = p ? val(p.filter) : '';
        if (v && cats.indexOf(v) === -1) cats.push(v);
    });

    /* Una sola categoría => el filtro no aporta nada: no se muestra. */
    if (cats.length < 2) {
        host.hidden = true;
        return;
    }

    var labels = ['Todos'].concat(cats);

    host.innerHTML =
        '<span class="filters-pill" aria-hidden="true"></span>' +
        labels.map(function (label, i) {
            return '<button class="filter-btn' + (i === 0 ? ' is-active' : '') + '"' +
                ' type="button" data-value="' + (i === 0 ? '' : esc(label)) + '"' +
                ' aria-pressed="' + (i === 0 ? 'true' : 'false') + '">' +
                esc(label) + '</button>';
        }).join('') +
        '<p class="sr-only" role="status" data-filter-status></p>';

    var pill = host.querySelector('.filters-pill');
    var buttons = Array.prototype.slice.call(host.querySelectorAll('.filter-btn'));
    var status = host.querySelector('[data-filter-status]');
    var active = buttons[0];

    /* --- Píldora deslizante --- */
    function place() {
        if (!active || !pill) return;
        var h = host.getBoundingClientRect();
        var r = active.getBoundingClientRect();
        pill.style.width = r.width + 'px';
        pill.style.height = r.height + 'px';
        pill.style.transform = 'translate(' + (r.left - h.left) + 'px,' + (r.top - h.top) + 'px)';
        pill.classList.add('is-ready');
    }

    /* --- Filtrado de tarjetas --- */
    function apply(cat) {
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.project-card'));
        var show = [];
        var hide = [];

        cards.forEach(function (c) {
            var v = val(c.getAttribute('data-filter'));
            if (!cat || v === cat) show.push(c);
            else hide.push(c);
        });

        function finishHidden() {
            hide.forEach(function (c) { c.classList.add('is-filtered'); });
        }

        if (reduce.matches || !window.gsap) {
            /* Sin animación: solo clases. El CSS de reduced-motion ya deja
               [data-reveal] en opacity 1, así que nada queda invisible. */
            hide.forEach(function (c) { c.classList.add('is-filtered'); });
        } else {
            window.gsap.killTweensOf(cards);
            if (hide.length) {
                window.gsap.to(hide, {
                    autoAlpha: 0,
                    y: 10,
                    duration: 0.22,
                    ease: 'power2.in',
                    onComplete: finishHidden
                });
            } else {
                finishHidden();
            }
        }

        show.forEach(function (c) { c.classList.remove('is-filtered'); });

        if (show.length && !reduce.matches && window.gsap) {
            window.gsap.fromTo(show, { autoAlpha: 0, y: 10 }, {
                autoAlpha: 1,
                y: 0,
                duration: 0.34,
                ease: 'power2.out',
                stagger: 0.04,
                overwrite: true
            });
        }

        if (status) {
            status.textContent = show.length + (show.length === 1
                ? ' proyecto mostrado.'
                : ' proyectos mostrados.');
        }
    }

    /* --- Interacción --- */
    buttons.forEach(function (btn) {
        btn.addEventListener('click', function () {
            if (btn === active) return;
            active = btn;
            buttons.forEach(function (b) {
                var on = b === btn;
                b.classList.toggle('is-active', on);
                b.setAttribute('aria-pressed', String(on));
            });
            place();
            apply(val(btn.getAttribute('data-value')));
        });
    });

    window.addEventListener('resize', place);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    window.addEventListener('load', place);
    place();
})();
