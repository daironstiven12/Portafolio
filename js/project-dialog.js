/* ==========================================================================
   project-dialog.js — Modal de detalle de proyecto
   --------------------------------------------------------------------------
   · <dialog> con el mismo lenguaje visual que el lightbox de certificados.
   · Se abre desde cualquier tarjeta (clic en el cuerpo o botón «Detalle»)
     o con el evento 'project:detail' que despacha js/main.js.
   · Cierra con Esc (nativo del <dialog>), clic fuera y botón de cierre.
   · Devuelve el foco a la tarjeta que lo abrió.
   · Contenido: descripción, tecnologías y enlaces Demo / Código / Vista
     previa. Los enlaces que falten en js/data.js simplemente no se pintan.
   ========================================================================== */
(function () {
    'use strict';

    var dialog = document.getElementById('project-dialog');
    if (!dialog || typeof dialog.showModal !== 'function') return;

    var SITE = window.SITE || {};
    var projects = Array.isArray(SITE.projects) ? SITE.projects : [];

    var img = document.getElementById('project-dialog-img');
    var media = dialog.querySelector('[data-dialog-media]');
    var meta = document.getElementById('project-dialog-meta');
    var title = document.getElementById('project-dialog-title');
    var desc = document.getElementById('project-dialog-desc');
    var tech = document.getElementById('project-dialog-tech');
    var demo = document.getElementById('project-dialog-demo');
    var repo = document.getElementById('project-dialog-repo');
    var preview = document.getElementById('project-dialog-preview');

    var opener = null;

    function val(v) {
        return typeof v === 'string' ? v.trim() : (v == null ? '' : String(v).trim());
    }

    function arr(v) { return Array.isArray(v) ? v : []; }
    function has(v) { return val(v) !== ''; }

    function esc(v) {
        return val(v)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /* Traduce una clave de js/i18n.js; si no existe, usa el valor de data.js. */
    function localized(key, fallback) {
        if (window.I18N && typeof window.I18N.t === 'function') {
            var text = window.I18N.t(key);
            if (text && text !== key) return text;
        }
        return val(fallback);
    }

    /* Un enlace que no tenga dato en data.js no se pinta */
    function setLink(el, url) {
        if (!el) return;
        if (has(url)) {
            el.href = val(url);
            el.hidden = false;
        } else {
            el.removeAttribute('href');
            el.hidden = true;
        }
    }

    /* Elemento del que vino el foco: el botón si lo hubo, si no la tarjeta */
    function focusableFrom(el) {
        if (!el) return null;
        if (el.matches('a[href], button, [tabindex]')) return el;
        var card = el.closest ? el.closest('.project-card') : null;
        if (!card) return null;
        return card.querySelector('[data-project-detail]') ||
            card.querySelector('.project-title a') ||
            card;
    }

    function open(card, control) {
        var p = projects[Number(card.getAttribute('data-project'))];
        if (!p) return;

        var baseKey = 'project.' + (val(p.id) || card.getAttribute('data-project'));
        var projectTitle = localized(baseKey + '.title', p.title);
        var projectDesc = localized(baseKey + '.desc', p.description);
        var projectCategory = localized(baseKey + '.category', p.category);
        var projectStatus = localized(baseKey + '.status', p.status);

        /* --- Metadatos: categoría, estado y año, solo si existen --- */
        var parts = [];
        if (has(projectCategory)) parts.push(val(projectCategory));
        if (has(projectStatus)) parts.push(val(projectStatus));
        if (has(p.year)) parts.push(val(p.year));
        meta.textContent = parts.join(' · ');
        meta.hidden = !parts.length;

        title.textContent = projectTitle;

        desc.textContent = projectDesc;
        desc.hidden = !has(projectDesc);

        /* --- Tecnologías --- */
        var list = arr(p.technologies).filter(has);
        tech.innerHTML = list.map(function (t) {
            return '<li class="chip">' + esc(t) + '</li>';
        }).join('');
        tech.hidden = !list.length;

        /* --- Imagen de vista previa --- */
        if (has(p.image)) {
            img.src = val(p.image);
            img.alt = localized('project.media.preview', 'Vista previa de') + ' ' + projectTitle;
            media.hidden = false;
        } else {
            img.removeAttribute('src');
            img.alt = '';
            media.hidden = true;
        }

        /* --- Enlaces: solo los que existan en data.js --- */
        setLink(demo, p.demoUrl);
        setLink(repo, p.repoUrl);
        setLink(preview, p.previewUrl);

        opener = control || card;
        dialog.showModal();
    }

    /* Tarjeta => detalle (evento que despacha main.js) */
    document.addEventListener('project:detail', function (e) {
        var card = e.target && e.target.closest ? e.target.closest('.project-card') : null;
        if (card) open(card);
    });

    /* Botón «Detalle» de cada tarjeta */
    document.addEventListener('click', function (e) {
        var btn = e.target && e.target.closest ? e.target.closest('[data-project-detail]') : null;
        if (!btn) return;
        var card = btn.closest('.project-card');
        if (card) open(card, btn);
    });

    /* Cierre: botón y clic fuera (Esc lo gestiona el propio <dialog>) */
    dialog.addEventListener('click', function (e) {
        if (e.target.closest && e.target.closest('[data-dialog-close]')) {
            dialog.close();
            return;
        }
        if (e.target === dialog) dialog.close();
    });

    /* Devolución de foco: al botón «Detalle» o al primer control de la
       tarjeta de origen, para que el teclado siga donde lo dejó. */
    dialog.addEventListener('close', function () {
        var target = focusableFrom(opener);
        if (target && document.contains(target) && typeof target.focus === 'function') {
            target.focus();
        }
        opener = null;
    });
})();
