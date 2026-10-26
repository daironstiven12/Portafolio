/* ==========================================================================
   hero-stats.js — Estadísticas del hero
   --------------------------------------------------------------------------
   · Los números salen de js/data.js: proyectos publicados y certificados se
     cuentan desde sus listas; `stats.studyYears` es un dato declarado.
   · Nada inventado y nada vacío: un valor 0 o ausente no se pinta.
   · El texto final está en el HTML desde el primer momento (funciona sin
     GSAP); con GSAP y movimiento normal, el número sube al entrar en
     pantalla con ScrollTrigger.
   · Sin estilos en línea: solo clases y textContent.
   ========================================================================== */
(function () {
    'use strict';

    var box = document.querySelector('[data-render="stats"]');
    if (!box) return;

    var SITE = window.SITE || {};
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    function val(v) {
        return typeof v === 'string' ? v.trim() : (v == null ? '' : String(v).trim());
    }

    function arr(v) { return Array.isArray(v) ? v : []; }

    function esc(v) {
        return val(v)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    var stats = [];

    var projects = arr(SITE.projects).filter(function (p) { return p && val(p.title); });
    if (projects.length) {
        stats.push({ value: projects.length, label: 'Proyectos publicados' });
    }

    var certificates = arr(SITE.certificates).filter(function (c) { return c && val(c.title); });
    if (certificates.length) {
        stats.push({ value: certificates.length, label: 'Certificados' });
    }

    var study = parseInt(val(SITE.stats && SITE.stats.studyYears), 10);
    if (isFinite(study) && study > 0) {
        stats.push({ value: study, label: 'Años de estudio' });
    }

    if (!stats.length) {
        box.hidden = true;
        return;
    }

    box.innerHTML = stats.map(function (s) {
        return '<li class="stat" data-reveal>' +
            '<span class="stat-value" data-target="' + s.value + '">' + s.value + '</span>' +
            '<span class="stat-label">' + esc(s.label) + '</span>' +
            '</li>';
    }).join('');

    /* Sin GSAP o con movimiento reducido se queda el número final tal cual */
    if (reduce.matches || !window.gsap || !window.ScrollTrigger) return;

    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    var items = box.querySelectorAll('.stat');

    gsap.fromTo(items, { opacity: 0, y: 14 }, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
        stagger: 0.1,
        scrollTrigger: { trigger: box, start: 'top 94%', once: true }
    });

    box.querySelectorAll('.stat-value').forEach(function (el) {
        var target = parseInt(el.getAttribute('data-target'), 10);
        if (!isFinite(target) || target <= 0) return;
        var counter = { v: 0 };
        gsap.to(counter, {
            v: target,
            duration: 1.1,
            ease: 'power1.out',
            scrollTrigger: { trigger: box, start: 'top 94%', once: true },
            onUpdate: function () { el.textContent = String(Math.round(counter.v)); }
        });
    });
})();
