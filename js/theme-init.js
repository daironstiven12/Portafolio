/* ==========================================================================
   theme-init.js — se ejecuta ANTES del primer pintado
   --------------------------------------------------------------------------
   Aplica el tema guardado (o el del sistema) sin parpadeo.

   Vive en un archivo externo y no como <script> en línea para que la
   Content Security Policy pueda limitar script-src a 'self' y no necesitar
   'unsafe-inline'. Si mueves este código al HTML, la CSP bloqueará el tema.
   ========================================================================== */
(function () {
    try {
        // Sin JS esta clase se queda y css/loader.css oculta la pantalla de
        // carga (la CSP no permite el <style> en línea de <noscript>).
        document.documentElement.classList.remove('no-js');

        var saved = localStorage.getItem('theme');
        var prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        if (saved === 'light' || (saved === null && prefersLight)) {
            document.documentElement.classList.add('light-theme');
        }
    } catch (e) { /* almacenamiento no disponible */ }
})();
