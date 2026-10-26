/* ==========================================================================
   hero-depth.js — Inclinación 3D de la ficha del hero
   --------------------------------------------------------------------------
   · Solo con puntero fino (matchMedia '(hover: hover) and (pointer: fine)'):
     nunca en táctil.
   · Se desactiva con prefers-reduced-motion y se restablece si el usuario
     activa esa preferencia durante la sesión.
   · Escribe --tilt-x / --tilt-y (grados) y --glide-x / --glide-y (px) en
     .hero-media; el CSS (css/components.css) hace el resto. Sin estilos
     en línea: únicamente style.setProperty, compatible con style-src 'self'.
   · La inclinación se aplica a los hijos de .hero-media para no competir
     con la transformación que GSAP anima en el contenedor.
   ========================================================================== */
(function () {
    'use strict';

    var media = document.querySelector('.hero-media');
    if (!media) return;

    var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    var MAX_TILT = 6;   /* grados: suficiente para dar volumen sin marear */
    var MAX_GLIDE = 16; /* px de desplazamiento del halo */

    var x = 0, y = 0, frame = null;

    function enabled() { return fine.matches && !reduce.matches; }

    function write(nx, ny) {
        x = nx;
        y = ny;
        media.style.setProperty('--tilt-x', (-y * MAX_TILT).toFixed(2) + 'deg');
        media.style.setProperty('--tilt-y', (x * MAX_TILT).toFixed(2) + 'deg');
        media.style.setProperty('--glide-x', (x * MAX_GLIDE).toFixed(1) + 'px');
        media.style.setProperty('--glide-y', (y * MAX_GLIDE).toFixed(1) + 'px');
    }

    function rest() {
        if (frame) { window.cancelAnimationFrame(frame); frame = null; }
        write(0, 0);
    }

    media.addEventListener('pointermove', function (e) {
        if (!enabled() || e.pointerType === 'touch' || e.buttons) return;
        if (frame) return;
        frame = window.requestAnimationFrame(function () {
            frame = null;
            var r = media.getBoundingClientRect();
            if (!r.width || !r.height) return;
            write(
                Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width - 0.5) * 2)),
                Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height - 0.5) * 2))
            );
        });
    });

    media.addEventListener('pointerleave', rest);
    media.addEventListener('pointercancel', rest);

    if (reduce.addEventListener) {
        reduce.addEventListener('change', function (e) { if (e.matches) rest(); });
    }
    if (fine.addEventListener) {
        fine.addEventListener('change', function (e) { if (!e.matches) rest(); });
    }
})();
