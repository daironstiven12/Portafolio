/* ==========================================================================
   section-titles.js — Revelado por palabra de los titulares de sección
   --------------------------------------------------------------------------
   · Divide CADA .section-title de texto plano en palabras envueltas en
     <span class="st-word" data-reveal>, que heredan el trato de [data-reveal]
     de main.css: estado inicial oculto SOLO con JS activo, visible con
     movimiento reducido y siempre visible al imprimir.
   · Sin JS el texto no se toca: sigue siendo texto plano y legible. Para
     lectores de pantalla el contenido es idéntico (palabras contiguas con
     sus espacios, sin aria-hidden ni duplicados).
   · Si el titular trae marcado interno (un <span> de color, por ejemplo) se
     conserva sin dividir.
   · Sin GSAP o con prefers-reduced-motion no se divide nada.
   ========================================================================== */
(function () {
    'use strict';

    var titles = Array.prototype.slice.call(document.querySelectorAll('.section-title'));
    if (!titles.length) return;

    /* Sin GSAP no hay animación posible: no se toca el texto para que
       nunca quede un titular oculto de forma irreversible. */
    if (!window.gsap || !window.ScrollTrigger) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    function esc(v) {
        return String(v)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    var gsap = window.gsap;
    gsap.registerPlugin(window.ScrollTrigger);

    titles.forEach(function (title) {
        /* Solo texto plano: si hay elementos hijos, se deja tal cual. */
        var hasMarkup = Array.prototype.some.call(title.childNodes, function (node) {
            return node.nodeType !== 3;
        });
        if (hasMarkup) return;

        var text = (title.textContent || '').replace(/\s+/g, ' ').trim();
        if (!text) return;

        var words = text.split(' ').map(function (w) {
            return '<span class="st-word" data-reveal>' + esc(w) + '</span>';
        });
        title.innerHTML = words.join(' ');

        var spans = title.querySelectorAll('.st-word');
        gsap.fromTo(spans, { opacity: 0, y: 16 }, {
            opacity: 1,
            y: 0,
            duration: 0.45,
            ease: 'power2.out',
            stagger: 0.055,
            scrollTrigger: { trigger: title, start: 'top 88%', once: true }
        });
    });

    /* La división cambia la métrica del texto: se recalculan los triggers */
    function refresh() {
        try { window.ScrollTrigger.refresh(); } catch (e) { /* noop */ }
    }
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
    window.addEventListener('load', refresh, { once: true });
})();
