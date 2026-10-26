/* ==========================================================================
   cursor.js — Halo que acompaña al puntero (solo escritorio)
   --------------------------------------------------------------------------
   · Se crea únicamente con puntero fino ((hover: hover) and (pointer: fine))
     y sin prefers-reduced-motion; si el usuario cambia cualquiera de esas
     preferencias en caliente, el halo se monta o se retira solo.
   · Crece sobre botones, enlaces y tarjetas (clase .is-hot).
   · Nunca sustituye al cursor nativo: es una capa decorativa, aria-hidden y
     pointer-events: none, así que no toca la accesibilidad ni el foco.
   · Posición vía style.setProperty (--cx / --cy) y clases: compatible con
     style-src 'self'.
   ========================================================================== */
(function () {
    'use strict';

    var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    var HOT = 'a, button, .project-card, .tool-card, .cert-card, .spec, ' +
        '.filter-btn, .tool-tab, .tool-btn, .brand, .nav-link';

    var halo = null;
    var x = 0, y = 0, frame = null;

    function enabled() { return fine.matches && !reduce.matches; }

    function mount() {
        if (halo || !enabled() || !document.body) return;
        halo = document.createElement('div');
        halo.className = 'cursor-halo';
        halo.setAttribute('aria-hidden', 'true');
        halo.innerHTML = '<span class="cursor-halo-dot"></span>';
        document.body.appendChild(halo);
    }

    function unmount() {
        if (!halo) return;
        if (halo.parentNode) halo.parentNode.removeChild(halo);
        halo = null;
        frame = null;
    }

    function paint() {
        frame = null;
        if (!halo) return;
        halo.style.setProperty('--cx', x.toFixed(1) + 'px');
        halo.style.setProperty('--cy', y.toFixed(1) + 'px');
    }

    document.addEventListener('pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        if (!enabled()) { unmount(); return; }
        mount();
        if (!halo) return;

        x = e.clientX;
        y = e.clientY;
        if (!frame) frame = window.requestAnimationFrame(paint);
        halo.classList.add('is-on');

        var hot = e.target && e.target.closest ? e.target.closest(HOT) : null;
        halo.classList.toggle('is-hot', !!hot);
    }, { passive: true });

    /* Al salir del documento el halo desaparece en lugar de quedarse quieto */
    document.addEventListener('pointerout', function (e) {
        if (e.relatedTarget || !halo) return;
        halo.classList.remove('is-on', 'is-hot');
    });

    if (reduce.addEventListener) {
        reduce.addEventListener('change', function (e) { if (e.matches) unmount(); });
    }
    if (fine.addEventListener) {
        fine.addEventListener('change', function (e) { if (!e.matches) unmount(); });
    }
})();
