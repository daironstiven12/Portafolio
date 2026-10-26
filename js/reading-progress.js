/* ==========================================================================
   reading-progress.js — Progreso de lectura en la barra de navegación
   --------------------------------------------------------------------------
   · Línea de 2px anclada al borde inferior del «Liquid Glass» (se inserta
     dentro de .header-inner, que ya es position: relative).
   · Porcentaje calculado sobre el alto real del documento; se actualiza con
     requestAnimationFrame y escucha de scroll pasiva, como el resto del sitio.
   · Expone role="progressbar" con aria-valuenow entero (sin aria-live: no
     interrumpe al lector de pantalla en cada scroll).
   · Solo estilos de elemento: style.setProperty, compatible con style-src.
   ========================================================================== */
(function () {
    'use strict';

    var inner = document.querySelector('.header-inner');
    if (!inner) return;

    var bar = document.createElement('div');
    bar.className = 'read-progress';
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-label', 'Progreso de lectura');
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', '100');
    bar.setAttribute('aria-valuenow', '0');

    var fill = document.createElement('span');
    fill.className = 'read-progress-fill';
    bar.appendChild(fill);
    inner.appendChild(bar);

    var ticking = false;
    var lastShown = -1;

    function update() {
        ticking = false;

        var doc = document.documentElement;
        var scrollable = doc.scrollHeight - window.innerHeight;
        var pct = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
        pct = Math.min(100, Math.max(0, pct));

        bar.style.setProperty('--read', pct.toFixed(2) + '%');

        var rounded = Math.round(pct);
        if (rounded !== lastShown) {
            lastShown = rounded;
            bar.setAttribute('aria-valuenow', String(rounded));
        }
    }

    function schedule() {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('load', schedule, { once: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
    update();
})();
