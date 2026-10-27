/* ==========================================================================
   loader.js — Pantalla de carga de marca
   --------------------------------------------------------------------------
   · Preloader inicial: se muestra desde el HTML y se retira cuando la
     página terminó de cargar (con un mínimo de 1,15 s para que la
     animación se aprecie y un máximo de 6 s por seguridad).
   · Transición a proyectos: intercepta los enlaces de las tarjetas y del
     modal de proyecto y abre el sitio en una pestaña nueva que muestra
     primero la misma pantalla de carga (así el portafolio no se queda
     esperando a un sitio externo lento). Si el navegador bloquea la
     pestaña, navega en la misma tras una espera corta.
     Ctrl/Cmd/Shift, clic central o «descargar» no se interceptan.
   · API pública: window.PageLoader.show / hide / navigate / whenReady.
   ========================================================================== */

(function () {
    'use strict';

    var doc = document;
    var root = doc.documentElement;
    var el = doc.getElementById('page-loader');
    if (!el) return;

    var labelEl = el.querySelector('.page-loader-label-text');
    var destEl = doc.getElementById('page-loader-dest');
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    var started = Date.now();
    var MIN_VISIBLE = 1150;   // duración mínima del preloader inicial
    var MAX_VISIBLE = 6000;   // tope por si un recurso tarda demasiado
    var ready = false;
    var readyCallbacks = [];
    var hideTimer = null;

    /* ----------------------------- textos ------------------------------- */

    function txt(key, fallback) {
        if (window.I18N && typeof window.I18N.t === 'function') {
            var value = window.I18N.t(key);
            if (value && value !== key) return value;
        }
        return fallback;
    }

    function setLabel(text) {
        if (labelEl && text) labelEl.textContent = text;
    }

    function setDestination(url) {
        if (!destEl) return;
        if (!url) {
            destEl.hidden = true;
            destEl.textContent = '';
            return;
        }

        var shown = url;
        try {
            shown = new URL(url, window.location.href).hostname.replace(/^www\./i, '');
        } catch (err) { /* se deja la URL completa */ }

        destEl.textContent = shown;
        destEl.hidden = !shown;
    }

    /* ------------------------- ciclo de vida ---------------------------- */

    function markReady() {
        if (ready) return;
        ready = true;

        for (var i = 0; i < readyCallbacks.length; i++) {
            try { readyCallbacks[i](); } catch (err) { /* noop */ }
        }
        readyCallbacks = [];

        doc.dispatchEvent(new CustomEvent('pageloader:done'));
    }

    function whenReady(callback) {
        if (typeof callback !== 'function') return;
        if (ready) callback();
        else readyCallbacks.push(callback);
    }

    function hide() {
        if (!el || el.classList.contains('is-done')) return;

        el.classList.add('is-done');
        el.classList.remove('is-active');
        root.classList.remove('is-loading');
        setDestination('');
        setLabel(txt('loader.loading', 'Cargando'));
        markReady();
    }

    function hideInitialWhenReady() {
        var elapsed = Date.now() - started;
        clearTimeout(hideTimer);
        hideTimer = setTimeout(hide, Math.max(0, MIN_VISIBLE - elapsed));
    }

    function show(options) {
        options = options || {};
        if (!el) return;

        clearTimeout(hideTimer);
        el.classList.remove('is-done');
        el.classList.add('is-active');
        root.classList.add('is-loading');

        setLabel(options.label || txt('loader.loading', 'Cargando'));
        setDestination(options.destination || '');

        /* Reinicia la entrada de la marca al reutilizar la pantalla */
        if (!reduceMotion.matches && el.animate) {
            var mark = el.querySelector('.page-loader-mark');
            if (mark) {
                mark.animate(
                    [
                        { opacity: 0, transform: 'scale(0.86)' },
                        { opacity: 1, transform: 'scale(1)' }
                    ],
                    { duration: 420, easing: 'cubic-bezier(0.2, 0.6, 0.3, 1)' }
                );
            }
        }
    }

    /* ------------------------- navegación ------------------------------- */

    function shownDestination(url) {
        var shown = url;
        try {
            shown = new URL(url, window.location.href).hostname.replace(/^www\./i, '');
        } catch (err) { /* se deja la URL completa */ }
        return shown;
    }

    function navigate(url, options) {
        options = options || {};
        var delay = typeof options.delay === 'number' ? options.delay : 950;

        show({
            label: options.label || txt('loader.opening', 'Abriendo'),
            destination: url
        });

        /* Red de seguridad: si la navegación no ocurre, se retira la capa */
        setTimeout(function () {
            if (doc.visibilityState === 'visible') hide();
        }, delay + 4500);

        setTimeout(function () {
            window.location.href = url;
        }, reduceMotion.matches ? 120 : delay);
    }

    /* Abre el proyecto en una pestaña nueva con la misma pantalla de carga.
       Se abre la pestaña de forma síncrona dentro del clic para que el
       navegador no la bloquee; así el portafolio nunca se queda esperando
       a que responda un sitio externo lento. */
    function openProjectTab(url, label) {
        var win = null;
        try { win = window.open('about:blank', '_blank'); } catch (err) { win = null; }
        if (!win || win.closed) return false;

        /* Sin acceso inverso a la ventana del portafolio. */
        try { win.opener = null; } catch (err) { /* noop */ }

        var destination = shownDestination(url);
        var tokensHref = new URL('css/tokens.css', document.baseURI).href;
        var loaderHref = new URL('css/loader.css', document.baseURI).href;
        var themeClass = root.classList.contains('light-theme') ? ' light-theme' : '';
        var lang = root.lang || 'es';

        var clone = el.cloneNode(true);
        clone.classList.remove('is-done');
        clone.classList.add('is-active');

        try {
            var wdoc = win.document;
            wdoc.open();
            wdoc.write(
                '<!DOCTYPE html><html lang="' + lang + '" class="' + themeClass.trim() + '">' +
                '<head><meta charset="utf-8">' +
                '<meta name="viewport" content="width=device-width, initial-scale=1">' +
                '<title></title>' +
                '<link rel="stylesheet" href="' + tokensHref + '">' +
                '<link rel="stylesheet" href="' + loaderHref + '">' +
                '</head><body>' + clone.outerHTML + '</body></html>'
            );
            wdoc.close();

            var wlabel = wdoc.querySelector('.page-loader-label-text');
            if (wlabel) wlabel.textContent = label;

            var wdest = wdoc.querySelector('#page-loader-dest');
            if (wdest) {
                wdest.textContent = destination;
                wdest.hidden = !destination;
            }

            wdoc.title = label + (destination ? ' · ' + destination : '');

            setTimeout(function () {
                try {
                    win.location.replace(url);
                } catch (err) {
                    try { win.location.href = url; } catch (e) { /* noop */ }
                }
            }, reduceMotion.matches ? 100 : 400);

            return true;
        } catch (err) {
            /* Si no se pudo escribir el loader, al menos navega la pestaña. */
            try { win.location.href = url; } catch (e) { /* noop */ }
            return true;
        }
    }

    /* ------------------------- inicialización --------------------------- */

    function init() {
        setLabel(txt('loader.loading', 'Cargando'));

        if (doc.readyState === 'complete') hideInitialWhenReady();
        else window.addEventListener('load', hideInitialWhenReady, { once: true });

        /* Nunca dejar la portada bloqueada más de MAX_VISIBLE */
        setTimeout(function () {
            if (!ready) hideInitialWhenReady();
        }, MAX_VISIBLE);

        /* Al volver con el botón Atrás desde la caché del navegador */
        window.addEventListener('pageshow', function (event) {
            if (event.persisted) hide();
        });

        /* Enlaces que pueden mostrar la transición: tarjetas de proyecto,
           modal de proyecto o cualquier enlace marcado con data-loader. */
        doc.addEventListener('click', function (event) {
            if (event.defaultPrevented || event.button !== 0) return;
            if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

            var link = event.target && event.target.closest
                ? event.target.closest('a[href]')
                : null;
            if (!link) return;

            var isProject = link.hasAttribute('data-loader') ||
                link.closest('.project-card') ||
                link.closest('#project-dialog');
            if (!isProject) return;

            if (link.hasAttribute('download') || link.hasAttribute('data-no-loader')) return;

            var hrefAttr = link.getAttribute('href') || '';
            if (!hrefAttr || hrefAttr.charAt(0) === '#' ||
                /^(mailto:|tel:|javascript:)/i.test(hrefAttr)) return;

            var url;
            try { url = new URL(link.href, window.location.href); } catch (err) { return; }
            if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

            /* Un enlace interno del propio sitio se deja pasar */
            if (url.origin === window.location.origin) return;

            event.preventDefault();

            /* El <dialog> abierto vive en el top layer y taparía la pantalla
               de carga: se cierra antes de iniciar la transición. */
            var parentDialog = link.closest('dialog');
            if (parentDialog && parentDialog.open) {
                try { parentDialog.close(); } catch (err) { /* noop */ }
            }

            var label = txt('loader.opening', 'Abriendo');

            /* Pestaña nueva con el loader dentro. Si el navegador la bloquea,
               se usa la misma pestaña con una espera corta. */
            if (!openProjectTab(url.href, label)) {
                navigate(url.href, { delay: reduceMotion.matches ? 100 : 450 });
            }
        }, true);
    }

    /* --------------------------- API pública ---------------------------- */

    window.PageLoader = {
        show: show,
        hide: hide,
        navigate: navigate,
        whenReady: whenReady,
        isReady: function () { return ready; }
    };

    init();
})();
